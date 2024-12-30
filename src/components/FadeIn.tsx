import React, { useRef } from 'react';
import { useInView } from '../hooks/useInView';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export default function FadeIn({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(20px)';
      case 'down': return 'translateY(-20px)';
      case 'left': return 'translateX(20px)';
      case 'right': return 'translateX(-20px)';
      default: return 'translateY(20px)';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        transform: isInView ? 'none' : getTransform(),
        opacity: isInView ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}