import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = ({ label, error, helperText, className = '', ...props }: InputProps) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-300 transition-all duration-200 text-gray-800 placeholder-gray-400 ${
          error ? 'border-red-400 focus:ring-red-400/50' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-gray-400">{helperText}</p>}
    </div>
  );
};

export default Input;
