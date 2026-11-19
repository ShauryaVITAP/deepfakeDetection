import numpy as np
from PIL import Image
import io
import base64
from scipy.ndimage import laplace, gaussian_filter

def extract_advanced_forensic_features(image: Image.Image):
    """
    Extract robust mathematical forensic features from a face / video frame.
    Avoids photographic false positives (like background bokeh or camera portrait blur)
    and guards against division by zero on blank/solid frames.
    """
    img = image.convert('RGB')
    arr = np.array(img, dtype=np.float32)
    h, w, c = arr.shape
    
    # Grayscale
    gray = 0.2989 * arr[:, :, 0] + 0.5870 * arr[:, :, 1] + 0.1140 * arr[:, :, 2]
    gray_std = float(np.std(gray))
    gray_mean = float(np.mean(gray))

    # Guard: If frame is nearly black or completely uniform (unrendered frame buffer)
    if gray_std < 4.0 or gray_mean < 4.0:
        return {
            "hf_mid_ratio": 0.24,
            "peak_to_median": 4.0,
            "azimuthal_var": 0.70,
            "face_texture_energy": 2.5,
            "boundary_ratio": 1.0,
            "face_noise_std": 1.5,
            "color_decorrelation": 0.05,
            "is_blank_frame": True
        }

    # 1. 2D FFT Frequency Analysis
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    mag = np.abs(fshift) + 1e-8
    log_mag = np.log(mag)
    
    cy, cx = h // 2, w // 2
    y, x = np.ogrid[:h, :w]
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    r_max = np.sqrt(cx**2 + cy**2)
    r_norm = r / (r_max + 1e-8)
    
    # Radial bands
    low_band = np.mean(mag[(r_norm >= 0.02) & (r_norm < 0.15)])
    mid_band = np.mean(mag[(r_norm >= 0.15) & (r_norm < 0.40)])
    high_band = np.mean(mag[(r_norm >= 0.40) & (r_norm < 0.75)])
    
    # High frequency / mid frequency ratio
    hf_mid_ratio = float(high_band / (mid_band + 1e-8))
    
    # Spectral grid periodic spikes: Check max peak relative to local median in high frequency ring
    hf_ring = log_mag[(r_norm >= 0.35) & (r_norm < 0.70)]
    if len(hf_ring) > 0 and np.std(hf_ring) > 1e-4:
        peak_to_median = float((np.max(hf_ring) - np.median(hf_ring)) / (np.std(hf_ring) + 1e-8))
        azimuthal_var = float(np.var(hf_ring))
    else:
        peak_to_median = 4.0
        azimuthal_var = 0.70
        
    # 2. Facial region vs Boundary Seam Analysis
    # Aspect-ratio-aware face bounding region
    if h > w:
        # Portrait (mobile phone video): Face is typically centered in upper 15%-65%
        y1, y2 = int(0.12 * h), int(0.62 * h)
        x1, x2 = int(0.10 * w), int(0.90 * w)
    else:
        # Landscape: Face is centered
        y1, y2 = int(0.18 * h), int(0.82 * h)
        x1, x2 = int(0.22 * w), int(0.78 * w)
    
    face_patch = gray[y1:y2, x1:x2]
    
    # Texture detail (Laplacian variance of face patch)
    face_lap = laplace(face_patch)
    face_texture_energy = float(np.mean(np.abs(face_lap)))
    
    # Seam detection: Ring around face patch (transition boundary)
    boundary_mask = np.zeros((h, w), dtype=bool)
    boundary_mask[max(0, y1-15):min(h, y1+15), x1:x2] = True
    boundary_mask[max(0, y2-15):min(h, y2+15), x1:x2] = True
    boundary_mask[y1:y2, max(0, x1-15):min(w, x1+15)] = True
    boundary_mask[y1:y2, max(0, x2-15):min(w, x2+15)] = True
    
    seam_gradient = float(np.mean(np.abs(laplace(gray)[boundary_mask]))) if np.any(boundary_mask) else 0.0
    # Boundary seam ratio: discontinuity at transition
    boundary_ratio = float(seam_gradient / (face_texture_energy + 1e-6))
    
    # 3. High-Pass Noise Residual Consistency (PRNU proxy)
    smoothed_face = gaussian_filter(face_patch, sigma=1.0)
    face_noise = face_patch - smoothed_face
    face_noise_std = float(np.std(face_noise))
    
    # 4. Color Cross-Channel Correlation with zero-variance protection
    r_ch = arr[y1:y2, x1:x2, 0].ravel()
    g_ch = arr[y1:y2, x1:x2, 1].ravel()
    b_ch = arr[y1:y2, x1:x2, 2].ravel()

    r_std = np.std(r_ch)
    g_std = np.std(g_ch)
    b_std = np.std(b_ch)

    if r_std > 1e-3 and g_std > 1e-3:
        corr_rg = float(np.corrcoef(r_ch, g_ch)[0, 1])
    else:
        corr_rg = 1.0

    if r_std > 1e-3 and b_std > 1e-3:
        corr_rb = float(np.corrcoef(r_ch, b_ch)[0, 1])
    else:
        corr_rb = 1.0

    if np.isnan(corr_rg):
        corr_rg = 1.0
    if np.isnan(corr_rb):
        corr_rb = 1.0

    color_decorrelation = float(max(0.0, 1.0 - min(corr_rg, corr_rb)))

    return {
        "hf_mid_ratio": hf_mid_ratio,
        "peak_to_median": peak_to_median,
        "azimuthal_var": azimuthal_var,
        "face_texture_energy": face_texture_energy,
        "boundary_ratio": boundary_ratio,
        "face_noise_std": face_noise_std,
        "color_decorrelation": color_decorrelation,
        "is_blank_frame": False
    }
