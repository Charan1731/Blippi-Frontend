import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  cursorColor?: string;
  fadeIn?: boolean;
  gradient?: boolean;
  highlightColor?: string;
  fastMode?: boolean;
}

export default function AnimatedText({ 
  text, 
  className = '', 
  delay = 0,
  speed = 30,
  cursorColor,
  fadeIn = true,
  gradient = false,
  highlightColor = '',
  fastMode = true
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Automatically set cursor color based on theme if not specified
  const defaultCursorColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const actualCursorColor = cursorColor || defaultCursorColor;

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    // Initial delay before typing starts
    if (currentIndex === 0) {
      const startDelay = setTimeout(() => {
        setCurrentIndex(1);
      }, delay);
      return () => clearTimeout(startDelay);
    }

    // Fast mode shows text in chunks rather than character by character
    if (fastMode && currentIndex > 0 && currentIndex <= text.length) {
      const chunkSize = Math.max(Math.floor(text.length / 10), 3); // Show text in ~10 chunks
      const timer = setTimeout(() => {
        const nextIndex = Math.min(currentIndex + chunkSize, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
        
        if (nextIndex === text.length) {
          setIsComplete(true);
        }
      }, speed);
      return () => clearTimeout(timer);
    }
    
    // Regular character-by-character typing
    else if (!fastMode && currentIndex > 0 && currentIndex <= text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex));
        setCurrentIndex(currentIndex + 1);
        
        if (currentIndex === text.length) {
          setIsComplete(true);
        }
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay, speed, fastMode]);

  // Blinking cursor effect
  useEffect(() => {
    if (isComplete) {
      const cursorInterval = setInterval(() => {
        setIsCursorVisible(prev => !prev);
      }, 600);
      return () => clearInterval(cursorInterval);
    }
  }, [isComplete]);

  // Apply gradient text class if enabled
  const gradientClass = gradient 
    ? theme === 'dark'
      ? 'bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' 
    : '';
  
  // Apply highlight color if provided
  const highlightClass = highlightColor || '';

  return (
    <div 
      ref={containerRef}
      className={`inline-block relative ${className} ${gradientClass} ${highlightClass}`}
    >
      {fadeIn ? (
        <div className="inline-flex flex-wrap">
          {displayedText.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.15, // Faster animation
                delay: fastMode ? 0 : Math.min(0.01 * index, 0.5) // Limit max delay and reduce per-character delay
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
          <AnimatePresence>
            {isCursorVisible && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`font-light ${actualCursorColor}`}
              >
                |
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          {displayedText}
          {isCursorVisible && <span className={`font-light ${actualCursorColor}`}>|</span>}
        </>
      )}
    </div>
  );
}