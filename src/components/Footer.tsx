import React from 'react';
import { Twitter, Github, Linkedin, Mail, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden py-8">
      {/* Minimal gradient accent */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & App Links */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Blippi</h2>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
              <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
              <Link to="/create" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Write</Link>
              <Link to="/ai" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">AI Generator</Link>
              <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Profile</Link>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="flex space-x-4">
            {[
              { icon: <Twitter className="w-4 h-4" />, href: "https://x.com/CharanR18433412" },
              { icon: <Github className="w-4 h-4" />, href: "https://github.com/Charan1731" },
              { icon: <Linkedin className="w-4 h-4" />, href: "https://www.linkedin.com/in/charandeep-reddy-2640a4301/" },
              { icon: <Mail className="w-4 h-4" />, href: "mailto:charan23114@gmail.com" }
            ].map((social, index) => (
              <motion.a 
                key={index}
                href={social.href} 
                target='_blank'
                whileHover={{ scale: 1.15, y: -2 }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/50 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>© {new Date().getFullYear()} Blippi</span>
          <span className="hidden sm:inline">•</span>
          <span>Web3 Publishing Platform</span>
          <span className="hidden sm:inline">•</span>
          <a href="https://zippy-kiwi-7e8.notion.site/Privacy-Policy-16c184f7e1cf80a18d7ae96970acab54?pvs=4" target="_blank" className="hover:text-blue-500">Privacy</a>
          <span className="hidden sm:inline">•</span>
          <a href="https://zippy-kiwi-7e8.notion.site/Terms-of-Service-16c184f7e1cf8014b2c6d9f89372e780?pvs=4" target="_blank" className="hover:text-blue-500">Terms</a>
          <motion.div 
            className="ml-1 inline-flex"
            whileHover={{ rotate: 45 }}
            transition={{ duration: 0.3 }}
          >
            <Rocket className="w-3 h-3 text-blue-500/70" />
          </motion.div>
        </div>
      </div>
    </footer>
  );
}