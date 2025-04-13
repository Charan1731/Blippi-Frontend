import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ContentSummarizer from './ContentSummarizer';

interface SummarizeButtonProps {
  content: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  className?: string;
}

const SummarizeButton: React.FC<SummarizeButtonProps> = ({
  content,
  variant = 'primary',
  size = 'md',
  title = 'AI Summary',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getButtonStyles = () => {
    const baseStyles = "flex items-center justify-center transition-all duration-200 font-medium rounded-lg";
    const sizeStyles = {
      sm: "text-xs py-1.5 px-2",
      md: "text-sm py-2 px-3",
      lg: "text-base py-2.5 px-4"
    };
    
    const variantStyles = {
      primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-blue-500/20",
      secondary: "bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300",
      outline: "border border-blue-300 hover:border-blue-400 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30",
      icon: "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30",
      text: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
    };
    
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={getButtonStyles()}
        title="Generate AI summary"
      >
        <Sparkles className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${variant !== 'text' ? 'mr-2' : ''}`} />
        {variant !== 'icon' && "Summarize"}
      </button>
      
      <ContentSummarizer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={content}
        title={title}
      />
    </>
  );
};

export default SummarizeButton; 