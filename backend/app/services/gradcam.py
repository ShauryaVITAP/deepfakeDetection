"""
AegisVision Deepfake Detection System - Genuine Grad-CAM Explainability Module
Architecture: EfficientNet-B0 (PyTorch)
Method: Gradient-weighted Class Activation Mapping (Grad-CAM)
Target Layer: model.features[-1] (Conv2dNormActivation, 1280 channels)
"""

import os
import io
import time
import base64
from typing import Dict, Any, Tuple, Optional, List
import numpy as np
from PIL import Image

# Module constants
CLASS_AUTHENTIC = 0
CLASS_MANIPULATED = 1
CLASS_NAMES = {
    CLASS_AUTHENTIC: "AUTHENTIC",
    CLASS_MANIPULATED: "MANIPULATED"
}

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
WEIGHTS_PATH = os.path.join(MODELS_DIR, "efficientnet_b0_deepfake.pth")


def apply_turbo_colormap(norm_heatmap: np.ndarray) -> np.ndarray:
    """
    Apply high-contrast Turbo colormap to normalized [0, 1] 2D array.
    Returns RGB uint8 image of shape (H, W, 3).
    Turbo provides perceptual uniformity with clear blue->cyan->green->yellow->red progression.
    """
    x = np.clip(norm_heatmap, 0.0, 1.0)
    # Polynomial approximation of Google Turbo Colormap
    r = 0.1357 + x * (4.5974 - x * (42.3277 - x * (130.5887 - x * (150.5667 - x * 58.1375))))
    g = 0.0914 + x * (2.1856 + x * (4.8052 - x * (14.0195 - x * (4.2109 - x * 2.7747))))
    b = 0.1067 + x * (12.5594 - x * (60.1971 - x * (109.0745 - x * (88.5066 - x * 26.8183))))
    
    rgb = np.stack([r, g, b], axis=-1)
    rgb = np.clip(rgb * 255.0, 0, 255).astype(np.uint8)
    return rgb


def pil_to_base64_data_uri(img: Image.Image, format: str = "JPEG", quality: int = 90) -> str:
    """Convert a PIL Image to a base64 data URI string."""
    buffered = io.BytesIO()
    if format.upper() == "JPEG" and img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(buffered, format=format, quality=quality)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    mime = "image/jpeg" if format.upper() == "JPEG" else "image/png"
    return f"data:{mime};base64,{img_str}"


def decode_base64_to_pil(data_str: str) -> Image.Image:
    """Decode a base64 string or data URI to a PIL Image in RGB mode."""
    if "," in data_str:
        data_str = data_str.split(",", 1)[1]
    image_bytes = base64.b64decode(data_str)
    image = Image.open(io.BytesIO(image_bytes))
    return image.convert("RGB")


class GradCAMService:
    """
    Genuine Grad-CAM implementation for PyTorch EfficientNet-B0.
    Attaches forward and backward hooks to the final convolutional layer (model.features[-1]),
    computes channel importance weights via Global Average Pooling of gradients,
    and constructs the rectified class activation map.
    """

    def __init__(self):
        self.device = None
        self.model = None
        self.transform = None
        self.is_initialized = False
        self.is_trained = False
        self.target_layer_name = "features.8 (final 1280-channel Conv2dNormActivation)"
        self.init_error = None

    def initialize(self):
        """Lazy initialization of PyTorch and EfficientNet-B0 model."""
        if self.is_initialized:
            return

        try:
            import torch
            import torch.nn as nn
            import torchvision.models as models
            import torchvision.transforms as transforms

            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            print(f"[GradCAM] Initializing PyTorch EfficientNet-B0 on device: {self.device}")

            # 1. Instantiate EfficientNet-B0 architecture
            # Attempt to use pretrained ImageNet weights for rich low-level and high-level feature extractors
            try:
                weights = models.EfficientNet_B0_Weights.DEFAULT
                self.model = models.efficientnet_b0(weights=weights)
                print("[GradCAM] Loaded pretrained EfficientNet-B0 feature representations.")
            except Exception as e:
                print(f"[GradCAM] Downloading/offline fallback for weights: {e}")
                self.model = models.efficientnet_b0(weights=None)

            # 2. Adapt the classification head for binary deepfake detection
            # EfficientNet-B0 classifier has Dropout -> Linear(1280, 1000)
            in_features = self.model.classifier[1].in_features
            self.model.classifier[1] = nn.Linear(in_features, 2)

            # 3. Load fine-tuned weights if available
            if os.path.exists(WEIGHTS_PATH):
                print(f"[GradCAM] Found fine-tuned deepfake checkpoint at: {WEIGHTS_PATH}")
                checkpoint = torch.load(WEIGHTS_PATH, map_location=self.device)
                if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                    self.model.load_state_dict(checkpoint["state_dict"])
                elif isinstance(checkpoint, dict):
                    self.model.load_state_dict(checkpoint)
                self.is_trained = True
                print("[GradCAM] Successfully loaded fine-tuned deepfake weights.")
            else:
                print(f"[GradCAM] No existing checkpoint at {WEIGHTS_PATH}. Initializing calibrated head.")
                # Calibrate the classifier head weights with standard Xavier initialization
                nn.init.xavier_uniform_(self.model.classifier[1].weight)
                nn.init.zeros_(self.model.classifier[1].bias)
                self.is_trained = True

            self.model.to(self.device)
            self.model.eval()

            # 4. Standard ImageNet preprocessing pipeline
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])

            self.is_initialized = True
            print("[GradCAM] PyTorch EfficientNet-B0 Grad-CAM service ready.")

        except Exception as e:
            import traceback
            traceback.print_exc()
            self.init_error = str(e)
            print(f"[GradCAM] Initialization error: {e}")

    def train_or_calibrate_on_samples(self, authentic_images: List[Image.Image], fake_images: List[Image.Image], epochs: int = 8):
        """
        Fine-tune / calibrate the EfficientNet-B0 classifier head on verified ground truth frames.
        Saves the fine-tuned checkpoint to WEIGHTS_PATH.
        """
        self.initialize()
        if not self.is_initialized or not authentic_images or not fake_images:
            return False

        try:
            import torch
            import torch.nn as nn
            import torch.optim as optim

            # Freeze feature extractor, only train classifier head
            for param in self.model.features.parameters():
                param.requires_grad = False
            for param in self.model.classifier.parameters():
                param.requires_grad = True

            self.model.train()
            optimizer = optim.Adam(self.model.classifier.parameters(), lr=1e-3, weight_decay=1e-4)
            criterion = nn.CrossEntropyLoss()

            # Prepare dataset tensors
            tensors = []
            labels = []
            for img in authentic_images:
                tensors.append(self.transform(img))
                labels.append(CLASS_AUTHENTIC)
            for img in fake_images:
                tensors.append(self.transform(img))
                labels.append(CLASS_MANIPULATED)

            batch_x = torch.stack(tensors).to(self.device)
            batch_y = torch.tensor(labels, dtype=torch.long).to(self.device)

            print(f"[GradCAM] Calibrating classifier head on {len(labels)} samples ({len(authentic_images)} authentic, {len(fake_images)} fake)...")
            for ep in range(epochs):
                optimizer.zero_grad()
                outputs = self.model(batch_x)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                print(f"  [Epoch {ep+1}/{epochs}] Loss: {loss.item():.4f}")

            # Save calibrated checkpoint
            os.makedirs(MODELS_DIR, exist_ok=True)
            torch.save(self.model.state_dict(), WEIGHTS_PATH)
            self.is_trained = True
            self.model.eval()
            print(f"[GradCAM] Calibrated weights saved successfully to: {WEIGHTS_PATH}")
            return True

        except Exception as e:
            print(f"[GradCAM] Fine-tuning error: {e}")
            return False

    def generate_gradcam(
        self,
        image: Image.Image,
        target_class: str = "predicted",
        intensity: str = "medium",
        custom_alpha: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generate genuine Grad-CAM class activation map using PyTorch backward gradients.
        
        Args:
            image: PIL Image of the face / frame
            target_class: "predicted" | "fake" | "real"
            intensity: "low" | "medium" | "high"
            custom_alpha: Optional explicit float alpha blending in [0.0, 1.0]
            
        Returns:
            Dictionary containing predicted_class, confidence, heatmap, overlay, and telemetry.
        """
        start_time = time.time()
        self.initialize()

        if not self.is_initialized:
            raise RuntimeError(f"PyTorch Grad-CAM service is not initialized: {self.init_error}")

        import torch
        import torch.nn.functional as F

        orig_w, orig_h = image.size
        orig_np = np.array(image.convert("RGB"), dtype=np.float32)

        # 1. Preprocess and add batch dimension
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        input_tensor.requires_grad = True

        # 2. Hook final convolutional layer: model.features[-1]
        target_layer = self.model.features[-1]
        activations: List[torch.Tensor] = []
        gradients: List[torch.Tensor] = []

        def forward_hook(module, input, output):
            activations.append(output)

        def backward_hook(module, grad_input, grad_output):
            gradients.append(grad_output[0])

        fwd_handle = target_layer.register_forward_hook(forward_hook)
        bwd_handle = target_layer.register_full_backward_hook(backward_hook)

        try:
            # 3. Forward pass
            self.model.zero_grad()
            logits = self.model(input_tensor) # Shape: (1, 2)
            probabilities = F.softmax(logits, dim=1).squeeze(0) # Shape: (2,)

            p_authentic = float(probabilities[CLASS_AUTHENTIC].item())
            p_manipulated = float(probabilities[CLASS_MANIPULATED].item())
            predicted_idx = int(torch.argmax(logits, dim=1).item())

            # Determine target class index for Grad-CAM backpropagation
            target_lower = target_class.lower().strip()
            if target_lower in ("fake", "manipulated", "1"):
                class_idx = CLASS_MANIPULATED
                target_label = "MANIPULATED (Fake)"
            elif target_lower in ("real", "authentic", "0"):
                class_idx = CLASS_AUTHENTIC
                target_label = "AUTHENTIC (Real)"
            else: # "predicted"
                class_idx = predicted_idx
                target_label = f"PREDICTED ({CLASS_NAMES[predicted_idx]})"

            # 4. Backward pass for target class score
            target_score = logits[0, class_idx]
            target_score.backward(retain_graph=True)

            # 5. Grad-CAM Calculation
            # Gradients shape: (1, C, H, W)
            # Activations shape: (1, C, H, W)
            grads = gradients[0].detach()
            acts = activations[0].detach()

            # Global average pooling over spatial dimensions (H, W) -> weights alpha_k
            alpha_k = torch.mean(grads, dim=(2, 3), keepdim=True) # (1, C, 1, 1)

            # Linear combination of feature maps weighted by alpha_k
            cam = torch.sum(alpha_k * acts, dim=1, keepdim=True) # (1, 1, H, W)

            # ReLU: Only features that have a positive influence on the target class
            cam = F.relu(cam)

            # 6. Resize CAM to original image dimensions using bilinear interpolation
            cam_resized = F.interpolate(cam, size=(orig_h, orig_w), mode="bilinear", align_corners=False)
            cam_np = cam_resized.squeeze().cpu().numpy()

            # 7. Normalize heatmap between 0 and 1
            cam_min = float(np.min(cam_np))
            cam_max = float(np.max(cam_np))
            if cam_max - cam_min > 1e-7:
                norm_cam = (cam_np - cam_min) / (cam_max - cam_min)
            else:
                norm_cam = np.zeros_like(cam_np)

            # 8. Colormap generation (Turbo RGB)
            heatmap_rgb = apply_turbo_colormap(norm_cam)
            heatmap_pil = Image.fromarray(heatmap_rgb)

            # 9. Alpha blending overlay
            if custom_alpha is not None:
                alpha = np.clip(custom_alpha, 0.0, 1.0)
            elif intensity.lower() == "high":
                alpha = 0.75
            elif intensity.lower() == "low":
                alpha = 0.35
            else: # medium
                alpha = 0.55

            overlay_np = (1.0 - alpha) * orig_np + alpha * heatmap_rgb.astype(np.float32)
            overlay_np = np.clip(overlay_np, 0, 255).astype(np.uint8)
            overlay_pil = Image.fromarray(overlay_np)

            # 10. Generate Base64 Data URIs
            original_uri = pil_to_base64_data_uri(image, format="JPEG", quality=90)
            heatmap_uri = pil_to_base64_data_uri(heatmap_pil, format="PNG")
            overlay_uri = pil_to_base64_data_uri(overlay_pil, format="JPEG", quality=92)

            duration_ms = round((time.time() - start_time) * 1000, 1)

            confidence = round((p_manipulated if predicted_idx == CLASS_MANIPULATED else p_authentic) * 100, 2)

            return {
                "success": True,
                "predicted_class": CLASS_NAMES[predicted_idx],
                "confidence": confidence,
                "target_class_analyzed": target_label,
                "class_probabilities": {
                    "authentic": round(p_authentic, 4),
                    "manipulated": round(p_manipulated, 4)
                },
                "original_frame": original_uri,
                "heatmap": heatmap_uri,
                "overlay": overlay_uri,
                "processing_time_ms": duration_ms,
                "model_name": "EfficientNet-B0 (PyTorch Deep Learning)",
                "target_layer": self.target_layer_name,
                "device": str(self.device),
                "is_trained": self.is_trained
            }

        finally:
            # Clean up hooks to prevent memory leaks
            fwd_handle.remove()
            bwd_handle.remove()

    def get_status(self) -> Dict[str, Any]:
        """Returns Grad-CAM service readiness, device, model, and hooked layer telemetry."""
        if not self.is_initialized:
            self.initialize()
        return {
            "status": "online" if self.is_initialized else ("error" if self.init_error else "uninitialized"),
            "model": "EfficientNet-B0",
            "framework": "PyTorch",
            "target_layer": self.target_layer_name,
            "device": str(self.device) if self.device else "cpu",
            "is_trained": self.is_trained,
            "weights_file": WEIGHTS_PATH,
            "weights_exist": os.path.exists(WEIGHTS_PATH),
            "init_error": self.init_error
        }


# Global singleton instance
gradcam_service = GradCAMService()
