import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Mic, 
  Eye, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  XOctagon, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, DemoDataBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const AnalysisProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    analysisProgress, 
    currentStageText, 
    cancelAnalysis, 
    currentAnalysis,
    isProcessing,
    analysisStage 
  } = useDetection();

  // Auto redirect to results when completed
  useEffect(() => {
    if (analysisProgress === 100 && analysisStage === 'completed') {
      const timeout = setTimeout(() => {
        navigate('/results');
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [analysisProgress, analysisStage, navigate]);

  const stages = [
    {
      id: 1,
      title: 'Ingestion & Hashing',
      desc: 'SHA-256 fingerprint & container validation',
      threshold: 15,
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 2,
      title: 'Frame & Mesh Decoupling',
      desc: '30 fps frame splitting & 68-point 3D landmarking',
      threshold: 45,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 3,
      title: 'Ensemble Neural Inference',
      desc: 'EfficientNet-B4, MesoInception-4, FFT, Wav2Lip',
      threshold: 85,
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 4,
      title: 'Forensic Synthesis',
      desc: 'Ensemble voting & cryptographic certificate',
      threshold: 100,
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const handleCancel = () => {
    cancelAnalysis();
    navigate('/upload');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Status Banner */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="plum" size="lg" dot>
            Active Neural Inference Pipeline
          </Badge>
          <DemoDataBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F0FA] tracking-tight">
          Analyzing Media Forensic Integrity
        </h1>
        <p className="text-sm text-[#A39AAA] font-mono">
          Target: {currentAnalysis.video.filename} • Multi-Stream Ensemble v3.2
        </p>
      </div>

      {/* Main HUD Card */}
      <Card className="relative overflow-hidden border-[#B58AFF]/50 shadow-[0_0_40px_rgba(181,138,255,0.15)] p-6 sm:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#522F6E]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Progress Bar & Percentage */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-[#B58AFF] tracking-wider">
                Current Pipeline Phase
              </span>
              <div className="text-base sm:text-lg font-bold text-[#F5F0FA] mt-0.5">
                {currentStageText}
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#F5F0FA]">
              {analysisProgress}%
            </div>
          </div>

          <ProgressBar
            value={analysisProgress}
            showPercentage={false}
            color="plum"
            size="lg"
          />
        </div>

        {/* Cinematic Scanner Frame Graphic */}
        <div className="mt-8 relative aspect-video sm:aspect-[21/9] rounded-2xl bg-[#17151C] border border-[#363042] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-ai-grid opacity-60" />

          {/* Laser Scanner sweep */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#B58AFF] to-transparent animate-scan z-20 shadow-[0_0_12px_#B58AFF]" />

          {/* Center Target Box */}
          <div className="relative z-10 w-44 h-48 border-2 border-dashed border-[#B58AFF]/60 rounded-3xl flex flex-col items-center justify-center p-4 bg-[#24212B]/50 backdrop-blur-xs">
            <span className="text-[10px] font-mono text-[#D6B8E8] uppercase tracking-wider mb-2">
              Facial Region #01
            </span>
            <div className="relative w-20 h-24 border border-[#B58AFF]/40 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#B58AFF] absolute top-6 left-3 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-[#B58AFF] absolute top-6 right-3 animate-ping" />
              <span className="w-6 h-1.5 rounded-full bg-[#FF5370] absolute bottom-6 shadow-[0_0_8px_#FF5370]" />
            </div>
            <span className="text-[9px] font-mono text-[#A39AAA] mt-2">
              Mesh: 68-Pts Active
            </span>
          </div>

          {/* Corner Telemetry Readouts */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ED573] animate-pulse" />
            <span className="text-xs font-mono text-[#2ED573]">CUDA: 0.94 TFLOPS</span>
          </div>

          <div className="absolute bottom-4 left-4 z-20 text-[11px] font-mono text-[#A39AAA]">
            Buffer: {Math.round((analysisProgress / 100) * currentAnalysis.totalFrames)} / {currentAnalysis.totalFrames} frames
          </div>

          <div className="absolute bottom-4 right-4 z-20 text-[11px] font-mono text-[#D6B8E8]">
            PyTorch Ensemble Active
          </div>
        </div>

        {/* 4 Pipeline Stage Stepper */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const isCompleted = analysisProgress >= stage.threshold;
            const isCurrent = analysisProgress < stage.threshold && (stage.id === 1 || analysisProgress >= stages[stage.id - 2].threshold);

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-[#2A1B38]/60 border-[#B58AFF]/50'
                    : isCurrent
                    ? 'bg-[#24212B] border-[#B58AFF] shadow-[0_0_15px_rgba(181,138,255,0.2)]'
                    : 'bg-[#1E1B24] border-[#363042] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted ? 'bg-[#2ED573]/20 text-[#2ED573]' : isCurrent ? 'bg-[#2A1B38] text-[#B58AFF]' : 'bg-[#17151C] text-[#A39AAA]'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.icon}
                  </div>
                  <span className="text-[10px] font-mono text-[#A39AAA]">Phase 0{stage.id}</span>
                </div>
                <div className="text-xs font-bold text-[#F5F0FA]">{stage.title}</div>
                <div className="text-[11px] text-[#A39AAA] mt-0.5 leading-snug">{stage.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Terminal Live Output Simulation */}
        <div className="mt-8 rounded-2xl bg-[#17151C] border border-[#363042] p-4 font-mono text-xs text-[#A39AAA] space-y-1.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#363042]/70 text-[11px]">
            <span className="flex items-center gap-2 text-[#D6B8E8]">
              <Terminal className="w-3.5 h-3.5 text-[#B58AFF]" />
              Forensic Inference stdout
            </span>
            <span className="text-[#2ED573]">STREAMING</span>
          </div>

          <div className="text-xs space-y-1 pt-1">
            <p className="text-[#A39AAA]">&gt; [SHA-256] Digest: {currentAnalysis.video.sha256Hash.substring(0, 32)}...</p>
            <p className="text-[#A39AAA]">&gt; [FFmpeg] Extracted {currentAnalysis.totalFrames} frames @ 1080p RGB24 planar format</p>
            {analysisProgress > 25 && (
              <p className="text-[#B58AFF]">&gt; [RetinaFace] Detected 1 primary face subject; landmarks aligned</p>
            )}
            {analysisProgress > 50 && (
              <p className="text-[#D6B8E8]">&gt; [EfficientNet-B4] Forward pass completed (batch size: 32, latency: 142ms)</p>
            )}
            {analysisProgress > 70 && (
              <p className="text-[#FFA502]">&gt; [Wav2Lip] Audio-visual cross-correlation computed; temporal phase offset recorded</p>
            )}
            {analysisProgress > 85 && (
              <p className="text-[#2ED573]">&gt; [EnsembleFusion] Calibrated softmax fusion aggregating 5 model outputs...</p>
            )}
          </div>
        </div>

        {/* Abort Button */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<XOctagon className="w-4 h-4 text-[#FF5370]" />}
            onClick={handleCancel}
            className="text-[#FF5370] hover:bg-[#FF5370]/10"
          >
            Abort Analysis
          </Button>

          {analysisProgress === 100 && (
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => navigate('/results')}
            >
              View Results Now
            </Button>
          )}
        </div>
      </Card>

    </div>
  );
};
