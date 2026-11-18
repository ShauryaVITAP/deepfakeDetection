import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
}) => {
  const changeColor = {
    positive: 'text-[#2ED573] bg-[#2ED573]/10 border-[#2ED573]/20',
    negative: 'text-[#FF5370] bg-[#FF5370]/10 border-[#FF5370]/20',
    neutral: 'text-[#A39AAA] bg-[#363042]/40 border-[#363042]',
  }[changeType];

  return (
    <Card hoverEffect className="relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-28 h-28 bg-[#3D2452]/20 rounded-full blur-2xl group-hover:bg-[#B58AFF]/15 transition-all duration-300 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#A39AAA] uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/20 flex items-center justify-center text-[#B58AFF] group-hover:border-[#B58AFF]/50 group-hover:text-[#D6B8E8] transition-colors">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl lg:text-3xl font-extrabold text-[#F5F0FA] font-mono tracking-tight">
          {value}
        </span>
        {change && (
          <span className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${changeColor}`}>
            {change}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-[#A39AAA] mt-2 font-medium">{description}</p>
      )}
    </Card>
  );
};
