export type Verdict = 'AUTHENTIC' | 'MANIPULATED' | 'INCONCLUSIVE';

export type AnalysisStage = 
  | 'idle'
  | 'uploading'
  | 'extracting_frames'
  | 'face_detection'
  | 'neural_inference'
  | 'frequency_fourier'
  | 'audio_visual_sync'
  | 'generating_report'
  | 'completed'
  | 'error';

export interface ModelScore {
  id: string;
  name: string;
  architecture: string;
  deepfakeProbability: number; // 0-100
  weight: number; // contribution percentage
  status: Verdict;
  focusArea: string;
  latencyMs: number;
}

export interface FrameEvidence {
  id: string;
  frameNumber: number;
  timestamp: string;
  deepfakeProbability: number;
  verdict: Verdict;
  isSuspicious: boolean;
  anomalyType: 
    | 'Face Swap Seam'
    | 'Blink Frequency Deficit'
    | 'Audio-Visual Desync'
    | 'Frequency Grid Mismatch'
    | 'Lighting Inconsistency'
    | 'Micro-Expression Flattening'
    | 'Low-Resolution Blur'
    | 'Authentic Pattern';
  description: string;
  heatMapIntensity: 'Low' | 'Medium' | 'High' | 'None';
  facialLandmarksCount: number;
  fftArtifactsDetected: boolean;
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  thumbnailUrl?: string;
}

export interface VideoMetadata {
  id: string;
  filename: string;
  filesize: string;
  duration: string;
  resolution: string;
  framerate: number;
  codec: string;
  sha256Hash: string;
  uploadDate: string;
  audioSampleRate?: string;
  faceDetectedCount: number;
  previewUrl?: string; // Blob object URL if user uploaded local file
}

export interface ForensicMetrics {
  spatialCoherence: number; // 0-100
  temporalConsistency: number; // 0-100
  audioVisualSync: number; // 0-100
  frequencyDomainAnomaly: number; // 0-100
  eyeBlinkDynamics: number; // 0-100
  lightingConsistency: number; // 0-100
}

export interface AnalysisResult {
  id: string;
  video: VideoMetadata;
  overallScore: number; // 0-100 (Deepfake probability)
  authenticityScore: number; // 100 - overallScore
  verdict: Verdict;
  confidence: number; // model confidence in %
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  isDemoData: boolean;
  executiveSummary: string;
  completedAt: string;
  processingTimeSeconds: number;
  totalFrames: number;
  flaggedFramesCount: number;
  metrics: ForensicMetrics;
  models: ModelScore[];
  timeline: Array<{
    second: number;
    timeFormatted: string;
    score: number;
    anomalyFlag: boolean;
    anomalyLabel?: string;
  }>;
  evidenceFrames: FrameEvidence[];
  certificateId: string;
  signatureHash: string;
}

export interface AnalysisHistoryItem {
  id: string;
  filename: string;
  duration: string;
  uploadedAt: string;
  verdict: Verdict;
  deepfakeProbability: number;
  resolution: string;
  fileSize: string;
  analyzedFrames: number;
  status: 'Completed' | 'Processing' | 'Failed';
}

export interface GradCAMResponse {
  success: boolean;
  predicted_class: 'MANIPULATED' | 'AUTHENTIC';
  confidence: number;
  original_frame: string;
  heatmap: string;
  overlay: string;
  target_class_analyzed: string;
  class_probabilities: {
    authentic: number;
    manipulated: number;
  };
  processing_time_ms: number;
  model_name: string;
  target_layer?: string;
  device: string;
  is_trained: boolean;
  error?: string;
}

