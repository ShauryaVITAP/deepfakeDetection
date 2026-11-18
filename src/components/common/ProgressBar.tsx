import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'danger' | 'safe' | 'warning' | 'plum';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    primary: 'bg-[#B58AFF] shadow-[0_0_12px_rgba(181,138,255,0.5)]',
    danger: 'bg-[#FF5370] shadow-[0_0_12px_rgba(255,83,112,0.5)]',
    safe: 'bg-[#2ED573] shadow-[0_0_12px_rgba(46,213,115,0.5)]',
    warning: 'bg-[#FFA502] shadow-[0_0_12px_rgba(255,165,2,0.5)]',
    plum: 'bg-gradient-to-r from-[#522F6E] to-[#B58AFF]',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
          {label && <span className="text-[#A39AAA]">{label}</span>}
          {showPercentage && <span className="text-[#F5F0FA] font-mono">{clampedValue}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#1E1B24] border border-[#363042] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
