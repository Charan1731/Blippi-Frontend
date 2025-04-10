import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  onDelete: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  errorMessage?: string;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  onDelete,
  onCancel,
  isDeleting,
  errorMessage
}) => {
  return (
    <div className="text-center space-y-6">
      <div className="animate-bounce-in">
        <div className="mx-auto rounded-full bg-gradient-to-r from-orange-400 to-red-400 p-3 w-20 h-20 flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
      </div>

      <div className="animate-fade-in-up space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete this Blog? This action cannot be undone.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg animate-fade-in">
          {errorMessage}
        </div>
      )}

      <div className="animate-fade-in pt-4 flex gap-4">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-3 px-6 rounded-xl font-medium
            bg-gray-200 dark:bg-gray-700 
            hover:bg-gray-300 dark:hover:bg-gray-600
            text-gray-800 dark:text-gray-200 
            transition-all duration-200"
        >
          Cancel
        </button>
        
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex-1 py-3 px-6 rounded-xl font-medium
            bg-gradient-to-r from-red-500 to-orange-500
            hover:from-red-600 hover:to-orange-600
            text-white transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            flex justify-center items-center gap-2"
        >
          {isDeleting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            'Delete Blog'
          )}
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation; 