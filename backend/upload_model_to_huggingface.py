"""
AegisVision Deepfake Detection System
======================================
Script to upload the trained EfficientNet-B0 weights to HuggingFace Hub
so that Render can download them at startup via MODEL_WEIGHTS_URL env variable.

Usage:
    pip install huggingface_hub
    python upload_model_to_huggingface.py

After running, copy the direct download URL and set it as MODEL_WEIGHTS_URL
in your Render service environment variables.
"""

import os
import sys

WEIGHTS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "models", "efficientnet_b0_deepfake.pth")

if not os.path.exists(WEIGHTS_PATH):
    print(f"ERROR: Model weights not found at: {WEIGHTS_PATH}")
    print("Train the model first using: python backend/app/pipeline/train_calibrated_model.py")
    sys.exit(1)

print(f"Found model weights: {WEIGHTS_PATH}")
print(f"File size: {os.path.getsize(WEIGHTS_PATH) / (1024*1024):.1f} MB")

try:
    from huggingface_hub import HfApi
except ImportError:
    print("Installing huggingface_hub...")
    os.system(f"{sys.executable} -m pip install huggingface_hub")
    from huggingface_hub import HfApi

HF_TOKEN = os.environ.get("HF_TOKEN", "")
HF_REPO_ID = os.environ.get("HF_REPO_ID", "")

if not HF_TOKEN or not HF_REPO_ID:
    print("\nTo upload to HuggingFace Hub:")
    print("1. Create a free account at https://huggingface.co")
    print("2. Create a new model repository")
    print("3. Get your write token from https://huggingface.co/settings/tokens")
    print("4. Run:")
    print("   set HF_TOKEN=your_token_here")
    print("   set HF_REPO_ID=your_username/your_repo_name")
    print("   python upload_model_to_huggingface.py")
    print("\nAlternative: Use Google Drive direct download link or any file hosting service.")
    print("Set MODEL_WEIGHTS_URL env variable in Render to the direct download URL.")
    sys.exit(0)

api = HfApi()
print(f"\nUploading to: {HF_REPO_ID}")

url = api.upload_file(
    path_or_fileobj=WEIGHTS_PATH,
    path_in_repo="efficientnet_b0_deepfake.pth",
    repo_id=HF_REPO_ID,
    token=HF_TOKEN,
)

print(f"\n✅ Upload successful!")
print(f"Direct download URL:")
direct_url = f"https://huggingface.co/{HF_REPO_ID}/resolve/main/efficientnet_b0_deepfake.pth"
print(f"  {direct_url}")
print(f"\nSet this in Render environment variables:")
print(f"  MODEL_WEIGHTS_URL={direct_url}")
