import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, rightIcon, ...props }) => {
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
          className={`w-full bg-azul-fundo border-none rounded-3xl py-3.5 ${
            icon ? 'pl-12' : 'pl-5'
          } ${rightIcon ? 'pr-12' : 'pr-5'} text-texto placeholder-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all`}
        />
        {rightIcon && (
          <div className="absolute right-4 text-cinza-claro-fundo cursor-pointer">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
};
