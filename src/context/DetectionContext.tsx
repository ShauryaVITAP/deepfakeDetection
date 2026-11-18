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
  validationError: string | null;
  setValidationError: (err: string | null) => void;
  validateAndSelectFile: (file: File) => boolean;
  startAnalysis: (
    sampleType?: 'manipulated' | 'authentic' | 'inconclusive' | 'custom', 
    customFile?: { name: string; size: string; blobUrl?: string }
  ) => void;
  cancelAnalysis: () => void;
  loadAnalysisById: (id: string) => void;
  setSampleCase: (type: 'manipulated' | 'authentic' | 'inconclusive') => void;
  filterSuspiciousOnly: boolean;
  setFilterSuspiciousOnly: (val: boolean) => void;
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
  const [targetOutcome, setTargetOutcome] = useState<'manipulated' | 'authentic' | 'inconclusive'>('manipulated');
  const [uploadedFileBlobUrl, setUploadedFileBlobUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState<boolean>(false);

  // File validator for Upload page
  const validateAndSelectFile = (file: File): boolean => {
    setValidationError(null);
    const validExtensions = ['mp4', 'mov', 'avi', 'webm'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // Check extension
    if (!validExtensions.includes(extension)) {
      setValidationError(
        `Invalid file format (.${extension}). Please upload an MP4, MOV, AVI, or WEBM container.`
      );
      return false;
    }

    // Check size limit: 500 MB
    const maxSizeInBytes = 500 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setValidationError(
        `File size exceeds 500 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a compressed clip.`
      );
      return false;
    }

    // Create object URL for local previewing
    const objectUrl = URL.createObjectURL(file);
    setUploadedFileBlobUrl(objectUrl);
    return true;
  };

  // Multi-step analysis simulation pipeline
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
            setCurrentStageText('Forward pass through EfficientNet-B4 dual-attention & XceptionNet spatial backbones...');
          } else if (next < 85) {
            setAnalysisStage('frequency_fourier');
            setCurrentStageText('Computing 2D Discrete Cosine Transform (DCT) & Azimuthal Fourier Spectrum for GAN spikes...');
          } else if (next < 95) {
            setAnalysisStage('audio_visual_sync');
            setCurrentStageText('Correlating Wav2Lip phoneme-viseme offsets & Bi-LSTM recurrent blinking dynamics...');
          } else if (next < 100) {
            setAnalysisStage('generating_report');
            setCurrentStageText('Aggregating calibrated ensemble decision fusion & signing forensic certificate...');
          } else {
            // Completed!
            clearInterval(interval);
            setIsProcessing(false);
            setAnalysisStage('completed');
            setCurrentStageText('Analysis completed successfully.');
            
            // Choose analysis result based on selected sample
            let finalResult = MOCK_ANALYSIS_MANIPULATED;
            if (targetOutcome === 'authentic') {
              finalResult = MOCK_ANALYSIS_AUTHENTIC;
            } else if (targetOutcome === 'inconclusive') {
              finalResult = MOCK_ANALYSIS_INCONCLUSIVE;
            }

            // If user uploaded a custom file or blob URL, carry it over
            if (uploadedFileBlobUrl) {
              finalResult = {
                ...finalResult,
                video: {
                  ...finalResult.video,
                  previewUrl: uploadedFileBlobUrl,
                }
              };
            }

            setCurrentAnalysis(finalResult);
            setSelectedEvidenceFrameId(finalResult.evidenceFrames[0]?.id || null);

            // Add to history
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
      }, 65); // ~6.5 seconds for complete realistic simulation
    }

    return () => clearInterval(interval);
  }, [isProcessing, targetOutcome, uploadedFileBlobUrl]);

  const startAnalysis = (
    sampleType: 'manipulated' | 'authentic' | 'inconclusive' | 'custom' = 'manipulated',
    customFile?: { name: string; size: string; blobUrl?: string }
  ) => {
    let outcome: 'manipulated' | 'authentic' | 'inconclusive' = 'manipulated';
    if (sampleType === 'authentic') outcome = 'authentic';
    if (sampleType === 'inconclusive') outcome = 'inconclusive';

    setTargetOutcome(outcome);
    setAnalysisProgress(0);
    setIsProcessing(true);
    setAnalysisStage('uploading');
    setCurrentStageText('Ingesting raw video stream & computing SHA-256 digital fingerprint...');
    
    if (customFile) {
      let template = MOCK_ANALYSIS_MANIPULATED;
      if (outcome === 'authentic') template = MOCK_ANALYSIS_AUTHENTIC;
      if (outcome === 'inconclusive') template = MOCK_ANALYSIS_INCONCLUSIVE;

      setCurrentAnalysis({
        ...template,
        video: {
          ...template.video,
          filename: customFile.name,
          filesize: customFile.size,
          previewUrl: customFile.blobUrl,
        }
      });
    }
  };

  const cancelAnalysis = () => {
    setIsProcessing(false);
    setAnalysisStage('idle');
    setAnalysisProgress(0);
    setCurrentStageText('Analysis cancelled by operator.');
  };

  const loadAnalysisById = (id: string) => {
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
    setTargetOutcome(type);
    let chosen = MOCK_ANALYSIS_MANIPULATED;
    if (type === 'authentic') chosen = MOCK_ANALYSIS_AUTHENTIC;
    if (type === 'inconclusive') chosen = MOCK_ANALYSIS_INCONCLUSIVE;

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
        validationError,
        setValidationError,
        validateAndSelectFile,
        startAnalysis,
        cancelAnalysis,
        loadAnalysisById,
        setSampleCase,
        filterSuspiciousOnly,
        setFilterSuspiciousOnly,
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
