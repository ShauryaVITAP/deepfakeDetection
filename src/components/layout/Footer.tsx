import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Database, BookOpen, GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#363042] bg-[#17151C] text-[#A39AAA] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Project Identity */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2A1B38] border border-[#B58AFF]/40 flex items-center justify-center text-[#B58AFF]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-[#F5F0FA]">AegisVision AI</span>
            </div>
            <p className="text-xs text-[#A39AAA] leading-relaxed">
              Final-Year B.Tech Capstone Project in Artificial Intelligence & Digital Media Forensics.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#24212B] border border-[#363042] text-[11px] text-[#D6B8E8]">
              <GitBranch className="w-3.5 h-3.5 text-[#B58AFF]" />
              <span>Capstone Thesis Edition 2026</span>
            </div>
          </div>

          {/* Col 2: Architecture & Deep Learning Models */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#F5F0FA] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#B58AFF]" />
              Forensic Ensembles
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-[#D6B8E8] transition-colors">EfficientNet-B4 Spatial Blending Net</li>
              <li className="hover:text-[#D6B8E8] transition-colors">MesoInception-4 Micro-Forensics</li>
              <li className="hover:text-[#D6B8E8] transition-colors">XceptionNet FaceForensics++</li>
              <li className="hover:text-[#D6B8E8] transition-colors">Wav2Lip Audio-Visual Sync</li>
              <li className="hover:text-[#D6B8E8] transition-colors">ResNet50 + Bi-LSTM Temporal Blink</li>
            </ul>
          </div>

          {/* Col 3: Benchmark Datasets & Citations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#F5F0FA] uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#B58AFF]" />
              Benchmarks & Research
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>FaceForensics++ (TUM / Google)</li>
              <li>Celeb-DF v2 Benchmark</li>
              <li>Deepfake Detection Challenge (DFDC)</li>
              <li>Fourier FFT Azimuthal Spectral Drift</li>
              <li>PRNU Camera Sensor Fingerprint</li>
            </ul>
          </div>

          {/* Col 4: System Modules Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#F5F0FA] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#B58AFF]" />
              System Modules
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link to="/dashboard" className="text-left hover:text-[#B58AFF] transition-colors">Dashboard</Link>
              <Link to="/upload" className="text-left hover:text-[#B58AFF] transition-colors">Upload Video</Link>
              <Link to="/results" className="text-left hover:text-[#B58AFF] transition-colors">Detection Results</Link>
              <Link to="/evidence" className="text-left hover:text-[#B58AFF] transition-colors">Frame Forensics</Link>
              <Link to="/history" className="text-left hover:text-[#B58AFF] transition-colors">Analysis Log</Link>
              <Link to="/reports" className="text-left hover:text-[#B58AFF] transition-colors">PDF Export</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#363042]/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span>Final-Year B.Tech Capstone Presentation & Defense</span>
            <span>•</span>
            <span className="text-[#B58AFF] font-mono">React + TypeScript + Vite + Tailwind CSS + Framer Motion</span>
          </div>
          <div className="text-[#A39AAA] font-mono">
            Charcoal (#17151C) + Plum (#2A1B38) + Lavender (#B58AFF)
          </div>
        </div>
      </div>
    </footer>
  );
};
