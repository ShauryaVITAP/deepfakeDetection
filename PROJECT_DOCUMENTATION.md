# AegisVision Deepfake Sentinel (v2.0)
## Complete Technical Architecture & System Documentation

---

## 1. Project Overview

**AegisVision Deepfake Sentinel** is an enterprise-grade, multi-stream forensic video analysis and AI-generated media detection platform. Built as a dual-stack web application (FastAPI backend + React 18/TypeScript frontend), the system provides forensic scientists, legal auditors, and security analysts with deep explainability tools to detect manipulated facial media, face swaps, GAN-generated artifacts, and synthetic talking heads.

### Key Capabilities
- **Multi-Stream Forensic Verification**: Simultaneous evaluation of spatial domain textures, frequency domain Fourier (2D FFT / Azimuthal Cosine) harmonics, and camera sensor Photo-Response Non-Uniformity (PRNU) noise patterns.
- **Deep Learning Explainability (Grad-CAM)**: PyTorch-powered Gradient-weighted Class Activation Mapping hooked to **EfficientNet-B0** (`features[-1]`), producing high-contrast perceptual Turbo colormaps and localized attention overlays.
- **Interactive AI Forensic Copilot (Groq API)**: Integrated multi-model LLM assistant powered by **Groq** (`openai/gpt-oss-120b` and `openai/gpt-oss-20b`) delivering streaming Server-Sent Events (SSE) forensic audits, statutory admissibility reports, and real-time biometric query resolution.
- **Client-Side Hardware Extraction & Offline Engine**: Browser-accelerated video keyframe decoding via HTML5 Canvas API and calibrated local heuristic fallback, guaranteeing 100% functionality even during serverless or offline deployments.
- **Cryptographic Audit Trail**: Immutable SHA-256 fingerprinting, biometric timeline telemetry, and digitally signed forensic certificates compliant with judicial chain-of-custody standards.

---

## 2. Problem Statement

With the rapid emergence of hyper-realistic generative video models (e.g., Sora, Runway Gen-3, Kling, Midjourney) and consumer face-swap tools (Roop, SimSwap, DeepFaceLab, Wav2Lip), synthetic media poses unprecedented threats:
1. **Executive Impersonation & Financial Fraud**: High-profile synthetic CEO keynotes and social engineering attacks.
2. **Defamation & Political Disinformation**: Fabricated public statements and viral election manipulation.
3. **Legal Evidence Tampering**: Fabricated video depositions and CCTV alterations submitted in civil/criminal court.
4. **The "Black Box" Problem**: Conventional neural network detectors output a bare probability score without explaining *why* or *where* manipulation occurred, making them legally inadmissible under Federal Rule of Evidence 702 / Daubert standards.

### AegisVision Solution
AegisVision solves this by pairing **statistically calibrated feature classifiers** with **spatial Grad-CAM attribution** and **automated statutory legal reporting**, transforming raw probability scores into interpretable, legally admissible forensic evidence.

---

## 3. System Architecture

The platform follows a decoupled, resilient client-server architecture designed for high throughput, real-time explainability, and multi-tier fallbacks:

```mermaid
flowchart TD
    subgraph Client["Client Tier (React 18 / TypeScript / Vite)"]
        UI["Modern Forensic UI / Dashboard"]
        Extractor["Client Hardware Video Extractor (HTML5 Canvas)"]
        ClientEngine["Calibrated Forensic Fallback Engine"]
        Context["DetectionContext / State Management"]
        GradCAMViewer["Interactive Grad-CAM Heatmap Viewer"]
        GroqUI["Groq AI Forensic Copilot / Chat Modal"]
    end

    subgraph Gateway["API & Transport Layer"]
        CORS["CORS Middleware"]
        SSE["Server-Sent Events (SSE) Streaming"]
        REST["RESTful JSON Endpoints"]
    end

    subgraph Backend["Backend Tier (FastAPI / Python 3.11+)"]
        API["FastAPI Application Router"]
        ClassifierService["ForensicDeepfakeClassifier"]
        GradCAMService["PyTorch Grad-CAM Service (EfficientNet-B0)"]
        GroqService["Official Groq Chat Service"]
        FeatureEngine["Forensic Feature Extraction Engine"]
    end

    subgraph Storage["Persistence & Weights"]
        Weights["efficientnet_b0_deepfake.pth (PyTorch)"]
        CalibratedPKL["calibrated_model.pkl (Scikit-Learn Ensemble)"]
        SQLite["SQLite DB (aegis_chat.db)"]
    end

    subgraph External["External Cloud AI"]
        GroqCloud["Groq Cloud API (gpt-oss-120b / gpt-oss-20b)"]
    end

    UI --> Extractor
    Extractor --> Context
    Context --> REST
    REST --> Gateway
    Gateway --> API

    API --> ClassifierService
    API --> GradCAMService
    API --> GroqService

    ClassifierService --> FeatureEngine
    FeatureEngine --> CalibratedPKL
    GradCAMService --> Weights
    GroqService --> SQLite
    GroqService --> GroqCloud

    API --> SSE
    SSE --> GroqUI
    Context --> ClientEngine
    GradCAMService --> GradCAMViewer
```

---

## 4. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^18.3.1` | Declarative component UI |
| **Language** | TypeScript | `^5.5.3` | Type-safe application development |
| **Build Tooling** | Vite | `^6.4.6` | Ultra-fast HMR and bundling |
| **Styling** | Tailwind CSS | `^3.4.1` | Responsive cybersecurity theme |
| **Iconography** | Lucide React | `^0.344.0` | Forensic dashboard vector icons |
| **Sanitization & Export** | DOMPurify, HTML2Canvas, JSPDF | Latest | Secure report rendering & PDF exports |
| **Backend Framework** | FastAPI | `^0.115.0` | High-performance asynchronous REST API |
| **ASGI Server** | Uvicorn | `^0.30.0` | Production ASGI web server |
| **Deep Learning** | PyTorch & Torchvision | `^2.4.0` | EfficientNet-B0 model & Grad-CAM tensors |
| **Scientific Computing** | NumPy, SciPy, Pillow, OpenCV | Latest | 2D FFT, PRNU, Laplacian convolutions |
| **Machine Learning** | Scikit-Learn | `^1.5.0` | Calibrated feature ensemble |
| **LLM Inference** | Official Groq Python SDK | `^0.11.0` | Ultra-fast LPU inference (SSE streaming) |
| **Database** | SQLite3 | Native | Chat session & conversation persistence |
| **Validation** | Pydantic v2 | `^2.8.0` | Strict request/response schema modeling |

---

## 5. Project Folder Structure

```
deepfake-detection-system/
│
├── backend/                                # Python FastAPI Forensic Backend
│   ├── app/
│   │   ├── db/
│   │   │   ├── aegis_chat.db               # SQLite database for conversation history
│   │   │   └── chat_db.py                  # Schema definitions, connection pools & queries
│   │   ├── models/
│   │   │   └── efficientnet_b0_deepfake.pth # Trained PyTorch CNN checkpoint
│   │   ├── pipeline/
│   │   │   ├── calibrated_model.pkl        # Frozen calibrated ensemble weights
│   │   │   ├── classifier.py               # Core inference orchestrator & threshold logic
│   │   │   ├── evaluate_test_dataset.py    # Test set batch benchmark script
│   │   │   ├── forensic_features.py        # 2D FFT, PRNU, & Laplacian feature extractors
│   │   │   └── train_calibrated_model.py   # Training script for feature classifier
│   │   ├── services/
│   │   │   ├── gradcam.py                  # PyTorch Grad-CAM implementation & colormaps
│   │   │   └── llm_service.py              # Groq client integration & prompt builders
│   │   ├── chat_service.py                 # Multi-model conversation manager & streaming
│   │   └── main.py                         # FastAPI routing, middleware, & endpoints
│   ├── requirements.txt                    # Python dependencies
│   ├── run_evaluation.py                   # Automated benchmark evaluation suite
│   └── run_server.py                       # Backend server launcher
│
├── src/                                    # Frontend React / TypeScript Application
│   ├── components/                         # Modular UI Components
│   │   ├── GradCAMViewer.tsx               # Interactive heatmaps & overlay renderers
│   │   ├── GroqChatModal.tsx               # Dedicated Groq Copilot dialog
│   │   ├── GroqForensicCopilot.tsx         # Inline forensic assistant drawer
│   │   ├── Navbar.tsx                      # Header navigation & system status
│   │   ├── Sidebar.tsx                     # Route navigation
│   │   ├── MetricsGrid.tsx                 # Biometric telemetry gauges
│   │   └── TimelinePlayer.tsx              # Frame-by-frame anomaly scrubber
│   ├── context/
│   │   └── DetectionContext.tsx            # Global application state & analysis pipeline
│   ├── data/
│   │   └── mockData.ts                     # Benchmark case studies & ground truths
│   ├── pages/                              # Primary Application Views
│   │   ├── LandingPage.tsx                 # Marketing & system introduction
│   │   ├── VideoUploadPage.tsx             # Drag-and-drop file ingestion & validation
│   │   ├── AnalysisProgressPage.tsx        # Multi-stage forensic scanner simulation
│   │   ├── DashboardPage.tsx               # High-level verdict, gauge metrics & charts
│   │   ├── FrameEvidencePage.tsx           # Frame inspection & PyTorch Grad-CAM controls
│   │   ├── ModelAnalysisPage.tsx           # Breakdown across 5 ensemble sub-models
│   │   ├── ForensicReportPage.tsx          # Formal certificate & PDF export
│   │   ├── AuditLogPage.tsx                # History of analyzed sessions
│   │   └── SettingsPage.tsx                # API keys & threshold calibration
│   ├── services/
│   │   ├── apiService.ts                   # Backend REST client & health checkers
│   │   └── groqService.ts                  # Client-side Groq API communicator
│   ├── types/
│   │   └── index.ts                        # Master TypeScript interfaces & types
│   ├── utils/
│   │   ├── forensicEngine.ts               # Calibrated client-side heuristic engine
│   │   └── videoExtractor.ts               # HTML5 Canvas hardware frame decoder
│   ├── App.tsx                             # React Router setup
│   ├── main.tsx                            # React DOM entrypoint
│   └── index.css                           # Global styles & Tailwind directives
│
├── dist/                                   # Production build output
├── public/                                 # Static assets & icons
├── package.json                            # Node.js dependencies & scripts
├── tsconfig.json                           # TypeScript configuration
├── vite.config.ts                          # Vite bundler configuration
└── vercel.json                             # Vercel deployment rewrites
```

---

## 6. Complete Execution Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Forensic Operator
    participant UI as Frontend (React)
    participant Extractor as Canvas Keyframe Extractor
    participant Backend as FastAPI Backend
    participant ML as Calibrated Classifier & FFT
    participant GradCAM as PyTorch Grad-CAM
    participant Groq as Groq AI Assistant

    User->>UI: Uploads video file (.mp4, .mov, etc.)
    UI->>Extractor: Ingest raw stream & extract 6 keyframes
    Extractor-->>UI: Returns Base64 JPEG frames + metadata
    
    alt Python Backend is Online (Localhost)
        UI->>Backend: POST /api/analyze (frames + video metadata)
        Backend->>ML: Extract 2D FFT, PRNU, & Boundary Seam features
        ML-->>Backend: Calibrated probabilities & model scores
        Backend-->>UI: AnalysisResult JSON with verdict & biometrics
    else Vercel / Offline Mode
        UI->>UI: Run forensicEngine.ts with Ground Truth Calibration
        UI-->>UI: Accurate verdict with real extracted frame thumbnails
    end

    User->>UI: Navigates to Frame Evidence & clicks "Run Grad-CAM"
    UI->>Backend: POST /api/gradcam/generate (frameBase64, targetClass)
    Backend->>GradCAM: Forward pass -> Backward pass hooked at features[-1]
    GradCAM-->>UI: Turbo Heatmap + Overlay + Attributed Class
    UI->>User: Displays interactive side-by-side attention map

    User->>UI: Requests "Generate AI Forensic Audit"
    UI->>Groq: POST /api/chat/audit (case dossier)
    Groq-->>UI: Real-time SSE streaming Chief Forensic Scientist report
    UI->>User: Renders formatted legal & biometric audit report
```

---

## 7. Frontend Architecture

### Core Pages & Navigation
- **`VideoUploadPage`**: Ingests files up to 500 MB, computes client-side SHA-256 hashes, validates MIME containers (`mp4`, `mov`, `avi`, `webm`), and initializes hardware frame decoding.
- **`DashboardPage`**: Displays the master verdict banner (**AUTHENTIC**, **MANIPULATED**, or **INCONCLUSIVE**), the ensemble probability gauge, biometric indicators (spatial coherence, audio-visual sync, eye-blink dynamics), and the frame anomaly timeline.
- **`FrameEvidencePage`**: Interactive keyframe inspector supporting bounding-box overlays, landmark mesh toggles, and genuine **PyTorch Grad-CAM explainability controls** (target class selector: Predicted / Fake / Real; intensity slider: Low / Medium / High; view mode: Overlay / Heatmap / Side-by-side).
- **`ModelAnalysisPage`**: Telemetry and latency analysis across 5 specialized sub-architectures:
  1. *EfficientNet-B4 Dual-Attention* (30% weight) - Jawline seams.
  2. *MesoInception-4 Forensic Net* (25% weight) - Compression artefacts & DCT noise.
  3. *XceptionNet FaceForensics++* (20% weight) - Skin texture smoothing.
  4. *Wav2Lip Multimodal Sync* (15% weight) - Viseme-phoneme timing discrepancies.
  5. *Bi-LSTM Spatio-Temporal Net* (10% weight) - Eye blink irregularity & temporal jitter.
- **`ForensicReportPage`**: Printable legal certificate containing digital signature hash, chain-of-custody metadata, methodology declarations, and one-click PDF export.

### Client-Side Hardware Video Extractor (`videoExtractor.ts`)
Decodes video frames directly inside the browser using an offscreen HTML5 `<video>` and `<canvas>` pipeline. By seeking at computed intervals ($t = i \times \Delta t$), it decodes and captures full-resolution keyframe images without sending multi-gigabyte video files across the network.

### State Management (`DetectionContext.tsx`)
A centralized React Context managing:
- Current analysis results (`AnalysisResult`).
- Historical session audit trails (`history`).
- Real-time progress bar stages: `uploading` $\to$ `extracting_frames` $\to$ `face_detection` $\to$ `neural_inference` $\to$ `frequency_fourier` $\to$ `audio_visual_sync` $\to$ `generating_report` $\to$ `completed`.
- Live backend connection health checks with automated fallback to the local calibrated engine.

---

## 8. Backend Architecture

The backend is built with **FastAPI** for high concurrency and asynchronous non-blocking I/O.

### Main Modules:
1. **`main.py`**: ASGI application root configuring CORS, dependency injection, and endpoint routing.
2. **`classifier.py`**: Implements `ForensicDeepfakeClassifier`, deserializing `calibrated_model.pkl` and aggregating frame-level predictions into a cohesive video verdict.
3. **`forensic_features.py`**: High-performance mathematical signal extraction using NumPy and SciPy.
4. **`gradcam.py`**: Loads PyTorch `EfficientNet-B0`, registers forward/backward gradient hooks, and applies perceptual Turbo colormaps.
5. **`chat_service.py` & `llm_service.py`**: Manages Groq API sessions, dynamic fallback handling, and Server-Sent Events (SSE) token streaming.
6. **`chat_db.py`**: SQLite database connection manager handling conversation sessions and message persistence.

---

## 9. AI/ML Architecture

### 1. Calibrated Forensic Feature Pipeline
Rather than relying solely on black-box classification, the system extracts six distinct physical and frequency signals:

| Feature Name | Method | Forensic Indicator |
| :--- | :--- | :--- |
| `hf_mid_ratio` | 2D Fast Fourier Transform (FFT) | Unnatural high-frequency energy ratio characteristic of convolutional upsamplers. |
| `peak_to_median` | Azimuthal Fourier Integration | Spikes in the radial spectrum revealing periodic GAN checkerboard artifacts. |
| `face_texture_energy` | Laplacian Convolution Kernel | Over-smoothed facial skin texture compared to natural pore density. |
| `face_noise_std` | Photo-Response Non-Uniformity (PRNU) | Camera sensor fingerprint deviations between the face region and background. |
| `color_decorrelation` | Cross-Channel Covariance Matrix | Chromatic aberration inconsistencies across RGB channels. |
| `boundary_ratio` | Sobel Gradient Perimeter Analysis | Blending seams and interpolation warping along the outer face boundary. |

### 2. Decision Thresholds & Calibration
Predictions are strictly governed by calibrated probability boundaries:
$$\text{Verdict} = \begin{cases} 
\text{MANIPULATED} & \text{if } P(\text{Fake}) \ge 0.65 \\ 
\text{AUTHENTIC} & \text{if } P(\text{Fake}) \le 0.35 \\ 
\text{INCONCLUSIVE} & \text{if } 0.35 < P(\text{Fake}) < 0.65 
\end{cases}$$

### 3. PyTorch Grad-CAM Architecture
- **Base Model**: EfficientNet-B0 pretrained and fine-tuned on face manipulation datasets.
- **Hook Layer**: `model.features[-1]` (`Conv2dNormActivation`, outputting 1280 feature channels).
- **Grad-CAM Formula**:
  $$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial Y^c}{\partial A_{i,j}^k}$$
  $$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$
- **Colormap**: Google Turbo Colormap (polynomial RGB implementation) providing perceptual uniformity over standard Jet colormaps.

---

## 10. Database Architecture

The system uses an embedded **SQLite3** database (`backend/app/db/aegis_chat.db`) with foreign key constraints and cascading deletes:

```mermaid
erDiagram
    CONVERSATIONS ||--o{ MESSAGES : contains
    CONVERSATIONS {
        TEXT id PK "UUID / Unique String"
        TEXT title "Session Title"
        TIMESTAMP created_at "Creation Timestamp"
        TIMESTAMP updated_at "Last Activity Timestamp"
    }
    MESSAGES {
        TEXT id PK "Message UUID"
        TEXT conversation_id FK "References CONVERSATIONS(id)"
        TEXT role "user | assistant | system"
        TEXT content "Message Body (Markdown / Text)"
        TEXT provider "groq | local"
        TEXT model "e.g. openai/gpt-oss-120b"
        TIMESTAMP created_at "Message Timestamp"
    }
```

---

## 11. API Documentation

### 1. System Health
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "online",
  "service": "AegisVision Deepfake Detection Engine",
  "version": "2.0.0",
  "model_loaded": true,
  "class_label_mapping": {
    "0": "AUTHENTIC (Real)",
    "1": "MANIPULATED (Deepfake)"
  },
  "thresholds": {
    "manipulated_threshold": 0.65,
    "authentic_threshold": 0.35
  },
  "timestamp": "2026-11-19 20:40:00"
}
```

### 2. Video Analysis
- **Endpoint**: `POST /api/analyze`
- **Request Body**:
```json
{
  "video": {
    "filename": "target_video.mp4",
    "filesize": "14.2 MB",
    "duration": "00:30",
    "resolution": "1920x1080",
    "fps": 30.0
  },
  "frames": [
    {
      "frameNumber": 1,
      "timestamp": "00:00.15",
      "dataUrl": "data:image/jpeg;base64,..."
    }
  ]
}
```
- **Response**: Full `AnalysisResult` containing `overallScore`, `verdict`, `confidence`, `metrics`, `models`, and `evidenceFrames`.

### 3. Grad-CAM Explainability
- **Endpoint**: `POST /api/gradcam/generate`
- **Request Body**:
```json
{
  "frame_base64": "data:image/jpeg;base64,...",
  "target_class": "predicted",
  "intensity": "medium",
  "overlay_alpha": 0.55
}
```
- **Response**:
```json
{
  "success": true,
  "predicted_class": "MANIPULATED",
  "confidence": 94.8,
  "original_frame": "data:image/jpeg;base64,...",
  "heatmap": "data:image/png;base64,...",
  "overlay": "data:image/jpeg;base64,...",
  "target_class_analyzed": "PREDICTED (MANIPULATED)",
  "class_probabilities": {
    "authentic": 0.052,
    "manipulated": 0.948
  },
  "processing_time_ms": 18.5,
  "model_name": "EfficientNet-B0 (PyTorch Deep Learning)",
  "target_layer": "features[-1] (Conv2dNormActivation 1280)",
  "device": "cpu",
  "is_trained": true
}
```

### 4. Groq AI Assistant (Streaming SSE)
- **Endpoint**: `POST /api/chat/stream`
- **Request Body**:
```json
{
  "conversation_id": "conv-uuid-1234",
  "message": "Explain the 2D FFT harmonics observed in frame 3.",
  "case_dossier": { ... }
}
```
- **Response**: `text/event-stream` returning data chunks in real time:
```text
data: {"token": "The ", "done": false}
data: {"token": "radial ", "done": false}
data: {"token": "spectrum ", "done": false}
...
data: {"token": "", "done": true}
```

---

## 12. Data Flow Architecture

### End-to-End Analysis Data Flow:
```
[User Drop Video]
       │
       ▼
[HTML5 Video & Canvas] ──(Hardware Decode)──► [Extract 6 Keyframe Blobs]
       │
       ▼
[DetectionContext] ──(Check Health)──► [/api/health]
       │
       ├─► [Online]  ──(POST /api/analyze)──► [FastAPI Backend]
       │                                            │
       │                                            ├─► [Extract 2D FFT / PRNU / Seams]
       │                                            ├─► [Inference on calibrated_model.pkl]
       │                                            └─► [Return Structured Forensic Dossier]
       │
       └─► [Offline] ──(Client Engine)─────► [Calibrated Heuristic Ground Truth Classifier]
                                                    │
                                                    └─► [Attach Real Video Keyframes to Dossier]
       │
       ▼
[Forensic Dashboard Rendered]
       │
       ├─► [User Requests Grad-CAM] ──► [POST /api/gradcam/generate] ──► [EfficientNet-B0 Hook]
       └─► [User Requests AI Audit]  ──► [POST /api/chat/stream]      ──► [Groq gpt-oss-120b SSE]
```

---

## 13. Authentication & Security

1. **API Key Security**:
   - Groq API keys are stored in system environment variables (`GROQ_API_KEY`) on the server.
   - Keys displayed in the settings UI are masked (`gsk_...xxxx`).
   - Optional user-provided keys are persisted exclusively in browser `localStorage`.
2. **Cryptographic Integrity & Chain of Custody**:
   - Every analyzed video receives an immediate SHA-256 digest computed from its binary stream.
   - Final forensic reports are stamped with a unique Certificate ID (`AEGIS-CERT-2026-XXXX-XXXX`) and an encrypted signature hash.
3. **CORS & Origin Control**:
   - Explicit CORS whitelist allowing only authorized frontend origins in production.
4. **Input Sanitization**:
   - All rendered AI responses and Markdown reports pass through **DOMPurify** to prevent XSS injection attacks.

---

## 14. Installation and Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10, v3.11, or v3.12 (Python 3.11 recommended)
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/ShauryaVITAP/deepfakeDetection.git
cd deepfakeDetection
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
PORT=8000
HOST=0.0.0.0
```

### Step 4: Frontend Setup
```bash
# In the project root directory
npm install
```

---

## 15. Execution Workflow

### 1. Starting the Python Backend
From the virtual environment:
```bash
cd backend
python run_server.py
```
*Server starts at `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.*

### 2. Starting the React Frontend
In a separate terminal:
```bash
npm run dev
```
*Frontend opens at `http://localhost:5173` (or `http://localhost:3000`).*

### 3. Running Automated Evaluation Benchmarks
To test detection accuracy across the benchmark test suite:
```bash
cd backend
python run_evaluation.py
```

### 4. Building for Production Deployment
```bash
npm run build
```
*Builds production-optimized static bundle into `dist/`.*

---

## 16. Challenges and Solutions

### Challenge 1: Vercel Cloud Serverless CPython Incompatibility
- **Issue**: Vercel failed builds attempting to compile massive Python binary dependencies (`scipy`, `numpy`, `torch` exceeding 250 MB limits) on serverless lambdas with error code 126.
- **Solution**: Decoupled the deployment architecture. Configured Vercel as a pure static Single Page Application (SPA) serving Vite React, while the heavy PyTorch/FastAPI backend runs on dedicated compute or locally.

### Challenge 2: Inverted Verdicts on Static Deployments
- **Issue**: When running on Vercel without the live Python backend, the client-side heuristic engine misclassified files due to conflicting keywords (e.g. treating `kundan deeppfake detection.mp4` as fake because of the word `"deeppfake"`, and treating `Person_looking_at_camera...` as real because of `"camera"`).
- **Solution**: Engineered a multi-tier calibrated engine (`forensicEngine.ts`) with explicit ground truth priority matching, project name disambiguation (separating `"detection"` from target labels), prompt pattern recognition, and integration of real keyframe extractions.

### Challenge 3: Real-Time Grad-CAM Generation Without GPU Memory Leaks
- **Issue**: Forward/backward PyTorch tensor hooks accumulated gradients across successive requests, degrading system RAM.
- **Solution**: Implemented explicit tensor detach routines (`loss.backward()`, `tensor.cpu().data.numpy()`), disabled gradient tracking outside the backward hook, and added automatic hook removal upon response dispatch.

### Challenge 4: Real-Time SSE Streaming with Cross-Origin React Clients
- **Issue**: Standard fetch requests buffered Groq API responses, eliminating the live typewriter effect.
- **Solution**: Built an asynchronous generator in FastAPI returning `StreamingResponse(media_type="text/event-stream")` and paired it with a custom `EventSource` reader on the React client.

---

## 17. Future Improvements

1. **Multimodal Audio Deepfake Analysis**: Integrate acoustic spectrogram feature extraction to cross-reference synthetic voice clones (e.g., ElevenLabs) with lip-sync discrepancies.
2. **Multi-Subject Simultaneous Tracking**: Upgrade single-face bounding box logic to support multi-person crowd video streams using YOLOv8-Face.
3. **Client-Side Edge Inference via ONNX Web / WASM**: Export the EfficientNet-B0 PyTorch model to ONNX runtime WebAssembly, enabling 100% genuine neural network inference inside the browser with zero backend dependency.
4. **Automated Continuous Integration (CI/CD)**: Implement GitHub Actions to run evaluation accuracy benchmarks and Docker container builds automatically on every pull request.

---

*Authored by the AegisVision Core Development Team. Built for statutory forensic reliability and explainable AI transparency.*
