# =============================================================================
# AegisVision Deepfake Detection System — Deployment Guide
# =============================================================================

## CRITICAL: Fixing the ~1.7 Score Bug (Untrained Model on Render)

The root cause of identical/unreliable predictions is that the trained model
checkpoint (`efficientnet_b0_deepfake.pth`) is NOT deployed to Render.
Render's ephemeral filesystem starts fresh on every deploy, and `.pth` files
are typically not committed to git due to size.

### Step 1: Upload Model Weights to HuggingFace Hub

```bash
cd C:\Users\yadav\Downloads\deepfake-detection-system

# Install HuggingFace Hub
pip install huggingface_hub

# Set your credentials
set HF_TOKEN=your_huggingface_write_token
set HF_REPO_ID=your_username/aegisvision-deepfake-model

# Upload the weights
python backend/upload_model_to_huggingface.py
```

After upload, you'll see the direct download URL printed.

### Step 2: Set Environment Variable on Render

1. Go to your Render service dashboard
2. Click **Environment** → **Add Environment Variable**
3. Add: `MODEL_WEIGHTS_URL` = your HuggingFace download URL
4. The backend will auto-download the weights on startup

### Step 3: Verify on Render

After redeploy, check the logs for:
```
[ModelLoader] Downloading model weights from: https://huggingface.co/...
[ModelLoader] Model weights downloaded to: .../efficientnet_b0_deepfake.pth
[GradCAM] Successfully loaded fine-tuned deepfake weights.
[Classifier] Initialized PyTorch EfficientNet-B0 inference engine with TRAINED weights.
```

If you see instead:
```
[GradCAM] WARNING: No fine-tuned checkpoint found at ...
[GradCAM] Model is running on Xavier-initialized random weights.
```
→ The MODEL_WEIGHTS_URL env variable is not set or the download failed.

---

## Vercel Frontend Deployment

### Environment Variables (Vercel Dashboard)

Add this in your Vercel project settings → Environment Variables:
```
VITE_API_BASE_URL = https://deepfake-backend-2c7f.onrender.com
```

This makes the frontend explicitly point to your Render backend instead of
relying on hostname detection.

### Vercel Build Settings

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/` (root of repo)

### vercel.json

Already configured correctly:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Local Development Setup

```bash
# Backend (Terminal 1)
cd deepfake-detection-system/backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (Terminal 2)
cd deepfake-detection-system
npm install
npm run dev
```

Frontend runs at: http://localhost:3000
Backend runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

---

## Testing After Fix

### Quick sanity check:
1. Open browser → http://localhost:3000 (or Vercel URL)
2. Upload a **real** video (not a benchmark sample)
3. Expected: Backend is called, `isDemoData: false`, `model_status: "trained"`
4. Try same video renamed to `fake_video.mp4` → Score should be IDENTICAL (proves no filename heuristic)
5. Upload a known AI-generated video → Should produce MANIPULATED verdict

### Verify no filename heuristics:
Upload the same real video twice with different filenames.
Both must produce the same P(Fake) ± 0.1% (small variation only from JPEG compression).

---

## Render Memory Notes

EfficientNet-B0 requires ~300 MB RAM for inference. Render Free tier provides
512 MB. Cold starts may be slow (30-60s) due to PyTorch import + model loading.

If you get `OOM` or timeout errors:
- Reduce frames per video from 6 to 3 in `/api/analyze-video`
- Or upgrade to Render Starter plan

---

## Model Training (If Starting from Scratch)

If the `.pth` file is corrupted or you need to retrain:

```bash
cd deepfake-detection-system/backend
python app/pipeline/train_calibrated_model.py
```

For proper deepfake detection training, you need a labeled dataset:
- **FaceForensics++**: https://github.com/ondyari/FaceForensics
- **Celeb-DF v2**: https://github.com/yuezunli/celeb-deepfakeforensics
- **DFDC**: https://ai.facebook.com/datasets/dfdc/

---

## Confusion Matrix & Evaluation

After deploying trained weights:
```bash
# Create test_dataset/ folder structure
mkdir -p test_dataset/real test_dataset/fake

# Add labeled videos to both folders, then run:
python backend/run_evaluation.py
```

Results saved to `evaluation_results.json`.
