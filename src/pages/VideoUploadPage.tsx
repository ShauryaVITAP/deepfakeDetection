import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileVideo, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Info, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Zap,
  Film,
  Play,
  RotateCcw
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, DemoDataBadge } from '../components/common/Badge';

export const VideoUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    startAnalysis, 
    validateAndSelectFile, 
    validationError, 
    setValidationError,
    uploadedFileBlobUrl 
  } = useDetection();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: 'manipulated' | 'authentic' | 'inconclusive' | 'custom';
    blobUrl?: string;
  } | null>({
    name: "investor_keynote_ceo_deepfake_sample.mp4",
    size: "48.6 MB",
    type: 'manipulated',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [pipelineMode, setPipelineMode] = useState<'comprehensive' | 'fast'>('comprehensive');
  const [samplingRate, setSamplingRate] = useState<'native' | 'sparse'>('native');
  const [enableAudioForensics, setEnableAudioForensics] = useState(true);

  const benchmarkSamples = [
    {
      id: 'sample-1',
      title: 'Deepfake Face-Swap Sample',
      filename: 'investor_keynote_ceo_deepfake_sample.mp4',
      size: '48.6 MB',
      duration: '00:42',
      type: 'manipulated' as const,
      expected: 'MANIPULATED (88.6%)',
      description: 'Autoencoder face-swap with subtle jawline boundary blending and FFT frequency grid spikes.',
      tag: 'Recommended for Deepfake Demo',
    },
    {
      id: 'sample-2',
      title: 'Authentic Source Video',
      filename: 'academic_press_conference_raw_source.mp4',
      size: '62.1 MB',
      duration: '00:58',
      type: 'authentic' as const,
      expected: 'AUTHENTIC (4.8%)',
      description: 'Camera optical capture with natural blinking rate, coherent PRNU sensor noise, and tight audio lip-sync.',
      tag: 'Recommended for Ground Truth',
    },
    {
      id: 'sample-3',
      title: 'Compressed CCTV Deposition',
      filename: 'court_evidence_cctv_deposition_compressed.mp4',
      size: '39.2 MB',
      duration: '00:35',
      type: 'inconclusive' as const,
      expected: 'INCONCLUSIVE (52.4%)',
      description: 'Low-bitrate H.264 macroblock artifacts obscuring subtle facial boundaries.',
      tag: 'Inconclusive Boundary Case',
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const isValid = validateAndSelectFile(file);
    if (isValid) {
      const blobUrl = URL.createObjectURL(file);
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'custom',
        blobUrl: blobUrl,
      });
    }
  };

  const handleStartScan = () => {
    if (selectedFile) {
      startAnalysis(selectedFile.type, {
        name: selectedFile.name,
        size: selectedFile.size,
        blobUrl: selectedFile.blobUrl,
      });
    } else {
      startAnalysis('manipulated');
    }
    navigate('/progress');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-[#363042]">
        <div className="flex items-center gap-2">
          <Badge variant="plum">Media Ingestion Pipeline</Badge>
          <DemoDataBadge />
          <span className="text-xs text-[#A39AAA] font-mono">Stage 1 of 4</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#F5F0FA] tracking-tight">
          Video Ingestion & Neural Forensic Setup
        </h1>
        <p className="text-sm text-[#A39AAA] max-w-3xl">
          Upload any target video container or select from pre-calibrated B.Tech capstone benchmark 
          evaluation samples to run multi-stream deepfake detection.
        </p>
      </div>

      {/* Validation Error Alert State */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-[#FF5370]/15 border border-[#FF5370]/50 flex items-start gap-3 text-xs text-[#FF5370] animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#FF5370]" />
          <div className="space-y-1">
            <span className="font-bold text-sm block">File Validation Failed</span>
            <p className="text-[#F5F0FA]">{validationError}</p>
          </div>
          <button 
            onClick={() => setValidationError(null)} 
            className="ml-auto text-xs font-semibold underline cursor-pointer text-[#FF5370]"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 cols): Upload Dropzone & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Interactive Drag & Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all duration-300 cursor-pointer relative overflow-hidden group ${
              isDragging
                ? 'border-[#B58AFF] bg-[#2A1B38]/50 shadow-[0_0_30px_rgba(181,138,255,0.3)]'
                : 'border-[#363042] bg-[#24212B]/90 hover:border-[#B58AFF]/60 hover:bg-[#2C2836]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="video/mp4,video/avi,video/quicktime,video/webm"
              className="hidden"
            />

            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#2A1B38] border border-[#B58AFF]/40 text-[#B58AFF] flex items-center justify-center mx-auto group-hover:scale-105 group-hover:border-[#C7A3FF] transition-all shadow-[0_0_20px_rgba(181,138,255,0.2)]">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#F5F0FA]">
                  Drag and drop your target video here
                </h3>
                <p className="text-xs text-[#A39AAA] mt-1">
                  Supported formats: MP4, MOV, AVI, WEBM • Max size: 500 MB • 30/60 FPS recommended
                </p>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E1B24] border border-[#363042] text-xs font-semibold text-[#D6B8E8] group-hover:border-[#B58AFF]/50 transition-colors">
                  <Film className="w-3.5 h-3.5 text-[#B58AFF]" />
                  Browse Local Video Files
                </span>
              </div>
            </div>
          </div>

          {/* Selected File & Live HTML5 Video Preview Banner */}
          {selectedFile && (
            <Card className="p-5 border-[#B58AFF]/50 shadow-[0_4px_20px_rgba(42,27,56,0.4)] space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/40 flex items-center justify-center text-[#B58AFF] shrink-0">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#F5F0FA] truncate font-mono">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-[#A39AAA] flex items-center gap-2 mt-0.5">
                      <span>{selectedFile.size}</span>
                      <span>•</span>
                      <span className="text-[#D6B8E8] capitalize">
                        {selectedFile.type === 'custom' ? 'Local Upload' : `Preset: ${selectedFile.type}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Badge variant={selectedFile.type === 'authentic' ? 'authentic' : selectedFile.type === 'inconclusive' ? 'inconclusive' : 'manipulated'} size="sm">
                    Ready to Scan
                  </Badge>
                </div>
              </div>

              {/* Real Video Preview Player */}
              <div className="relative aspect-video rounded-2xl bg-[#17151C] border border-[#363042] overflow-hidden flex items-center justify-center">
                {selectedFile.blobUrl ? (
                  <video 
                    src={selectedFile.blobUrl} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#2A1B38] border border-[#B58AFF]/40 text-[#B58AFF] flex items-center justify-center mx-auto">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <div className="text-xs text-[#F5F0FA] font-mono font-semibold">
                      Benchmark Clip: {selectedFile.name}
                    </div>
                    <p className="text-[11px] text-[#A39AAA] max-w-sm mx-auto">
                      Pre-calibrated facial tensors and extracted frames ready for multi-model inference.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Forensic Pipeline Configuration */}
          <Card>
            <CardHeader
              title="Forensic Configuration Parameters"
              subtitle="Fine-tune deep neural inferencing stages"
              icon={<Sliders className="w-5 h-5 text-[#B58AFF]" />}
            />

            <div className="space-y-4 pt-2">
              
              {/* Pipeline Preset */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F0FA] mb-2">
                  Detection Pipeline Preset
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPipelineMode('comprehensive')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      pipelineMode === 'comprehensive'
                        ? 'bg-[#2A1B38] border-[#B58AFF] text-[#F5F0FA]'
                        : 'bg-[#1E1B24] border-[#363042] text-[#A39AAA] hover:bg-[#24212B]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span>Comprehensive Ensemble</span>
                      <Zap className="w-3.5 h-3.5 text-[#B58AFF]" />
                    </div>
                    <div className="text-[11px] text-[#A39AAA]">
                      All 5 models: Spatial + Temporal + FFT + Wav2Lip
                    </div>
                  </button>

                  <button
                    onClick={() => setPipelineMode('fast')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      pipelineMode === 'fast'
                        ? 'bg-[#2A1B38] border-[#B58AFF] text-[#F5F0FA]'
                        : 'bg-[#1E1B24] border-[#363042] text-[#A39AAA] hover:bg-[#24212B]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span>Fast Screening</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#D6B8E8]" />
                    </div>
                    <div className="text-[11px] text-[#A39AAA]">
                      EfficientNet-B4 + MesoInception-4 (Rapid)
                    </div>
                  </button>
                </div>
              </div>

              {/* Sampling Rate & Audio Sync */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F0FA] mb-1.5">
                    Frame Sampling Strategy
                  </label>
                  <select
                    value={samplingRate}
                    onChange={(e) => setSamplingRate(e.target.value as any)}
                    className="w-full bg-[#1E1B24] border border-[#363042] rounded-xl px-3 py-2 text-xs text-[#F5F0FA] focus:outline-none focus:border-[#B58AFF]"
                  >
                    <option value="native">Native 30 FPS (Full Temporal Mesh)</option>
                    <option value="sparse">Sparse 10 FPS (Keyframe Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F0FA] mb-1.5">
                    Multimodal Audio Analysis
                  </label>
                  <div
                    onClick={() => setEnableAudioForensics(!enableAudioForensics)}
                    className="flex items-center justify-between bg-[#1E1B24] border border-[#363042] rounded-xl px-3 py-2 text-xs cursor-pointer select-none"
                  >
                    <span className="text-[#F5F0FA]">Wav2Lip Lip-Sync</span>
                    <span className={`font-mono font-bold ${enableAudioForensics ? 'text-[#2ED573]' : 'text-[#A39AAA]'}`}>
                      {enableAudioForensics ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Launch Scan CTA */}
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base py-4"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
            onClick={handleStartScan}
          >
            Launch Neural Forensic Scan
          </Button>
        </div>

        {/* Right Column (5 cols): Pre-Calibrated B.Tech Benchmark Samples */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F5F0FA] uppercase tracking-wider">
              Evaluator Benchmark Cases
            </h3>
            <Badge variant="plum" size="sm">Pre-Loaded</Badge>
          </div>

          <p className="text-xs text-[#A39AAA]">
            For testing and viva defense presentations, choose any curated benchmark sample:
          </p>

          <div className="space-y-3">
            {benchmarkSamples.map((sample) => {
              const isSelected = selectedFile?.name === sample.filename;
              return (
                <div
                  key={sample.id}
                  onClick={() => {
                    setValidationError(null);
                    setSelectedFile({ 
                      name: sample.filename, 
                      size: sample.size, 
                      type: sample.type 
                    });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#2A1B38] border-[#B58AFF] shadow-[0_0_20px_rgba(181,138,255,0.2)]'
                      : 'bg-[#24212B] border-[#363042] hover:border-[#4B3F5E] hover:bg-[#2C2836]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F5F0FA]">{sample.title}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                          sample.type === 'manipulated' 
                            ? 'bg-[#FF5370]/20 text-[#FF5370]' 
                            : sample.type === 'authentic'
                            ? 'bg-[#2ED573]/20 text-[#2ED573]'
                            : 'bg-[#FFA502]/20 text-[#FFA502]'
                        }`}>
                          {sample.expected}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#D6B8E8] mt-0.5">{sample.filename}</div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#B58AFF] bg-[#B58AFF] text-[#17151C]' : 'border-[#363042]'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-[#A39AAA] leading-relaxed">
                    {sample.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#363042]/50 flex items-center justify-between text-[11px] text-[#A39AAA]">
                    <span>{sample.size} • {sample.duration}</span>
                    <span className="text-[#B58AFF] font-medium">{sample.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Academic Integrity Note */}
          <div className="p-4 rounded-2xl bg-[#1E1B24] border border-[#363042] text-xs text-[#A39AAA] space-y-1.5">
            <div className="flex items-center gap-2 text-[#D6B8E8] font-bold">
              <Info className="w-4 h-4 text-[#B58AFF]" />
              <span>Capstone Technical Scope</span>
            </div>
            <p className="leading-relaxed">
              Equipped with client-side video decoding and mock forensic inference tensors, 
              ready for direct PyTorch backend integration via FastAPI REST endpoint.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
