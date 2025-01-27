import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import FadeIn from './FadeIn';
import AnimatedText from './AnimatedText';

export default function Hero() {
  const navigate = useNavigate();
  const heroText = "Exploring Web3: Your Gateway to Decentralized Innovation, Blockchain Breakthroughs, and the Next Era of the Internet.";

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100/80 via-blue-100/50 to-blue-300/60 dark:from-gray-900/80 dark:via-blue-900/50 dark:to-blue-800/60" />
      <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-900/50" />
      <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 sm:px-6 lg:px-8 text-center">
        <FadeIn delay={200}>
          <h1 className="font-sans text-5xl sm:text-6xl mt-20 lg:text-7xl font-bold text-blue-600 dark:text-white mb-6">
          The home for web3 publishing
          </h1>
        </FadeIn>
        
        <FadeIn delay={400}>
          <div className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto min-h-[3rem]">
            <AnimatedText 
              text={heroText}
              delay={600}
              speed={30}
            />
          </div>
        </FadeIn>
        
        <FadeIn delay={600}>
          <button 
            onClick={() => navigate('/create')}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <PenLine className="w-5 h-5 mr-2" />
            Start Writing
          </button>
        </FadeIn>
      </div>
    </div>
  );
}