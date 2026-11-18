import React, { useState } from 'react';
import { 
  Film, 
  Layers, 
  Eye, 
  Radio, 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Crosshair,
  Sparkles,
  Info,
  Filter
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, VerdictBadge, DemoDataBadge } from '../components/common/Badge';

export const FrameEvidencePage: React.FC = () => {
  const { currentAnalysis, selectedEvidenceFrameId, setSelectedEvidenceFrameId } = useDetection();

  const [showMesh, setShowMesh] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBbox, setShowBbox] = useState(true);
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);

  const displayedFrames = suspiciousOnly 
    ? currentAnalysis.evidenceFrames.filter(f => f.isSuspicious)
    : currentAnalysis.evidenceFrames;

  const selectedFrame = 
    displayedFrames.find((f) => f.id === selectedEvidenceFrameId) ||
    displayedFrames[0] ||
    currentAnalysis.evidenceFrames[0];

  const currentIndex = displayedFrames.findIndex(
    (f) => f.id === (selectedFrame?.id || '')
  );

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedEvidenceFrameId(displayedFrames[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < displayedFrames.length - 1) {
      setSelectedEvidenceFrameId(displayedFrames[currentIndex + 1].id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#363042]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="plum">Forensic Visual Evidence</Badge>
            <DemoDataBadge />
            <span className="text-xs text-[#A39AAA] font-mono">Stage 3 of 4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0FA] tracking-tight">
            Frame-by-Frame Anomaly Inspection
          </h1>
          <p className="text-xs sm:text-sm text-[#A39AAA]">
            Examine high-confidence anomaly frames with 3D landmark mesh, spatial heatmaps, and bounding box telemetry.
          </p>
        </div>

        {/* Viewport Toggles & Suspicious Filter */}
        <div className="flex flex-wrap items-center gap-2 bg-[#1E1B24] p-1.5 rounded-2xl border border-[#363042]">
          <button
            onClick={() => setSuspiciousOnly(!suspiciousOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              suspiciousOnly
                ? 'bg-[#FF5370]/20 text-[#FF5370] border border-[#FF5370]/40'
                : 'text-[#A39AAA] hover:text-[#F5F0FA]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Suspicious Only</span>
          </button>

          <div className="h-4 w-px bg-[#363042] mx-1" />

          <button
            onClick={() => setShowMesh(!showMesh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              showMesh
                ? 'bg-[#2A1B38] text-[#B58AFF] border border-[#B58AFF]/40'
                : 'text-[#A39AAA] hover:text-[#F5F0FA]'
            }`}
          >
            Mesh: {showMesh ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              showHeatmap
                ? 'bg-[#2A1B38] text-[#FF5370] border border-[#FF5370]/40'
                : 'text-[#A39AAA] hover:text-[#F5F0FA]'
            }`}
          >
            Heatmap: {showHeatmap ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowBbox(!showBbox)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              showBbox
                ? 'bg-[#2A1B38] text-[#D6B8E8] border border-[#D6B8E8]/40'
                : 'text-[#A39AAA] hover:text-[#F5F0FA]'
            }`}
          >
            BBox: {showBbox ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Forensic Viewport & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left (7 cols): High-Resolution Forensic Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 sm:p-6 bg-[#24212B] border-[#363042]">
            
            {/* Viewport Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#363042] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B58AFF] animate-ping" />
                <span className="font-mono text-[#F5F0FA] font-bold">
                  FRAME #{selectedFrame.frameNumber}
                </span>
                <span className="text-[#A39AAA]">@ {selectedFrame.timestamp}</span>
              </div>

              <div className="flex items-center gap-2">
                <VerdictBadge verdict={selectedFrame.verdict} size="sm" />
                <Badge variant={selectedFrame.deepfakeProbability > 60 ? 'manipulated' : selectedFrame.deepfakeProbability < 40 ? 'authentic' : 'inconclusive'} size="sm">
                  {selectedFrame.deepfakeProbability}% Risk
                </Badge>
              </div>
            </div>

            {/* Viewport Frame Canvas */}
            <div className="relative aspect-video rounded-2xl bg-[#17151C] border border-[#363042] overflow-hidden flex items-center justify-center select-none">
              
              {/* Background Grid Pattern */}
              <div className="absolute inset-0 bg-ai-grid opacity-50" />

              {/* Simulated Face Canvas Subject */}
              <div className="relative z-10 w-64 h-72 border border-[#363042] rounded-3xl bg-[#1E1B24]/70 flex flex-col items-center justify-center p-6 shadow-2xl">
                
                {/* Heatmap Overlay */}
                {showHeatmap && selectedFrame.heatMapIntensity !== 'None' && (
                  <div className="absolute inset-0 bg-radial-plum opacity-80 pointer-events-none rounded-3xl" />
                )}

                {/* Bounding Box Overlay */}
                {showBbox && (
                  <div className="absolute inset-3 border-2 border-dashed border-[#B58AFF] rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#B58AFF] bg-[#17151C]/90 px-2 py-0.5 rounded border border-[#B58AFF]/30">
                      <span>BBOX [34, 22, 128, 160]</span>
                      <span>Conf: 98.4%</span>
                    </div>

                    <div className="self-end text-[10px] font-mono text-[#FF5370] bg-[#17151C]/90 px-2 py-0.5 rounded border border-[#FF5370]/30">
                      {selectedFrame.anomalyType}
                    </div>
                  </div>
                )}

                {/* 68-Point Facial Landmarks (Simulated Mesh) */}
                {showMesh && (
                  <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
                    {/* Jawline contour dots */}
                    <div className="absolute w-2 h-2 rounded-full bg-[#B58AFF] left-6 bottom-10" />
                    <div className="absolute w-2 h-2 rounded-full bg-[#B58AFF] left-12 bottom-4" />
                    <div className="absolute w-2 h-2 rounded-full bg-[#FF5370] bottom-2 animate-pulse shadow-[0_0_8px_#FF5370]" />
                    <div className="absolute w-2 h-2 rounded-full bg-[#B58AFF] right-12 bottom-4" />
                    <div className="absolute w-2 h-2 rounded-full bg-[#B58AFF] right-6 bottom-10" />

                    {/* Eye regions */}
                    <div className="absolute w-3 h-2 rounded-full bg-[#D6B8E8] top-16 left-12 shadow-[0_0_6px_#D6B8E8]" />
                    <div className="absolute w-3 h-2 rounded-full bg-[#D6B8E8] top-16 right-12 shadow-[0_0_6px_#D6B8E8]" />

                    {/* Nose bridge */}
                    <div className="absolute w-1.5 h-6 rounded-full bg-[#B58AFF] top-22" />

                    {/* Mouth & Viseme points */}
                    <div className="absolute w-10 h-3 rounded-full bg-[#FF5370]/80 bottom-14 border border-[#FF5370] shadow-[0_0_10px_#FF5370]" />
                  </div>
                )}
              </div>

              {/* Viewport Corner HUD */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#17151C]/90 border border-[#363042] text-[11px] font-mono text-[#2ED573]">
                  FFT: {selectedFrame.fftArtifactsDetected ? 'SPIKE DETECTED' : 'NORMAL'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#17151C]/90 border border-[#363042] text-[11px] font-mono text-[#D6B8E8]">
                  Landmarks: {selectedFrame.facialLandmarksCount} pts
                </span>
              </div>
            </div>

            {/* Stepper Controls: Previous / Next Frame */}
            <div className="flex items-center justify-between pt-4 mt-2">
              <Button
                variant="outline"
                size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={handlePrev}
                disabled={currentIndex <= 0}
              >
                Previous Frame
              </Button>

              <span className="text-xs font-mono text-[#A39AAA]">
                Frame {currentIndex + 1} of {displayedFrames.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={handleNext}
                disabled={currentIndex >= displayedFrames.length - 1}
              >
                Next Frame
              </Button>
            </div>
          </Card>

          {/* Frame Gallery / Carousel Thumbnails */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#A39AAA]">
              <span className="font-semibold uppercase tracking-wider">Frame Evidence Gallery ({displayedFrames.length})</span>
              <span>Click any frame to inspect</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {displayedFrames.map((frame) => {
                const isSelected = frame.id === selectedFrame.id;
                return (
                  <div
                    key={frame.id}
                    onClick={() => setSelectedEvidenceFrameId(frame.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#2A1B38] border-[#B58AFF] shadow-[0_0_15px_rgba(181,138,255,0.3)]'
                        : 'bg-[#24212B] border-[#363042] hover:bg-[#2C2836]'
                    }`}
                  >
                    {frame.isSuspicious && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5370] animate-ping" />
                    )}
                    <div className="text-[10px] font-mono text-[#A39AAA]">#{frame.frameNumber}</div>
                    <div className={`text-xs font-bold font-mono mt-0.5 ${
                      frame.deepfakeProbability > 60 ? 'text-[#FF5370]' : frame.deepfakeProbability < 40 ? 'text-[#2ED573]' : 'text-[#FFA502]'
                    }`}>
                      {frame.deepfakeProbability}%
                    </div>
                    <div className="text-[9px] text-[#D6B8E8] truncate mt-1">
                      {frame.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (5 cols): Forensic Metric Telemetry Panel */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="space-y-4">
            <CardHeader
              title={selectedFrame.anomalyType}
              subtitle={`Detected at timestamp ${selectedFrame.timestamp}`}
              icon={<AlertTriangle className="w-5 h-5 text-[#FF5370]" />}
              action={<VerdictBadge verdict={selectedFrame.verdict} size="sm" />}
            />

            <div className="p-4 rounded-xl bg-[#1E1B24] border border-[#363042] text-xs text-[#F5F0FA] leading-relaxed">
              {selectedFrame.description}
            </div>

            {/* Forensic Attribute Readings */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#17151C] border border-[#363042]">
                <span className="text-[#A39AAA]">Deepfake Anomaly Score</span>
                <span className={`font-mono font-bold ${
                  selectedFrame.deepfakeProbability > 60 ? 'text-[#FF5370]' : selectedFrame.deepfakeProbability < 40 ? 'text-[#2ED573]' : 'text-[#FFA502]'
                }`}>
                  {selectedFrame.deepfakeProbability}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#17151C] border border-[#363042]">
                <span className="text-[#A39AAA]">Heatmap Intensity</span>
                <span className="font-mono text-[#D6B8E8] font-bold">
                  {selectedFrame.heatMapIntensity}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#17151C] border border-[#363042]">
                <span className="text-[#A39AAA]">Fourier 2D Frequency Spikes</span>
                <span className={`font-mono font-bold ${
                  selectedFrame.fftArtifactsDetected ? 'text-[#FF5370]' : 'text-[#2ED573]'
                }`}>
                  {selectedFrame.fftArtifactsDetected ? 'Detected (p < 0.001)' : 'Not Present'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#17151C] border border-[#363042]">
                <span className="text-[#A39AAA]">Facial Mesh Landmarks</span>
                <span className="font-mono text-[#F5F0FA] font-bold">
                  {selectedFrame.facialLandmarksCount} points tracked
                </span>
              </div>
            </div>

            {/* Neural Classifier Attribution */}
            <div className="p-4 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/30 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#D6B8E8] font-bold">
                <Sparkles className="w-4 h-4 text-[#B58AFF]" />
                Neural Model Attribution
              </div>
              <p className="text-[#A39AAA] leading-relaxed">
                Primary model trigger: <strong className="text-[#F5F0FA]">EfficientNet-B4 Dual-Attention Net</strong> registered 
                gradient discontinuity along pixel coordinates (X: {selectedFrame.boundingBox.left}, Y: {selectedFrame.boundingBox.top}).
              </p>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};
