import React, { useState, useEffect } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export default function AnimatedText({ 
  text, 
  className = '', 
  delay = 0,
  speed = 50 
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex === 0) {
      const startDelay = setTimeout(() => {
        setCurrentIndex(1);
      }, delay);
      return () => clearTimeout(startDelay);
    }

    if (currentIndex > 0 && currentIndex <= text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay, speed]);

  return (
    <span className={`inline-block ${className}`}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}