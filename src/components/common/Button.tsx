import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg font-medium gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl font-semibold gap-2',
    lg: 'text-base px-6 py-3.5 rounded-xl font-semibold gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#B58AFF] text-[#17151C] hover:bg-[#C7A3FF] active:bg-[#935CE6] shadow-[0_4px_20px_rgba(181,138,255,0.35)] hover:shadow-[0_6px_25px_rgba(181,138,255,0.45)] border border-[#C7A3FF]/40',
    secondary:
      'bg-[#2A1B38] text-[#D6B8E8] hover:bg-[#3D2452] active:bg-[#1D1326] border border-[#B58AFF]/30 hover:border-[#B58AFF]/60 shadow-[0_2px_12px_rgba(42,27,56,0.5)]',
    outline:
      'bg-[#24212B]/80 text-[#F5F0FA] hover:bg-[#2C2836] border border-[#363042] hover:border-[#B58AFF]/40 active:bg-[#1E1B24]',
    danger:
      'bg-[#FF5370]/15 text-[#FF5370] hover:bg-[#FF5370]/25 border border-[#FF5370]/40 shadow-[0_0_15px_rgba(255,83,112,0.2)]',
    ghost:
      'bg-transparent text-[#A39AAA] hover:text-[#F5F0FA] hover:bg-[#24212B]/60 border border-transparent',
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};
