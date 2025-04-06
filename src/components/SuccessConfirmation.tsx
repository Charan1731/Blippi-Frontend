import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessConfirmationProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({
  title,
  message,
  actionText,
  onAction
}) => {
  return (
    <div className="text-center space-y-6">
      <div className="animate-bounce-in">
        <div className="mx-auto rounded-full bg-gradient-to-r from-green-400 to-teal-400 p-3 w-20 h-20 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
      </div>

      <div className="animate-fade-in-up space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>

      {actionText && onAction && (
        <div className="animate-fade-in pt-4">
          <button
            onClick={onAction}
            className="w-full py-3 px-6 rounded-xl font-medium
              bg-gradient-to-r from-teal-500 to-green-500
              hover:from-teal-600 hover:to-green-600
              text-white transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default SuccessConfirmation; 