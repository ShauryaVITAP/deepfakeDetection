import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  UploadCloud, 
  Activity, 
  Film, 
  Clock, 
  FileText, 
  Home, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useDetection } from '../../context/DetectionContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { currentAnalysis, setSampleCase } = useDetection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { to: '/upload', label: 'Upload Video', icon: <UploadCloud className="w-4 h-4" /> },
    { to: '/results', label: 'Forensic Results', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/evidence', label: 'Frame Evidence', icon: <Film className="w-4 h-4" /> },
    { to: '/history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { to: '/reports', label: 'PDF Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#17151C]/95 backdrop-blur-md border-b border-[#363042]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group select-none cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/50 flex items-center justify-center text-[#B58AFF] shadow-[0_0_20px_rgba(181,138,255,0.25)] group-hover:shadow-[0_0_25px_rgba(181,138,255,0.45)] group-hover:border-[#C7A3FF] transition-all duration-300">
                <ShieldCheck className="w-6 h-6 text-[#B58AFF]" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#B58AFF] rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#B58AFF] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-[#F5F0FA]">
                  AEGIS<span className="text-[#B58AFF]">VISION</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#3D2452]/60 text-[#D6B8E8] border border-[#B58AFF]/30">
                  v3.2 AI
                </span>
              </div>
              <p className="text-[11px] text-[#A39AAA] font-medium tracking-wide">
                B.Tech Capstone Media Forensics
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#1E1B24] p-1.5 rounded-2xl border border-[#363042]/70">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#2A1B38] text-[#F5F0FA] border border-[#B58AFF]/40 shadow-[0_2px_10px_rgba(181,138,255,0.15)]'
                      : 'text-[#A39AAA] hover:text-[#F5F0FA] hover:bg-[#24212B]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-[#B58AFF]' : 'text-[#A39AAA]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls: Benchmark Switcher & Upload Button */}
          <div className="flex items-center gap-3">
            
            {/* Quick Evaluator Mode Switcher */}
            <div className="hidden lg:flex items-center gap-1 bg-[#1E1B24] p-1 rounded-xl border border-[#363042]">
              <span className="text-[11px] text-[#A39AAA] px-2 font-mono">Demo:</span>
              
              <button
                onClick={() => {
                  setSampleCase('manipulated');
                  navigate('/results');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  currentAnalysis.verdict === 'MANIPULATED'
                    ? 'bg-[#FF5370]/20 text-[#FF5370] border border-[#FF5370]/40 font-bold'
                    : 'text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
                title="Evaluate Manipulated Deepfake Sample"
              >
                <AlertTriangle className="w-3 h-3" />
                Fake (88.6%)
              </button>

              <button
                onClick={() => {
                  setSampleCase('authentic');
                  navigate('/results');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  currentAnalysis.verdict === 'AUTHENTIC'
                    ? 'bg-[#2ED573]/20 text-[#2ED573] border border-[#2ED573]/40 font-bold'
                    : 'text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
                title="Evaluate Authentic Source Sample"
              >
                <CheckCircle2 className="w-3 h-3" />
                Real (4.8%)
              </button>

              <button
                onClick={() => {
                  setSampleCase('inconclusive');
                  navigate('/results');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  currentAnalysis.verdict === 'INCONCLUSIVE'
                    ? 'bg-[#FFA502]/20 text-[#FFA502] border border-[#FFA502]/40 font-bold'
                    : 'text-[#A39AAA] hover:text-[#F5F0FA]'
                }`}
                title="Evaluate Inconclusive Compressed Sample"
              >
                <HelpCircle className="w-3 h-3" />
                Inconcl (52.4%)
              </button>
            </div>

            {/* Quick Upload CTA */}
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => navigate('/upload')}
              className="hidden sm:inline-flex"
            >
              Analyze Video
            </Button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-[#1E1B24] border border-[#363042] text-[#F5F0FA] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#B58AFF]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Full Navigation Flyout */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-[#363042] space-y-2 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#363042]">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-[#2A1B38] text-[#B58AFF] border border-[#B58AFF]/40'
                        : 'bg-[#1E1B24] text-[#A39AAA] hover:text-[#F5F0FA]'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Mobile Demo Switcher */}
            <div className="pt-2">
              <span className="text-[11px] text-[#A39AAA] font-mono block mb-1.5">Load Benchmark Demo:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setSampleCase('manipulated');
                    navigate('/results');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg bg-[#FF5370]/15 text-[#FF5370] text-[11px] font-bold border border-[#FF5370]/30"
                >
                  Fake (88.6%)
                </button>
                <button
                  onClick={() => {
                    setSampleCase('authentic');
                    navigate('/results');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg bg-[#2ED573]/15 text-[#2ED573] text-[11px] font-bold border border-[#2ED573]/30"
                >
                  Real (4.8%)
                </button>
                <button
                  onClick={() => {
                    setSampleCase('inconclusive');
                    navigate('/results');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg bg-[#FFA502]/15 text-[#FFA502] text-[11px] font-bold border border-[#FFA502]/30"
                >
                  Inconclusive
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
