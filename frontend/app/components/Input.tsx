import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const Input: React.FC<InputProps> = ({ label, icon, rightIcon, onRightIconClick, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const handleRightIconClick = () => {
    if (isPassword) {
      setShowPassword(!showPassword);
    }
    if (onRightIconClick) {
      onRightIconClick();
    }
  };

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const EyeIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  const displayedRightIcon = isPassword ? (showPassword ? EyeOffIcon : EyeIcon) : rightIcon;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-cinza-claro-texto ml-1">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-cinza-claro-fundo">
            {icon}
          </div>
        )}
        <input
          {...props}
          type={inputType}
          className={`w-full bg-azul-fundo border-none rounded-3xl py-3.5 ${
            icon ? 'pl-12' : 'pl-5'
          } ${displayedRightIcon ? 'pr-12' : 'pr-5'} text-texto placeholder-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all`}
        />
        {displayedRightIcon && (
          <div 
            className={`absolute right-4 text-cinza-claro-fundo ${(isPassword || onRightIconClick) ? 'cursor-pointer hover:text-azul transition-colors' : ''}`}
            onClick={isPassword || onRightIconClick ? handleRightIconClick : undefined}
          >
            {displayedRightIcon}
          </div>
        )}
      </div>
    </div>
  );
};
