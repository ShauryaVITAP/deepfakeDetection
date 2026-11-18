import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: 'none' | 'primary' | 'danger' | 'safe';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glow = 'none',
  onClick,
}) => {
  const glowClasses = {
    none: '',
    primary: 'hover:shadow-[0_0_25px_rgba(181,138,255,0.2)] hover:border-[#B58AFF]/50',
    danger: 'hover:shadow-[0_0_25px_rgba(255,83,112,0.25)] hover:border-[#FF5370]/50',
    safe: 'hover:shadow-[0_0_25px_rgba(46,213,115,0.25)] hover:border-[#2ED573]/50',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#24212B] border border-[#363042] rounded-2xl p-6 transition-all duration-200 ${
        hoverEffect ? 'hover:bg-[#2C2836] hover:border-[#4B3F5E] cursor-pointer' : ''
      } ${glowClasses[glow]} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 pb-4 border-b border-[#363042]/70 mb-5 ${className}`}>
    <div className="flex items-center gap-3">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/30 flex items-center justify-center text-[#B58AFF] shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-base font-bold text-[#F5F0FA] tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-[#A39AAA] mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
