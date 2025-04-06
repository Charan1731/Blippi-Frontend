import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'info';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'info'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-tr from-green-50 to-white dark:from-green-900/20 dark:to-gray-800';
      case 'error':
        return 'bg-gradient-to-tr from-red-50 to-white dark:from-red-900/20 dark:to-gray-800';
      case 'info':
      default:
        return 'bg-gradient-to-tr from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 dark:border-green-800';
      case 'error':
        return 'border-red-200 dark:border-red-800';
      case 'info':
      default:
        return 'border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className={`
          ${isAnimating ? 'animate-modal-in' : 'opacity-0 scale-95'} 
          ${getBgColor()}
          border ${getBorderColor()}
          max-w-md w-full rounded-2xl shadow-xl overflow-hidden
          transition-all duration-300 ease-out
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 