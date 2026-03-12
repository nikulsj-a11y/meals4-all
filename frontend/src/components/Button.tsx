import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'orange';
  fullWidth?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';
  const flexClasses = fullWidth ? 'flex w-full' : 'inline-flex';

  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm',
    secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    orange: 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-sm shadow-orange-500/20',
  };

  return (
    <button
      className={`${baseClasses} ${flexClasses} items-center justify-center ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
