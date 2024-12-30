import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}