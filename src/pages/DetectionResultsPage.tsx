import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Film, 
  Cpu, 
  UploadCloud, 
  CheckCircle2, 
  Fingerprint, 
  Share2, 
  Download,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Bot,
  Zap,
  RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useDetection } from '../context/DetectionContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, VerdictBadge, DemoDataBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const DetectionResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentAnalysis, 
    setSampleCase,
    setIsCopilotOpen,
    setIsGroqModalOpen,
    groqAuditText,
    isGeneratingGroqAudit,
    triggerGroqAudit,
    hasGroqKey
  } = useDetection();

  const isDeepfake = currentAnalysis.verdict === 'MANIPULATED';
  const isAuthentic = currentAnalysis.verdict === 'AUTHENTIC';
  const isInconclusive = currentAnalysis.verdict === 'INCONCLUSIVE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#363042]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#A39AAA]">CASE DOSSIER:</span>
            <span className="text-xs font-mono text-[#B58AFF] font-bold">{currentAnalysis.id}</span>
            <span className="text-xs text-[#A39AAA]">•</span>
            <span className="text-xs text-[#A39AAA] font-mono">{currentAnalysis.completedAt}</span>
            <DemoDataBadge isDemoData={currentAnalysis.isDemoData} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F0FA] tracking-tight">
            Forensic Detection & Verification Findings
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick toggle for examiners */}
          <div className="flex items-center gap-1 bg-[#1E1B24] p-1 rounded-xl border border-[#363042]">
            <button
              onClick={() => setSampleCase('manipulated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                isDeepfake ? 'bg-[#FF5370]/20 text-[#FF5370] border border-[#FF5370]/40 font-bold' : 'text-[#A39AAA] hover:text-[#F5F0FA]'
              }`}
            >
              Manipulated (88.6%)
            </button>
            <button
              onClick={() => setSampleCase('authentic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                isAuthentic ? 'bg-[#2ED573]/20 text-[#2ED573] border border-[#2ED573]/40 font-bold' : 'text-[#A39AAA] hover:text-[#F5F0FA]'
              }`}
            >
              Authentic (4.8%)
            </button>
            <button
              onClick={() => setSampleCase('inconclusive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                isInconclusive ? 'bg-[#FFA502]/20 text-[#FFA502] border border-[#FFA502]/40 font-bold' : 'text-[#A39AAA] hover:text-[#F5F0FA]'
              }`}
            >
              Inconclusive (52.4%)
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Film className="w-4 h-4" />}
            onClick={() => navigate('/evidence')}
          >
            Frame Evidence
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => navigate('/reports')}
          >
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Main Verdict Dossier Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden ${
        isDeepfake 
          ? 'bg-[#24212B] border-[#FF5370]/60 shadow-[0_0_40px_rgba(255,83,112,0.15)]'
          : isAuthentic
          ? 'bg-[#24212B] border-[#2ED573]/60 shadow-[0_0_40px_rgba(46,213,115,0.15)]'
          : 'bg-[#24212B] border-[#FFA502]/60 shadow-[0_0_40px_rgba(255,165,2,0.15)]'
      }`}>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isDeepfake ? 'bg-[#FF5370]/10' : isAuthentic ? 'bg-[#2ED573]/10' : 'bg-[#FFA502]/10'
        }`} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left: Big Score & Verdict */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <VerdictBadge verdict={currentAnalysis.verdict} size="lg" />
              <Badge variant="plum">{currentAnalysis.riskLevel} Risk Level</Badge>
              <DemoDataBadge isDemoData={currentAnalysis.isDemoData} />
            </div>

            <div>
              <div className="text-xs uppercase font-bold text-[#A39AAA] tracking-wider mb-1">
                Deepfake Probability Assessment
              </div>
              <div className="flex items-baseline gap-3">
                <span className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${
                  isDeepfake ? 'text-[#FF5370]' : isAuthentic ? 'text-[#2ED573]' : 'text-[#FFA502]'
                }`}>
                  {currentAnalysis.overallScore}%
                </span>
                <div className="text-xs text-[#A39AAA] font-mono leading-tight">
                  <div>Confidence: <span className="text-[#F5F0FA] font-bold">{currentAnalysis.confidence}%</span></div>
                  <div>Authenticity: <span className="text-[#D6B8E8] font-bold">{currentAnalysis.authenticityScore}%</span></div>
                </div>
              </div>
            </div>

            <ProgressBar
              value={currentAnalysis.overallScore}
              showPercentage={false}
              color={isDeepfake ? 'danger' : isAuthentic ? 'safe' : 'warning'}
              size="md"
            />

            <div className="text-xs text-[#A39AAA] font-mono flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#B58AFF]" />
              <span className="truncate">Cert ID: {currentAnalysis.certificateId}</span>
            </div>
          </div>

          {/* Right: Executive Summary & Video Metadata Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#17151C] border border-[#363042] space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#F5F0FA] uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#B58AFF]" />
                  Executive Forensic Summary
                </div>
                <span className="text-[10px] text-[#A39AAA] font-mono">Calibrated Ensemble</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A39AAA] leading-relaxed">
                {currentAnalysis.executiveSummary}
              </p>
            </div>

            {/* Ingested File Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#1E1B24] border border-[#363042]">
                <div className="text-[#A39AAA] text-[11px]">Filename</div>
                <div className="text-[#F5F0FA] font-mono font-semibold truncate mt-0.5" title={currentAnalysis.video.filename}>
                  {currentAnalysis.video.filename}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1E1B24] border border-[#363042]">
                <div className="text-[#A39AAA] text-[11px]">Resolution & FPS</div>
                <div className="text-[#F5F0FA] font-mono font-semibold mt-0.5">
                  {currentAnalysis.video.resolution}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1E1B24] border border-[#363042]">
                <div className="text-[#A39AAA] text-[11px]">Duration / Frames</div>
                <div className="text-[#F5F0FA] font-mono font-semibold mt-0.5">
                  {currentAnalysis.video.duration} ({currentAnalysis.totalFrames} frames)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1E1B24] border border-[#363042]">
                <div className="text-[#A39AAA] text-[11px]">Flagged Anomalies</div>
                <div className={`font-mono font-bold mt-0.5 ${
                  currentAnalysis.flaggedFramesCount > 50 ? 'text-[#FF5370]' : isAuthentic ? 'text-[#2ED573]' : 'text-[#FFA502]'
                }`}>
                  {currentAnalysis.flaggedFramesCount} frames
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          GROQ AI FORENSIC DEEP DIVE SECTION
         ======================================================== */}
      <Card className="border-[#B58AFF]/50 bg-gradient-to-br from-[#24212B] via-[#2A1B38]/60 to-[#1D1326] shadow-[0_0_35px_rgba(181,138,255,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#363042]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D2452] border border-[#B58AFF]/50 flex items-center justify-center text-[#B58AFF] shadow-[0_0_15px_rgba(181,138,255,0.3)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F5F0FA]">
                  Groq LPU Forensic Intelligence Synthesis
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#B58AFF]/20 text-[#B58AFF] border border-[#B58AFF]/40">
                  Llama 3.3 70B
                </span>
              </div>
              <p className="text-xs text-[#A39AAA]">
                Qualitative AI cross-correlation, chain of custody, and statutory admissibility breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Bot className="w-4 h-4 text-[#B58AFF]" />}
              onClick={() => setIsCopilotOpen(true)}
            >
              Ask AI Copilot
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              isLoading={isGeneratingGroqAudit}
              onClick={triggerGroqAudit}
            >
              {groqAuditText ? 'Regenerate AI Audit' : 'Generate AI Audit'}
            </Button>
          </div>
        </div>

        {/* Live Groq Generated Output */}
        <div className="pt-4">
          {groqAuditText ? (
            <div className="p-5 rounded-2xl bg-[#17151C] border border-[#363042] text-xs text-[#F5F0FA] space-y-3 font-sans leading-relaxed whitespace-pre-wrap animate-in fade-in">
              {groqAuditText}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#17151C]/60 border border-dashed border-[#363042] text-center space-y-2">
              <Bot className="w-8 h-8 text-[#B58AFF] mx-auto opacity-70" />
              <div className="text-xs font-semibold text-[#F5F0FA]">
                No Groq AI Audit Generated Yet
              </div>
              <p className="text-[11px] text-[#A39AAA] max-w-md mx-auto">
                Click <strong>"Generate AI Audit"</strong> to trigger Groq LPU's deep forensic reasoning engine, synthesizing model consensus, FFT frequency anomalies, and legal admissibility findings.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 6 Forensic Biomarker Metric Cards */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#F5F0FA]">Forensic Biomarker Integrity Gauges</h3>
          <p className="text-xs text-[#A39AAA]">
            Quantitative assessment across six physiological, optical, and acoustic dimensions (Higher is more authentic).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Metric 1 */}
          <Card hoverEffect className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="text-xs font-bold text-[#F5F0FA]">Spatial Coherence</div>
              <span className={`text-base font-extrabold font-mono ${
                currentAnalysis.metrics.spatialCoherence > 60 ? 'text-[#2ED573]' : 'text-[#FF5370]'
              }`}>
                {currentAnalysis.metrics.spatialCoherence}%
              </span>
            </div>
            <ProgressBar
              value={currentAnalysis.metrics.spatialCoherence}
              showPercentage={false}
              color={currentAnalysis.metrics.spatialCoherence > 60 ? 'safe' : 'danger'}
              size="sm"
            />
            <p className="text-[11px] text-[#A39AAA]">
              Skin texture gradient continuity across facial boundary perimeter.
            </p>
          </Card>

          {/* Metric 2 */}
          <Card hoverEffect className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="text-xs font-bold text-[#F5F0FA]">Temporal Consistency</div>
              <span className={`text-base font-extrabold font-mono ${
                currentAnalysis.metrics.temporalConsistency > 60 ? 'text-[#2ED573]' : 'text-[#FF5370]'
              }`}>
                {currentAnalysis.metrics.temporalConsistency}%
              </span>
            </div>
            <ProgressBar
              value={currentAnalysis.metrics.temporalConsistency}
              showPercentage={false}
              color={currentAnalysis.metrics.temporalConsistency > 60 ? 'safe' : 'danger'}
              size="sm"
            />
            <p className="text-[11px] text-[#A39AAA]">
              Smooth frame-to-frame pixel flow without generative flicker or jitter.
            </p>
          </Card>

          {/* Metric 3 */}
          <Card hoverEffect className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="text-xs font-bold text-[#F5F0FA]">Audio-Visual Sync</div>
              <span className={`text-base font-extrabold font-mono ${
                currentAnalysis.metrics.audioVisualSync > 60 ? 'text-[#2ED573]' : 'text-[#FF5370]'
              }`}>
                {currentAnalysis.metrics.audioVisualSync}%
              </span>
            </div>
            <ProgressBar
              value={currentAnalysis.metrics.audioVisualSync}
              showPercentage={false}
              color={currentAnalysis.metrics.audioVisualSync > 60 ? 'safe' : 'danger'}
              size="sm"
            />
            <p className="text-[11px] text-[#A39AAA]">
              Acoustic phonemes correlation with visual lip viseme motion curves.
            </p>
          </Card>

          {/* Metric 4 */}
          <Card hoverEffect className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="text-xs font-bold text-[#F5F0FA]">Frequency Normalcy (FFT)</div>
              <span className={`text-base font-extrabold font-mono ${
                (100 - currentAnalysis.metrics.frequencyDomainAnomaly) > 60 ? 'text-[#2ED573]' : 'text-[#FF5370]'
              }`}>
                {100 - currentAnalysis.metrics.frequencyDomainAnomaly}%
              </span>
            </div>
            <ProgressBar
              value={100 - currentAnalysis.metrics.frequencyDomainAnomaly}
              showPercentage={false}
              color={(100 - currentAnalysis.metrics.frequencyDomainAnomaly) > 60 ? 'safe' : 'danger'}
              size="sm"
            />
            <p className="text-[11px] text-[#A39AAA]">
              Absence of 2D Fourier checkerboard upsampling spikes and DCT drift.
            </p>
          </Card>

          {/* Metric 5 */}
          <Card hoverEffect className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="text-xs font-bold text-[#F5F0FA]">Eye Blink Dynamics</div>
              <span className={`text-base font-extrabold font-mono ${
                currentAnalysis.metrics.eyeBlinkDynamics > 60 ? 'text-[#2ED573]' : 'text-[#FF5370]'
              }`}>
                {currentAnalysis.metrics.eyeBlinkDynamics}%
              </span>
            </div>
            <ProgressBar
              value={currentAnalysis.metrics.eyeBlinkDynamics}
              showPercentage={false}
              color={currentAnalysis.metrics.eyeBlinkDynamics > 60 ? 'safe' : 'danger'}
              size="sm"
            />
            <p className="text-[11px] text-[#A39AAA]">
              Natural physiological blinking cadence and ocular micro-saccades.
            </p>
          </Card>

          {/* Metric 6 */}
          <Card hoverEffect className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="text-xs font-bold text-[#F5F0FA]">Lighting Uniformity</div>
              <span className={`text-base font-extrabold font-mono ${
                currentAnalysis.metrics.lightingConsistency > 60 ? 'text-[#2ED573]' : 'text-[#FF5370]'
              }`}>
                {currentAnalysis.metrics.lightingConsistency}%
              </span>
            </div>
            <ProgressBar
              value={currentAnalysis.metrics.lightingConsistency}
              showPercentage={false}
              color={currentAnalysis.metrics.lightingConsistency > 60 ? 'safe' : 'danger'}
              size="sm"
            />
            <p className="text-[11px] text-[#A39AAA]">
              Consistent 3D shadow casting between facial features and ambient scene.
            </p>
          </Card>

        </div>
      </div>

      {/* Model Ensemble Decision Breakdown */}
      <Card>
        <CardHeader
          title="Multi-Model Forensic Consensus"
          subtitle="Weights, confidence intervals, and individual model verdicts"
          icon={<Cpu className="w-5 h-5 text-[#B58AFF]" />}
          action={
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => navigate('/evidence')}
            >
              Examine Frame Evidence
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {currentAnalysis.models.map((model) => (
            <div
              key={model.id}
              className="p-4 rounded-2xl bg-[#1E1B24] border border-[#363042] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#F5F0FA]">{model.name}</h4>
                  <div className="text-[10px] font-mono text-[#D6B8E8]">{model.architecture}</div>
                </div>
                <VerdictBadge verdict={model.status} size="sm" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#A39AAA]">Manipulation Prob</span>
                  <span className={`font-bold ${
                    model.deepfakeProbability > 60 
                      ? 'text-[#FF5370]' 
                      : model.deepfakeProbability < 40 
                      ? 'text-[#2ED573]' 
                      : 'text-[#FFA502]'
                  }`}>
                    {model.deepfakeProbability}%
                  </span>
                </div>
                <ProgressBar
                  value={model.deepfakeProbability}
                  showPercentage={false}
                  color={model.deepfakeProbability > 60 ? 'danger' : model.deepfakeProbability < 40 ? 'safe' : 'warning'}
                  size="sm"
                />
              </div>

              <div className="text-[11px] text-[#A39AAA] leading-snug">
                {model.focusArea}
              </div>

              <div className="pt-2 border-t border-[#363042]/50 flex items-center justify-between text-[10px] text-[#A39AAA] font-mono">
                <span>Weight: {model.weight}%</span>
                <span>Latency: {model.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Model Telemetry & Verified Inference Pipeline */}
      {currentAnalysis.debugInfo && (
        <Card className="border-[#3D2B56] bg-[#181520]">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-[#2ED573]" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F0FA]">
              Model Telemetry & Verified Inference Pipeline
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2ED573]/20 text-[#2ED573] border border-[#2ED573]/40">
              Live PyTorch
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#121017] border border-[#2B2636]">
              <div className="text-[10px] text-[#A39AAA]">MODEL ARCHITECTURE</div>
              <div className="text-[#F5F0FA] font-semibold truncate mt-0.5" title={currentAnalysis.debugInfo.model_name}>
                {currentAnalysis.debugInfo.model_name}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#121017] border border-[#2B2636]">
              <div className="text-[10px] text-[#A39AAA]">PREDICTED CLASS</div>
              <div className={`font-bold mt-0.5 ${currentAnalysis.debugInfo.predicted_class === 'AUTHENTIC' ? 'text-[#2ED573]' : 'text-[#FF5370]'}`}>
                {currentAnalysis.debugInfo.predicted_class}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#121017] border border-[#2B2636]">
              <div className="text-[10px] text-[#A39AAA]">CLASS PROBABILITIES</div>
              <div className="text-[#F5F0FA] mt-0.5">
                Real: {(currentAnalysis.debugInfo.real_probability * 100).toFixed(1)}% | Fake: {(currentAnalysis.debugInfo.deepfake_probability * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#121017] border border-[#2B2636]">
              <div className="text-[10px] text-[#A39AAA]">INPUT TENSOR & PREPROCESSING</div>
              <div className="text-[#B58AFF] mt-0.5 truncate" title="RGB 224x224, ImageNet Normalization, Tensor [1, 3, 224, 224]">
                RGB 224x224 [1, 3, 224, 224]
              </div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};
