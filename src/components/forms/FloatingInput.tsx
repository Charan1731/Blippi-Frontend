import React from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

export default function FloatingInput({ 
  label, 
  error, 
  id,
  value,
  className,
  ...props 
}: FloatingInputProps) {
  const [focused, setFocused] = React.useState(false);
  const hasValue = value !== '';

  return (
    <div className="relative">
      <input
        id={id}
        {...props}
        value={value}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={`
          peer w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
          border rounded-lg px-4 pt-6 pb-2 text-gray-900 dark:text-white
          transition-all duration-200 outline-none
          ${error ? 'border-red-500' : focused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600'}
          ${hasValue ? 'ring-1 ring-blue-500/10' : ''}
          ${className || ''}
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          ${(focused || hasValue) ? 'text-xs top-2' : 'text-base top-4'}
          ${error ? 'text-red-500' : focused ? 'text-blue-600' : 'text-gray-500'}
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}