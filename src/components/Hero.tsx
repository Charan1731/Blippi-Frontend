import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine, ArrowRight, Rocket, Sparkles } from 'lucide-react';
import FadeIn from './FadeIn';
import AnimatedText from './AnimatedText';
import { motion } from 'framer-motion';

export default function Hero() {
  const navigate = useNavigate();
  const heroText = "Where Ideas Meet the Blockchain. Fuel Innovation, Empower Communities, and Shape the Future One Block at a Time.";
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Improved background with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-blue-100/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800" />
      
      {/* Abstract shapes for visual interest */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute top-40 left-1/4 w-32 h-32 bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full blur-2xl" />
      
      {/* Animated particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-2 h-2 bg-blue-500 rounded-full"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                opacity: 0.4
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-32 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="text-left">
            <FadeIn delay={200}>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <Sparkles className="w-4 h-4 mr-2 relative z-10" />
                <span className="text-sm font-medium">Web3 Publishing Platform</span>
              </motion.div>
            </FadeIn>
            
            <FadeIn delay={300}>
              <h1 className="font-sans text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                The home for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">web3 publishing</span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={400}>
              <div className="text-xl text-gray-600 dark:text-gray-300 mb-10 min-h-[4.5rem] max-w-xl">
                <AnimatedText 
                  text={heroText}
                  delay={600}
                  speed={30}
                />
              </div>
            </FadeIn>
            
            <FadeIn delay={600}>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/create')}
                  className="relative z-10 inline-flex items-center px-6 py-3.5 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <PenLine className="w-5 h-5 mr-2" aria-hidden="true" />
                  <span>Start Writing</span>
                </button>
                
                <button 
                  onClick={() => navigate('/ai')}
                  className="relative z-10 inline-flex items-center px-6 py-3.5 text-base font-medium text-blue-700 bg-white dark:bg-gray-800 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-600 dark:hover:border-blue-600 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  <span>AI Blog Generator</span>
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </button>
              </div>
            </FadeIn>
          </div>
          
          {/* Right column - Visual element */}
          <FadeIn delay={700}>
            <motion.div 
              className="relative hidden md:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg mb-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded bg-blue-500"></div>
                    <div className="ml-3 h-2 w-24 bg-blue-400/60 dark:bg-blue-500/60 rounded-full"></div>
                  </div>
                  <div className="h-2 w-full bg-blue-400/20 dark:bg-blue-500/20 rounded-full mb-2"></div>
                  <div className="h-2 w-3/4 bg-blue-400/20 dark:bg-blue-500/20 rounded-full mb-2"></div>
                  <div className="h-2 w-2/3 bg-blue-400/20 dark:bg-blue-500/20 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-8 w-20 bg-blue-600 rounded-lg flex items-center justify-center">
                    <div className="h-2 w-12 bg-white/80 rounded-full"></div>
                  </div>
                  <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <div className="h-3 w-3 bg-white/90 rounded-sm transform rotate-45"></div>
                  </div>
                </div>
                
                {/* Code editor-like content */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/80 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-2 w-12 bg-indigo-400/60 dark:bg-indigo-500/60 rounded-full"></div>
                    <div className="h-2 w-16 bg-blue-400/40 dark:bg-blue-500/40 rounded-full"></div>
                  </div>
                  <div className="h-2 w-full bg-gray-300/50 dark:bg-gray-700/50 rounded-full mb-2"></div>
                  <div className="h-2 w-3/4 bg-gray-300/50 dark:bg-gray-700/50 rounded-full mb-2"></div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-blue-500/10 dark:bg-blue-400/20 rounded-full blur-xl"></div>
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-500/10 dark:bg-indigo-400/20 rounded-full blur-xl"></div>
              </div>
              
              {/* Animated grid lines */}
              <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5">
                <div className="h-full w-full bg-grid-blue-500/10 dark:bg-grid-blue-300/10"></div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-lg flex items-center justify-center z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Rocket className="w-8 h-8 text-blue-600 dark:text-blue-400 relative z-20" aria-hidden="true" />
              </motion.div>
              
              <motion.div 
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-full shadow-lg flex items-center justify-center z-20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-blue-400">W3</div>
              </motion.div>
              
              <motion.div 
                className="absolute top-1/2 -right-10 w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 rounded-lg shadow-lg flex items-center justify-center transform rotate-12 z-20"
                animate={{ rotate: [12, -5, 12], scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-cyan-500 dark:text-cyan-400 relative z-20" aria-hidden="true" />
              </motion.div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}