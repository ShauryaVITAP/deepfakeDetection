import React from 'react';
import { Verdict } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'authentic' | 'inconclusive' | 'manipulated' | 'neutral' | 'plum' | 'lavender';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-semibold tracking-wide',
  };

  const variantClasses = {
    authentic: 'bg-[#2ED573]/15 text-[#2ED573] border border-[#2ED573]/30 shadow-[0_0_12px_rgba(46,213,115,0.15)]',
    inconclusive: 'bg-[#FFA502]/15 text-[#FFA502] border border-[#FFA502]/30 shadow-[0_0_12px_rgba(255,165,2,0.15)]',
    manipulated: 'bg-[#FF5370]/15 text-[#FF5370] border border-[#FF5370]/30 shadow-[0_0_12px_rgba(255,83,112,0.2)]',
    neutral: 'bg-[#24212B] text-[#A39AAA] border border-[#363042]',
    plum: 'bg-[#3D2452]/60 text-[#D6B8E8] border border-[#B58AFF]/30',
    lavender: 'bg-[#B58AFF]/15 text-[#B58AFF] border border-[#B58AFF]/30',
  };

  const dotColors = {
    authentic: 'bg-[#2ED573]',
    inconclusive: 'bg-[#FFA502]',
    manipulated: 'bg-[#FF5370]',
    neutral: 'bg-[#A39AAA]',
    plum: 'bg-[#B58AFF]',
    lavender: 'bg-[#B58AFF]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

export const VerdictBadge: React.FC<{ verdict: Verdict; size?: 'sm' | 'md' | 'lg' }> = ({
  verdict,
  size = 'md',
}) => {
  switch (verdict) {
    case 'AUTHENTIC':
      return <Badge variant="authentic" size={size} dot>Verified Authentic</Badge>;
    case 'INCONCLUSIVE':
      return <Badge variant="inconclusive" size={size} dot>Inconclusive Result</Badge>;
    case 'MANIPULATED':
      return <Badge variant="manipulated" size={size} dot>Deepfake Detected</Badge>;
    default:
      return <Badge variant="neutral" size={size}>{verdict}</Badge>;
  }
};

export const DemoDataBadge: React.FC<{ isDemoData?: boolean; className?: string }> = ({ 
  isDemoData = true, 
  className = '' 
}) => {
  if (!isDemoData) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1B382A] border border-[#2ED573]/50 text-[10px] font-mono font-bold text-[#2ED573] uppercase tracking-wider ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#2ED573] animate-pulse" />
        <span>LIVE MODEL PREDICTION</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2A1B38] border border-[#B58AFF]/40 text-[10px] font-mono font-bold text-[#D6B8E8] uppercase tracking-wider ${className}`}>
      <span>BENCHMARK DATA</span>
    </span>
  );
};
