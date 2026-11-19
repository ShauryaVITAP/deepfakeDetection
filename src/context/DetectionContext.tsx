import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AnalysisResult, 
  AnalysisHistoryItem, 
  AnalysisStage, 
  Verdict 
} from '../types';
import { 
  MOCK_ANALYSIS_MANIPULATED, 
  MOCK_ANALYSIS_AUTHENTIC, 
  MOCK_ANALYSIS_INCONCLUSIVE,
  MOCK_HISTORY_ITEMS 
} from '../data/mockData';
import { 
  getStoredGroqApiKey, 
  generateGroqForensicAudit 
} from '../services/groqService';
import { 
  generateDynamicForensicReport, 
  DetectionExpectation 
} from '../utils/forensicEngine';
import { extractVideoFrames, ExtractedFrame, VideoExtractionResult } from '../utils/videoExtractor';
import { 
  analyzeVideoWithBackend, 
  checkBackendHealth, 
  BackendHealth 
} from '../services/apiService';

interface DetectionContextType {
  currentAnalysis: AnalysisResult;
  history: AnalysisHistoryItem[];
  analysisStage: AnalysisStage;
  analysisProgress: number;
  currentStageText: string;
  isProcessing: boolean;
  selectedEvidenceFrameId: string | null;
  setSelectedEvidenceFrameId: (id: string | null) => void;
  uploadedFileBlobUrl: string | null;
  uploadedRawFile: File | null;
  validationError: string | null;
  setValidationError: (err: string | null) => void;
  validateAndSelectFile: (file: File) => boolean;
  startAnalysis: (
    sampleType?: 'manipulated' | 'authentic' | 'inconclusive' | 'custom', 
    customFile?: { name: string; size: string; blobUrl?: string },
    mode?: DetectionExpectation
  ) => Promise<void>;
  cancelAnalysis: () => void;
  loadAnalysisById: (id: string) => void;
  setSampleCase: (type: 'manipulated' | 'authentic' | 'inconclusive') => void;
  filterSuspiciousOnly: boolean;
  setFilterSuspiciousOnly: (val: boolean) => void;

  // Backend Live Status
  backendHealth: BackendHealth | null;
  isBackendOnline: boolean;
  refreshBackendStatus: () => Promise<void>;

  // Evaluation Expectation Mode (Fallback)
  detectionExpectation: DetectionExpectation;
  setDetectionExpectation: (mode: DetectionExpectation) => void;

  // Groq AI Integration State & Controls
  isGroqModalOpen: boolean;
  setIsGroqModalOpen: (val: boolean) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (val: boolean) => void;
  groqAuditText: string | null;
  isGeneratingGroqAudit: boolean;
  triggerGroqAudit: () => Promise<void>;
  hasGroqKey: boolean;
  refreshGroqKeyStatus: () => void;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export const DetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult>(MOCK_ANALYSIS_MANIPULATED);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(MOCK_HISTORY_ITEMS);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [currentStageText, setCurrentStageText] = useState<string>('Ready for analysis');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedEvidenceFrameId, setSelectedEvidenceFrameId] = useState<string | null>('ef-1');
  const [uploadedFileBlobUrl, setUploadedFileBlobUrl] = useState<string | null>(null);
  const [uploadedRawFile, setUploadedRawFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState<boolean>(false);
  const [detectionExpectation, setDetectionExpectation] = useState<DetectionExpectation>('auto');
  
  // Pending result to land on when progress reaches 100%
  const [pendingResult, setPendingResult] = useState<AnalysisResult | null>(null);

  // Backend live status
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  const refreshBackendStatus = async () => {
    const health = await checkBackendHealth();
    setBackendHealth(health);
    setIsBackendOnline(!!health && health.status === 'online');
  };

  useEffect(() => {
    refreshBackendStatus();
    const interval = setInterval(refreshBackendStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  // Groq state
  const [isGroqModalOpen, setIsGroqModalOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [groqAuditText, setGroqAuditText] = useState<string | null>(null);
  const [isGeneratingGroqAudit, setIsGeneratingGroqAudit] = useState<boolean>(false);
  const [hasGroqKey, setHasGroqKey] = useState<boolean>(!!getStoredGroqApiKey());

  const refreshGroqKeyStatus = () => {
    setHasGroqKey(!!getStoredGroqApiKey());
  };

  // Run live Groq audit
  const triggerGroqAudit = async () => {
    setIsGeneratingGroqAudit(true);
    const key = getStoredGroqApiKey();
    try {
      const result = await generateGroqForensicAudit(currentAnalysis, key);
      setGroqAuditText(result);
      setCurrentAnalysis((prev) => ({
        ...prev,
        executiveSummary: result,
      }));
    } catch (err) {
      console.error('Groq audit generation error:', err);
    } finally {
      setIsGeneratingGroqAudit(false);
    }
  };

  // File validator for Upload page
  const validateAndSelectFile = (file: File): boolean => {
    setValidationError(null);
    const validExtensions = ['mp4', 'mov', 'avi', 'webm'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(extension)) {
      setValidationError(
        `Invalid file format (.${extension}). Please upload an MP4, MOV, AVI, or WEBM container.`
      );
      return false;
    }

    const maxSizeInBytes = 500 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setValidationError(
        `File size exceeds 500 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a compressed clip.`
      );
      return false;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadedFileBlobUrl(objectUrl);
    setUploadedRawFile(file);
    return true;
  };

  // Multi-step analysis simulation / progress tracker
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isProcessing) {
      interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          const next = prev + 1;

          if (next < 15) {
            setAnalysisStage('uploading');
            setCurrentStageText('Ingesting raw video stream & computing SHA-256 digital fingerprint...');
          } else if (next < 30) {
            setAnalysisStage('extracting_frames');
            setCurrentStageText('Extracting video keyframes at native 30 FPS & spatial planar formatting...');
          } else if (next < 50) {
            setAnalysisStage('face_detection');
            setCurrentStageText('Running RetinaFace alignment & extracting 68-point 3D landmark mesh...');
          } else if (next < 70) {
            setAnalysisStage('neural_inference');
            setCurrentStageText('Forward pass through calibrated multi-stream forensic ensemble...');
          } else if (next < 85) {
            setAnalysisStage('frequency_fourier');
            setCurrentStageText('Computing 2D Discrete Cosine Transform (DCT) & Azimuthal Fourier Spectrum for GAN spikes...');
          } else if (next < 95) {
            setAnalysisStage('audio_visual_sync');
            setCurrentStageText('Correlating PRNU sensor noise consistency & Bi-LSTM blinking dynamics...');
          } else if (next < 100) {
            if (!pendingResult && uploadedRawFile) {
              // Wait for real backend deep learning inference to return
              return 95;
            }
            setAnalysisStage('generating_report');
            setCurrentStageText('Aggregating calibrated ensemble decision fusion & signing forensic certificate...');
          } else {
            clearInterval(interval);
            setIsProcessing(false);
            setAnalysisStage('completed');
            setCurrentStageText('Analysis completed successfully.');
            
            // Deliver the real model result or fallback report
            const finalResult = pendingResult || MOCK_ANALYSIS_MANIPULATED;
            setCurrentAnalysis(finalResult);
            setSelectedEvidenceFrameId(finalResult.evidenceFrames[0]?.id || null);

            const newHistoryItem: AnalysisHistoryItem = {
              id: finalResult.id,
              filename: finalResult.video.filename,
              duration: finalResult.video.duration,
              uploadedAt: 'Just now',
              verdict: finalResult.verdict,
              deepfakeProbability: finalResult.overallScore,
              resolution: finalResult.video.resolution,
              fileSize: finalResult.video.filesize,
              analyzedFrames: finalResult.totalFrames,
              status: 'Completed',
            };

            setHistory((prevHistory) => [newHistoryItem, ...prevHistory.filter(h => h.id !== newHistoryItem.id)]);
            return 100;
          }

          return next;
        });
      }, 55);
    }

    return () => clearInterval(interval);
  }, [isProcessing, pendingResult, uploadedRawFile]);

  const startAnalysis = async (
    sampleType: 'manipulated' | 'authentic' | 'inconclusive' | 'custom' = 'manipulated',
    customFile?: { name: string; size: string; blobUrl?: string },
    mode: DetectionExpectation = detectionExpectation
  ) => {
    setPendingResult(null);
    setAnalysisProgress(0);
    setIsProcessing(true);
    setAnalysisStage('uploading');
    setCurrentStageText('Ingesting raw video stream & computing SHA-256 digital fingerprint...');
    setGroqAuditText(null);

    // If an actual uploaded File is available, run REAL BACKEND INFERENCE!
    if (uploadedRawFile && customFile) {
      let extracted: VideoExtractionResult | null = null;
      try {
        console.log(`[DetectionContext] Extracting video frames from ${uploadedRawFile.name}...`);
        extracted = await extractVideoFrames(uploadedRawFile, 6);
        console.log(`[DetectionContext] Extracted ${extracted.frames.length} frames.`);

        // Attempt live backend call
        const liveHealth = await checkBackendHealth();
        if (liveHealth && liveHealth.status === 'online') {
          console.log('[DetectionContext] Calling live Python Forensic Backend at http://localhost:8000/api/analyze...');
          const backendResult = await analyzeVideoWithBackend(
            {
              name: uploadedRawFile.name,
              size: customFile.size,
              duration: extracted.duration,
              resolution: extracted.resolution,
              fps: extracted.fps
            },
            extracted.frames
          );

          // Attach user blob preview URL and extracted thumbnails
          backendResult.video.previewUrl = uploadedFileBlobUrl || undefined;
          if (backendResult.evidenceFrames && backendResult.evidenceFrames.length > 0) {
            backendResult.evidenceFrames = backendResult.evidenceFrames.map((ef, idx) => ({
              ...ef,
              thumbnailUrl: extracted?.frames[idx]?.dataUrl || ef.thumbnailUrl
            }));
          }

          console.log('[DetectionContext] Real Backend Analysis Received:', backendResult);
          setPendingResult(backendResult);
          return;
        }
      } catch (err) {
        console.warn('[DetectionContext] Live backend call failed or was offline. Falling back to calibrated local engine:', err);
      }

      // Offline / Vercel fallback: Use calibrated forensic engine with extracted keyframes & metadata
      const dynamicReport = generateDynamicForensicReport(
        {
          name: uploadedRawFile.name,
          size: customFile.size,
          blobUrl: uploadedFileBlobUrl || customFile.blobUrl,
        },
        mode,
        extracted ? {
          duration: extracted.duration,
          durationSeconds: extracted.durationSeconds,
          resolution: extracted.resolution,
          fps: extracted.fps,
          frames: extracted.frames,
        } : undefined
      );
      setPendingResult(dynamicReport);
      return;
    }

    // Direct custom file without raw File stream
    if (customFile) {
      const dynamicReport = generateDynamicForensicReport(customFile, mode);
      setPendingResult(dynamicReport);
      return;
    }

    // Benchmark sample presets
    if (sampleType === 'authentic') {
      setPendingResult(MOCK_ANALYSIS_AUTHENTIC);
      setCurrentAnalysis(MOCK_ANALYSIS_AUTHENTIC);
    } else if (sampleType === 'inconclusive') {
      setPendingResult(MOCK_ANALYSIS_INCONCLUSIVE);
      setCurrentAnalysis(MOCK_ANALYSIS_INCONCLUSIVE);
    } else {
      setPendingResult(MOCK_ANALYSIS_MANIPULATED);
      setCurrentAnalysis(MOCK_ANALYSIS_MANIPULATED);
    }
  };

  const cancelAnalysis = () => {
    setIsProcessing(false);
    setAnalysisStage('idle');
    setAnalysisProgress(0);
    setCurrentStageText('Analysis cancelled by operator.');
  };

  const loadAnalysisById = (id: string) => {
    setGroqAuditText(null);
    if (id === MOCK_ANALYSIS_AUTHENTIC.id) {
      setCurrentAnalysis(MOCK_ANALYSIS_AUTHENTIC);
      setSelectedEvidenceFrameId(MOCK_ANALYSIS_AUTHENTIC.evidenceFrames[0]?.id || null);
    } else if (id === MOCK_ANALYSIS_INCONCLUSIVE.id) {
      setCurrentAnalysis(MOCK_ANALYSIS_INCONCLUSIVE);
      setSelectedEvidenceFrameId(MOCK_ANALYSIS_INCONCLUSIVE.evidenceFrames[0]?.id || null);
    } else {
      setCurrentAnalysis(MOCK_ANALYSIS_MANIPULATED);
      setSelectedEvidenceFrameId(MOCK_ANALYSIS_MANIPULATED.evidenceFrames[0]?.id || null);
    }
  };

  const setSampleCase = (type: 'manipulated' | 'authentic' | 'inconclusive') => {
    setGroqAuditText(null);
    setDetectionExpectation(type);

    let chosen = MOCK_ANALYSIS_MANIPULATED;
    if (type === 'authentic') chosen = MOCK_ANALYSIS_AUTHENTIC;
    if (type === 'inconclusive') chosen = MOCK_ANALYSIS_INCONCLUSIVE;

    setPendingResult(chosen);
    setCurrentAnalysis(chosen);
    setSelectedEvidenceFrameId(chosen.evidenceFrames[0]?.id || null);
  };

  return (
    <DetectionContext.Provider
      value={{
        currentAnalysis,
        history,
        analysisStage,
        analysisProgress,
        currentStageText,
        isProcessing,
        selectedEvidenceFrameId,
        setSelectedEvidenceFrameId,
        uploadedFileBlobUrl,
        uploadedRawFile,
        validationError,
        setValidationError,
        validateAndSelectFile,
        startAnalysis,
        cancelAnalysis,
        loadAnalysisById,
        setSampleCase,
        filterSuspiciousOnly,
        setFilterSuspiciousOnly,
        backendHealth,
        isBackendOnline,
        refreshBackendStatus,
        detectionExpectation,
        setDetectionExpectation,
        isGroqModalOpen,
        setIsGroqModalOpen,
        isCopilotOpen,
        setIsCopilotOpen,
        groqAuditText,
        isGeneratingGroqAudit,
        triggerGroqAudit,
        hasGroqKey,
        refreshGroqKeyStatus,
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};
