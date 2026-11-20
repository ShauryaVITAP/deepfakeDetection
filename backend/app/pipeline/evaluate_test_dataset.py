"""
AegisVision Deepfake Detection System
======================================
Proper evaluation script for computing confusion matrix, accuracy, precision, recall, F1.

Usage:
    # Organize test videos:
    # test_dataset/
    #   real/   <- genuine camera recordings
    #   fake/   <- deepfake / AI-generated videos
    
    python backend/run_evaluation.py

Requirements:
    - Trained model checkpoint at backend/app/models/efficientnet_b0_deepfake.pth
    - Test videos in organized folders (see REAL_DIR and FAKE_DIR below)
    - opencv-python-headless, torch, torchvision, pillow, numpy, scikit-learn
"""

import os
import sys
import json
import time
from typing import List, Dict, Tuple
import numpy as np

# ========== CONFIGURATION ==========
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.dirname(os.path.dirname(_THIS_DIR))
REAL_DIR = os.path.join(_REPO_ROOT, "test_dataset", "real")
FAKE_DIR = os.path.join(_REPO_ROOT, "test_dataset", "fake")
RESULTS_OUTPUT = os.path.join(_REPO_ROOT, "evaluation_results.json")
THRESHOLD_HIGH = 0.65   # P(Fake) >= 0.65 -> MANIPULATED
THRESHOLD_LOW  = 0.35   # P(Fake) <= 0.35 -> AUTHENTIC
FRAMES_PER_VIDEO = 6    # Number of frames to sample per video


def extract_frames_from_video(video_path: str, num_frames: int = 6) -> List:
    """Extract evenly-spaced frames from a video file using OpenCV."""
    try:
        import cv2
        from PIL import Image

        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        if total_frames <= 0:
            cap.release()
            return []

        step = max(1, total_frames // num_frames)
        pil_frames = []

        for i in range(num_frames):
            frame_no = min(total_frames - 1, i * step)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_no)
            ret, frame_bgr = cap.read()
            if ret and frame_bgr is not None:
                frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                pil_frames.append(Image.fromarray(frame_rgb))

        cap.release()
        return pil_frames
    except Exception as e:
        print(f"  [Frame Extraction Error] {video_path}: {e}")
        return []


def collect_videos(directory: str) -> List[str]:
    """Collect all video files from a directory."""
    if not os.path.exists(directory):
        return []
    valid_extensions = {'.mp4', '.mov', '.avi', '.webm', '.mkv'}
    videos = []
    for fname in sorted(os.listdir(directory)):
        ext = os.path.splitext(fname)[1].lower()
        if ext in valid_extensions:
            videos.append(os.path.join(directory, fname))
    return videos


def run_evaluation():
    """Run full evaluation on test dataset and compute metrics."""
    # Ensure imports work
    sys.path.insert(0, _REPO_ROOT)

    from backend.app.pipeline.classifier import ForensicDeepfakeClassifier
    from backend.app.services.gradcam import WEIGHTS_PATH

    print("=" * 70)
    print("AegisVision Deepfake Detection — Test Dataset Evaluation")
    print("=" * 70)

    if not os.path.exists(WEIGHTS_PATH):
        print(f"\nCRITICAL ERROR: No trained model weights at: {WEIGHTS_PATH}")
        print("Cannot run a valid evaluation without a trained model.")
        print("Train the model first using:")
        print("  python backend/app/pipeline/train_calibrated_model.py")
        return

    print(f"\n✅ Model checkpoint: {WEIGHTS_PATH} ({os.path.getsize(WEIGHTS_PATH)/(1024*1024):.1f} MB)")

    print("\n[Setup] Initializing ForensicDeepfakeClassifier...")
    t0 = time.time()
    classifier = ForensicDeepfakeClassifier()
    print(f"[Setup] Ready in {time.time()-t0:.2f}s | trained={classifier.gradcam.is_trained}")

    if not classifier.gradcam.is_trained:
        print("\n⚠️  WARNING: Xavier-initialized weights — predictions are RANDOM BASELINE.")
        ans = input("Continue anyway? [y/N]: ").strip().lower()
        if ans != 'y':
            return

    real_videos = collect_videos(REAL_DIR)
    fake_videos = collect_videos(FAKE_DIR)
    print(f"\n[Dataset] Real videos: {len(real_videos)}")
    print(f"[Dataset] Fake videos: {len(fake_videos)}")

    if not real_videos and not fake_videos:
        print(f"\nERROR: No test videos found.")
        print(f"  Real dir: {REAL_DIR}")
        print(f"  Fake dir: {FAKE_DIR}")
        return

    results = []
    all_ground_truths = []
    all_predictions = []

    def evaluate_video(video_path, ground_truth_label):
        fname = os.path.basename(video_path)
        frames = extract_frames_from_video(video_path, FRAMES_PER_VIDEO)
        if not frames:
            print(f"  SKIP: Could not extract frames from {fname}")
            return

        result = classifier.evaluate_video_frames(frames=frames, filename=fname, duration_seconds=len(frames)*1.0)
        p_fake = result["fake_probability"]

        if p_fake >= THRESHOLD_HIGH:
            final_pred = "MANIPULATED"
        elif p_fake <= THRESHOLD_LOW:
            final_pred = "AUTHENTIC"
        else:
            final_pred = "INCONCLUSIVE"

        is_correct = (
            True if (final_pred == ground_truth_label)
            else (None if final_pred == "INCONCLUSIVE" else False)
        )

        gt_int = 1 if ground_truth_label == "MANIPULATED" else 0
        pred_int = 1 if final_pred == "MANIPULATED" else (0 if final_pred == "AUTHENTIC" else -1)

        status = "✅" if is_correct else ("⚠️ INCONCLUSIVE" if is_correct is None else "❌ WRONG")
        print(f"  GT={ground_truth_label} | Pred={final_pred} | P(Fake)={p_fake:.3f} | {status}")

        all_ground_truths.append(gt_int)
        all_predictions.append(pred_int)
        results.append({
            "filename": fname,
            "ground_truth": ground_truth_label,
            "predicted": final_pred,
            "p_fake": round(p_fake, 4),
            "p_real": round(1.0 - p_fake, 4),
            "correct": is_correct
        })

    print(f"\n{'='*70}")
    for i, vp in enumerate(real_videos):
        print(f"\n[Real {i+1}/{len(real_videos)}] {os.path.basename(vp)}")
        evaluate_video(vp, "AUTHENTIC")

    for i, vp in enumerate(fake_videos):
        print(f"\n[Fake {i+1}/{len(fake_videos)}] {os.path.basename(vp)}")
        evaluate_video(vp, "MANIPULATED")

    # Metrics
    print(f"\n{'='*70}")
    print("EVALUATION RESULTS")
    print(f"{'='*70}")

    definitive = [(g, p) for g, p in zip(all_ground_truths, all_predictions) if p != -1]
    inconclusive_count = sum(1 for p in all_predictions if p == -1)

    if not definitive:
        print("No definitive predictions (all INCONCLUSIVE). Cannot compute metrics.")
        return

    gts = [x[0] for x in definitive]
    preds = [x[1] for x in definitive]

    TP = sum(1 for g, p in zip(gts, preds) if g == 1 and p == 1)
    TN = sum(1 for g, p in zip(gts, preds) if g == 0 and p == 0)
    FP = sum(1 for g, p in zip(gts, preds) if g == 0 and p == 1)
    FN = sum(1 for g, p in zip(gts, preds) if g == 1 and p == 0)

    total = len(all_predictions)
    n_def = len(definitive)
    accuracy  = (TP + TN) / n_def if n_def > 0 else 0.0
    precision = TP / (TP + FP) if (TP + FP) > 0 else 0.0
    recall    = TP / (TP + FN) if (TP + FN) > 0 else 0.0
    f1        = 2*precision*recall / (precision + recall) if (precision + recall) > 0 else 0.0

    print(f"\nConfusion Matrix (definitive predictions, excluding INCONCLUSIVE):")
    print(f"                         Pred: AUTHENTIC   Pred: MANIPULATED")
    print(f"  GT: AUTHENTIC (Real)       TN={TN:4d}        FP={FP:4d}")
    print(f"  GT: MANIPULATED (Fake)     FN={FN:4d}        TP={TP:4d}")
    print(f"\nTotal:         {total}")
    print(f"Definitive:    {n_def}")
    print(f"Inconclusive:  {inconclusive_count} ({100*inconclusive_count/max(1,total):.1f}%)")
    print(f"\n{'─'*40}")
    print(f"Accuracy:   {accuracy*100:.2f}%")
    print(f"Precision:  {precision*100:.2f}%")
    print(f"Recall:     {recall*100:.2f}%")
    print(f"F1-Score:   {f1*100:.2f}%")
    print(f"{'─'*40}")

    if not classifier.gradcam.is_trained:
        print(f"\n⚠️  UNTRAINED MODEL — metrics reflect random baseline, NOT learned classification.")

    output = {
        "evaluation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "model_checkpoint": WEIGHTS_PATH,
        "model_trained": classifier.gradcam.is_trained,
        "total_videos": total,
        "real_videos": len(real_videos),
        "fake_videos": len(fake_videos),
        "threshold_manipulated": THRESHOLD_HIGH,
        "threshold_authentic": THRESHOLD_LOW,
        "confusion_matrix": {"TP": TP, "TN": TN, "FP": FP, "FN": FN},
        "inconclusive_count": inconclusive_count,
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
        },
        "per_video_results": results
    }

    with open(RESULTS_OUTPUT, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\n✅ Results saved to: {RESULTS_OUTPUT}")


if __name__ == "__main__":
    run_evaluation()
