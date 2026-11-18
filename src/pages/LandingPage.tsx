import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Zap, 
  FileCheck2, 
  Activity, 
  Layers, 
  Eye, 
  Mic, 
  Radio, 
  Lock, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  BarChart3,
  ScanLine,
  HelpCircle
} from 'lucide-react';
import { useDetection } from '../context/DetectionContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge, VerdictBadge, DemoDataBadge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { startAnalysis, setSampleCase } = useDetection();
  const [activeTab, setActiveTab] = useState<'manipulated' | 'authentic' | 'inconclusive'>('manipulated');

  const handleQuickScan = (type: 'manipulated' | 'authentic' | 'inconclusive') => {
    startAnalysis(type);
    navigate('/progress');
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Background Plum & Charcoal Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-radial-plum pointer-events-none -z-10" />
      <div className="absolute top-36 right-[-10%] w-[500px] h-[500px] bg-[#3D2452]/20 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-96 left-[-10%] w-[450px] h-[450px] bg-[#2A1B38]/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ========================================================
          HERO SECTION
         ======================================================== */}
      <section className="pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Capstone Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#24212B] border border-[#363042] text-xs font-semibold text-[#D6B8E8] shadow-[0_2px_12px_rgba(42,27,56,0.4)]">
              <span className="w-2 h-2 rounded-full bg-[#B58AFF] animate-ping" />
              <span className="text-[#B58AFF] font-bold">B.Tech Capstone 2026</span>
              <span className="text-[#A39AAA]">•</span>
              <span>AI Media Forensics</span>
              <DemoDataBadge />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F0FA] tracking-tight leading-[1.12]">
              Next-Generation Multi-Stream <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B58AFF] via-[#D6B8E8] to-[#F5F0FA]">
                Deepfake Detection & Verification
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#A39AAA] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Exposing synthetic media manipulation through multi-stream spatial-temporal neural networks, 
              azimuthal Fourier frequency analysis, and multimodal audio-visual synchronization forensics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                onClick={() => navigate('/upload')}
              >
                Get Started
              </Button>

              <Button
                variant="secondary"
                size="lg"
                icon={<Activity className="w-4 h-4" />}
                onClick={() => navigate('/dashboard')}
              >
                Explore Dashboard
              </Button>

              <Button
                variant="outline"
                size="lg"
                icon={<Play className="w-4 h-4 text-[#B58AFF]" />}
                onClick={() => navigate('/evidence')}
              >
                Inspect Evidence
              </Button>
            </div>

            {/* Trust and Engineering Indicators */}
            <div className="pt-6 border-t border-[#363042]/70 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="text-2xl font-bold font-mono text-[#F5F0FA]">97.4%</div>
                <div className="text-xs text-[#A39AAA] font-medium">Ensemble Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#B58AFF]">5 SOTA</div>
                <div className="text-xs text-[#A39AAA] font-medium">Neural Models</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#D6B8E8]">30 FPS</div>
                <div className="text-xs text-[#A39AAA] font-medium">Frame-by-Frame</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Diagnostic Terminal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-[#B58AFF]/30 to-[#3D2452]/20 blur-xl opacity-75" />

              <div className="relative bg-[#24212B] border border-[#363042] rounded-3xl p-5 shadow-2xl overflow-hidden">
                
                {/* Header of Video Preview Card */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#363042]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5370]/80" />
                    <span className="w-3 h-3 rounded-full bg-[#FFA502]/80" />
                    <span className="w-3 h-3 rounded-full bg-[#2ED573]/80" />
                    <span className="ml-2 text-xs font-mono text-[#A39AAA]">AEGIS-CORE://stream-01</span>
                  </div>
                  <Badge variant="plum" size="sm">LIVE INFERENCE</Badge>
                </div>

                {/* Simulated Video Frame with Bounding Box & Landmarks */}
                <div className="relative rounded-2xl bg-[#17151C] border border-[#363042] aspect-video overflow-hidden flex items-center justify-center group">
                  
                  {/* Subtle Grid overlay */}
                  <div className="absolute inset-0 bg-ai-grid opacity-50" />
                  
                  {/* Scanning Laser Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#B58AFF] to-transparent animate-scan z-20 shadow-[0_0_8px_#B58AFF]" />

                  {/* Face Silhouette Graphic */}
                  <div className="relative z-10 w-32 h-40 border-2 border-dashed border-[#B58AFF]/60 rounded-full flex flex-col items-center justify-center p-3 bg-[#24212B]/40 backdrop-blur-xs">
                    {/* Bounding Box Info */}
                    <div className="absolute -top-3 left-2 px-2 py-0.5 rounded bg-[#FF5370] text-[#17151C] text-[10px] font-mono font-bold tracking-wider">
                      ANOMALY: 88.6%
                    </div>

                    {/* Facial Landmarks (Simulated Dots) */}
                    <div className="w-full h-full relative flex items-center justify-center">
                      <div className="w-2.5 h-1.5 rounded-full bg-[#B58AFF] absolute top-8 left-6 shadow-[0_0_6px_#B58AFF]" />
                      <div className="w-2.5 h-1.5 rounded-full bg-[#B58AFF] absolute top-8 right-6 shadow-[0_0_6px_#B58AFF]" />
                      <div className="w-1.5 h-4 rounded-full bg-[#D6B8E8] absolute top-14" />
                      <div className="w-7 h-2 rounded-full bg-[#FF5370] absolute bottom-8 shadow-[0_0_6px_#FF5370]" />
                      
                      {/* Tracking Crosshairs */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        <div className="w-full h-px bg-[#B58AFF]/50" />
                        <div className="h-full w-px bg-[#B58AFF]/50 absolute" />
                      </div>
                    </div>

                    <div className="absolute -bottom-3 right-2 px-2 py-0.5 rounded bg-[#2A1B38] border border-[#B58AFF]/40 text-[#D6B8E8] text-[9px] font-mono">
                      FaceForensics++
                    </div>
                  </div>

                  {/* Overlay telemetry badges */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-[#17151C]/80 border border-[#363042] text-[10px] font-mono text-[#2ED573] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ED573]" /> 1080p @ 30fps
                    </span>
                    <span className="px-2 py-1 rounded bg-[#17151C]/80 border border-[#363042] text-[10px] font-mono text-[#D6B8E8]">
                      Frame #274
                    </span>
                  </div>
                </div>

                {/* Real-time Evaluation Readout */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A39AAA] font-medium">Model Verdict</span>
                    <VerdictBadge verdict="MANIPULATED" size="sm" />
                  </div>

                  {/* Probability Bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1 font-mono">
                      <span className="text-[#A39AAA]">Deepfake Confidence</span>
                      <span className="text-[#FF5370] font-bold">88.6%</span>
                    </div>
                    <div className="w-full bg-[#17151C] h-2 rounded-full overflow-hidden border border-[#363042]">
                      <div className="bg-[#FF5370] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#FF5370]" style={{ width: '88.6%' }} />
                    </div>
                  </div>

                  {/* Forensic Anomaly Quick Tags */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-[#1E1B24] border border-[#363042] text-[11px]">
                      <div className="text-[#A39AAA] font-medium">FFT Checkerboard</div>
                      <div className="text-[#FF5370] font-mono font-bold mt-0.5">Spike Detected</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1E1B24] border border-[#363042] text-[11px]">
                      <div className="text-[#A39AAA] font-medium">Lip-Sync Desync</div>
                      <div className="text-[#FFA502] font-mono font-bold mt-0.5">+210ms Offset</div>
                    </div>
                  </div>

                  {/* Interactive Trigger Button */}
                  <button
                    onClick={() => handleQuickScan('manipulated')}
                    className="w-full py-2.5 rounded-xl bg-[#2A1B38] hover:bg-[#3D2452] border border-[#B58AFF]/40 text-xs font-semibold text-[#D6B8E8] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Run Simulated Diagnostic Pipeline</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B58AFF]" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          PROJECT INTRODUCTION & HOW IT WORKS
         ======================================================== */}
      <section className="py-20 border-t border-[#363042]/70 bg-[#1D1A24]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="plum">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F0FA] tracking-tight">
              Four-Phase Forensic Pipeline
            </h2>
            <p className="text-sm sm:text-base text-[#A39AAA]">
              Our system analyzes digital media across spatial boundaries, temporal frame flow, 
              frequency domain transforms, and acoustic synchronization to expose manipulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <Card hoverEffect className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/30 flex items-center justify-center text-[#B58AFF] font-mono font-extrabold">
                01
              </div>
              <h3 className="text-base font-bold text-[#F5F0FA]">Video Ingestion & Hashing</h3>
              <p className="text-xs text-[#A39AAA] leading-relaxed">
                Extracts video container metadata, calculates cryptographic SHA-256 media fingerprint, and decouples raw keyframes at 30 FPS.
              </p>
            </Card>

            {/* Step 2 */}
            <Card hoverEffect className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/30 flex items-center justify-center text-[#B58AFF] font-mono font-extrabold">
                02
              </div>
              <h3 className="text-base font-bold text-[#F5F0FA]">Facial Mesh Extraction</h3>
              <p className="text-xs text-[#A39AAA] leading-relaxed">
                Applies RetinaFace detector to identify face subjects and aligns 68 3D facial landmarks to normalize head pitch, roll, and yaw.
              </p>
            </Card>

            {/* Step 3 */}
            <Card hoverEffect className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/30 flex items-center justify-center text-[#B58AFF] font-mono font-extrabold">
                03
              </div>
              <h3 className="text-base font-bold text-[#B58AFF]">Ensemble Model Scoring</h3>
              <p className="text-xs text-[#A39AAA] leading-relaxed">
                Evaluates facial crops across 5 specialized deep learning models targeting spatial blending seams, FFT noise, and audio desync.
              </p>
            </Card>

            {/* Step 4 */}
            <Card hoverEffect className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/30 flex items-center justify-center text-[#B58AFF] font-mono font-extrabold">
                04
              </div>
              <h3 className="text-base font-bold text-[#F5F0FA]">Forensic Audit Report</h3>
              <p className="text-xs text-[#A39AAA] leading-relaxed">
                Synthesizes a court-ready cryptographic verification certificate complete with timestamped frame evidence and downloadable PDF.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================
          MULTI-STREAM ARCHITECTURE SECTION
         ======================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="plum">Deep Learning Capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F0FA] tracking-tight">
            Specialized Neural Forensic Models
          </h2>
          <p className="text-sm sm:text-base text-[#A39AAA]">
            Trained on FaceForensics++, Celeb-DF, and DFDC to combat autoencoder face-swaps, GANs, and audio cloning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Model 1 */}
          <Card hoverEffect glow="primary" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1B38] border border-[#B58AFF]/40 flex items-center justify-center text-[#B58AFF]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F0FA]">Spatial Dual-Attention Net</h3>
            <p className="text-xs text-[#A39AAA] leading-relaxed">
              Utilizes modified EfficientNet-B4 and XceptionNet backbones with custom spatial attention modules to detect microscopic warping, boundary blending seams, and unnatural skin pore density.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[#D6B8E8]">
              <span>Trained on Celeb-DF & FF++</span>
            </div>
          </Card>

          {/* Model 2 */}
          <Card hoverEffect glow="primary" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1B38] border border-[#B58AFF]/40 flex items-center justify-center text-[#B58AFF]">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F0FA]">2D Fourier (FFT) Frequency Analysis</h3>
            <p className="text-xs text-[#A39AAA] leading-relaxed">
              Computes Discrete Cosine Transform (DCT) and azimuthal spectral distributions. Autoencoders and GAN upsamplers leave distinct checkerboard frequency spikes invisible to human eyes.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[#D6B8E8]">
              <span>Spectral Anomaly Detector</span>
            </div>
          </Card>

          {/* Model 3 */}
          <Card hoverEffect glow="primary" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1B38] border border-[#B58AFF]/40 flex items-center justify-center text-[#B58AFF]">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F0FA]">Multimodal Audio-Visual Sync</h3>
            <p className="text-xs text-[#A39AAA] leading-relaxed">
              Correlates spoken phonemes with lip viseme geometries using a modified Wav2Lip discriminator. Detects voice clones and dubbed audio out-of-sync by as little as 45 milliseconds.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[#D6B8E8]">
              <span>Phoneme-Viseme Alignment</span>
            </div>
          </Card>

          {/* Model 4 */}
          <Card hoverEffect glow="primary" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1B38] border border-[#B58AFF]/40 flex items-center justify-center text-[#B58AFF]">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F0FA]">Bi-LSTM Blink & Gaze Dynamics</h3>
            <p className="text-xs text-[#A39AAA] leading-relaxed">
              Tracks temporal eye-blinking cycles and ocular micro-saccades across frame sequences. Deepfake generators consistently fail to model spontaneous physiological blink intervals.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[#D6B8E8]">
              <span>Temporal Recurrent Model</span>
            </div>
          </Card>

          {/* Model 5 */}
          <Card hoverEffect glow="primary" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1B38] border border-[#B58AFF]/40 flex items-center justify-center text-[#B58AFF]">
              <ScanLine className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F0FA]">MesoInception-4 Forensic Net</h3>
            <p className="text-xs text-[#A39AAA] leading-relaxed">
              Mesoscopic analysis targeting intermediate representation scales. Isolates subtle compression noise and artifacts introduced during image blending and face swapping.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[#D6B8E8]">
              <span>Mesoscopic Filtering</span>
            </div>
          </Card>

          {/* Model 6 */}
          <Card hoverEffect glow="primary" className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1B38] border border-[#B58AFF]/40 flex items-center justify-center text-[#B58AFF]">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F0FA]">Cryptographic Forensic Audit</h3>
            <p className="text-xs text-[#A39AAA] leading-relaxed">
              Generates court-admissible forensic verification certificates with SHA-256 media hashing, frame-by-frame anomaly timestamps, and tamper-resistant cryptographic signatures.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-[#D6B8E8]">
              <span>SHA-256 PDF Verification</span>
            </div>
          </Card>
        </div>
      </section>

      {/* ========================================================
          SIDE-BY-SIDE ARTIFACT DISSECTION
         ======================================================== */}
      <section className="py-20 border-t border-[#363042]/70 bg-[#1D1A24]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Badge variant="plum">Forensic Inspection Lab</Badge>
              <h2 className="text-3xl font-extrabold text-[#F5F0FA] tracking-tight mt-2">
                Side-by-Side Artifact Dissection
              </h2>
              <p className="text-sm text-[#A39AAA] mt-1 max-w-xl">
                Compare ground-truth forensic signatures across authentic, manipulated, and compressed video clips.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-2 bg-[#1E1B24] p-1.5 rounded-2xl border border-[#363042] self-start md:self-auto">
              <button
                onClick={() => setActiveTab('manipulated')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'manipulated'
                    ? 'bg-[#FF5370]/20 text-[#FF5370] border border-[#FF5370]/40'
                    : 'text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Manipulated (88.6%)</span>
              </button>
              <button
                onClick={() => setActiveTab('authentic')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'authentic'
                    ? 'bg-[#2ED573]/20 text-[#2ED573] border border-[#2ED573]/40'
                    : 'text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authentic (4.8%)</span>
              </button>
              <button
                onClick={() => setActiveTab('inconclusive')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'inconclusive'
                    ? 'bg-[#FFA502]/20 text-[#FFA502] border border-[#FFA502]/40'
                    : 'text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Inconclusive (52.4%)</span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#24212B] border border-[#363042] rounded-3xl p-6 sm:p-8">
            
            {/* Left: Frame Diagnostic Visualizer */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-video rounded-2xl bg-[#17151C] border border-[#363042] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-ai-grid opacity-40" />

                {/* Simulated Face Visualizer with bounding boxes */}
                <div className="relative z-10 w-44 h-44 rounded-full border-2 border-[#B58AFF]/50 flex flex-col items-center justify-center bg-[#2A1B38]/30">
                  <div className={`text-xs font-mono font-bold px-3 py-1 rounded-full mb-2 ${
                    activeTab === 'manipulated'
                      ? 'bg-[#FF5370] text-[#17151C]' 
                      : activeTab === 'authentic'
                      ? 'bg-[#2ED573] text-[#17151C]'
                      : 'bg-[#FFA502] text-[#17151C]'
                  }`}>
                    {activeTab === 'manipulated' 
                      ? 'FLAGGED: SEAM AT JAWLINE' 
                      : activeTab === 'authentic'
                      ? 'HOMOGENEOUS PRNU NOISE'
                      : 'COMPRESSION MACROBLOCKS'}
                  </div>
                  <div className="w-24 h-10 border border-dashed border-[#B58AFF]/60 rounded-lg flex items-center justify-center text-[10px] text-[#A39AAA] font-mono text-center">
                    {activeTab === 'manipulated' 
                      ? 'FFT Spike #2' 
                      : activeTab === 'authentic'
                      ? 'Natural Texture'
                      : 'H.264 Quantization'}
                  </div>
                </div>

                {/* Status Banner */}
                <div className="absolute top-4 left-4 z-20">
                  <VerdictBadge verdict={activeTab === 'manipulated' ? 'MANIPULATED' : activeTab === 'authentic' ? 'AUTHENTIC' : 'INCONCLUSIVE'} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#A39AAA] font-mono px-1">
                <span>
                  Target: {activeTab === 'manipulated' ? 'investor_keynote_ceo_deepfake_sample.mp4' : activeTab === 'authentic' ? 'academic_press_conference_raw_source.mp4' : 'court_evidence_cctv_deposition_compressed.mp4'}
                </span>
                <span>Demo Benchmark</span>
              </div>
            </div>

            {/* Right: Technical Evidence Table */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xl font-bold text-[#F5F0FA]">
                {activeTab === 'manipulated' ? 'Forensic Anomaly Report' : activeTab === 'authentic' ? 'Verification Baseline Report' : 'Inconclusive Audit Report'}
              </h3>
              
              <p className="text-xs text-[#A39AAA] leading-relaxed">
                {activeTab === 'manipulated' 
                  ? 'High-confidence synthetic facial synthesis detected. Multi-stream classification registered acute anomalies across Fourier frequency domain, eye-blink dynamics, and audio-visual synchronization.'
                  : activeTab === 'authentic'
                  ? 'No synthetic manipulation artifacts found. Biometric micro-expressions, Photo-Response Non-Uniformity (PRNU) sensor fingerprints, and temporal acoustic alignments conform to natural authentic distributions.'
                  : 'Low bitrate H.264 compression introduced quantization blur that obscures boundary seams. Further forensic analysis requires uncompressed source footage.'}
              </p>

              {/* Forensic Attribute List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1B24] border border-[#363042]">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${
                      activeTab === 'manipulated' ? 'bg-[#FF5370]' : activeTab === 'authentic' ? 'bg-[#2ED573]' : 'bg-[#FFA502]'
                    }`} />
                    <span className="text-xs font-semibold text-[#F5F0FA]">Spatial Boundary Blending</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A39AAA]">
                    {activeTab === 'manipulated' ? 'Bilinear seam detected (p=0.94)' : activeTab === 'authentic' ? 'Seamless skin gradient' : 'Degraded by compression'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1B24] border border-[#363042]">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${
                      activeTab === 'manipulated' ? 'bg-[#FF5370]' : activeTab === 'authentic' ? 'bg-[#2ED573]' : 'bg-[#FFA502]'
                    }`} />
                    <span className="text-xs font-semibold text-[#F5F0FA]">Fourier 2D Frequency (DCT)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A39AAA]">
                    {activeTab === 'manipulated' ? 'Checkerboard spectral spike' : activeTab === 'authentic' ? 'Standard 1/f noise curve' : 'DCT blockiness artifact'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1B24] border border-[#363042]">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${
                      activeTab === 'manipulated' ? 'bg-[#FF5370]' : activeTab === 'authentic' ? 'bg-[#2ED573]' : 'bg-[#FFA502]'
                    }`} />
                    <span className="text-xs font-semibold text-[#F5F0FA]">Audio-Visual Lip Sync</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A39AAA]">
                    {activeTab === 'manipulated' ? '210ms phase desynchronization' : activeTab === 'authentic' ? 'Synchronized (±15ms tolerance)' : 'Marginal delay (65ms)'}
                  </span>
                </div>
              </div>

              {/* Quick Action */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setSampleCase(activeTab);
                    navigate('/results');
                  }}
                >
                  Inspect Full {activeTab.toUpperCase()} Dossier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          BOTTOM CALL TO ACTION
         ======================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#24212B] border border-[#363042] p-8 sm:p-12 lg:p-16 overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#522F6E]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2A1B38]/40 rounded-full blur-3xl pointer-events-none" />

          <Badge variant="plum" size="lg">Ready for Evaluation</Badge>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F0FA] tracking-tight max-w-2xl mx-auto">
            Experience the Complete Deepfake Verification System
          </h2>

          <p className="text-sm sm:text-base text-[#A39AAA] max-w-xl mx-auto">
            Test pre-loaded manipulated and authentic media samples, inspect frame-by-frame anomalies, 
            or upload your own video for verification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => navigate('/upload')}
            >
              Start Video Scan
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<BarChart3 className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
            >
              Explore Dashboard
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};
