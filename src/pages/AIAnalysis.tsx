import React, { useState, useEffect } from 'react';
import { Loader2, FileText, PenTool, Copy, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

const BlogGenerator = () => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode class to the root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Function to clean markdown formatting
  const cleanMarkdownFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/_{2}(.*?)_{2}/g, '$1') // Remove underscore bold
      .replace(/_(.*?)_/g, '$1')       // Remove underscore italic
      .replace(/`(.*?)`/g, '$1')       // Remove inline code
      .replace(/^>+\s*/gm, '')         // Remove blockquotes
      .trim();
  };

  const handleGenerateBlog = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key is not configured');
      return;
    }

    if (!topic.trim() || !description.trim()) {
      setError('Please provide both a topic and description');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedContent('');

    try {
      const prompt = `You are an expert blog writer specializing in compelling storytelling and impact-driven content. Generate a persuasive blog post that will inspire readers to support the cause through donations. Write without any markdown formatting symbols (* or _).

Topic: ${topic}
Description: ${description}

Guidelines:
1. Craft a powerful opening that creates an emotional connection with readers
2. Include real-world examples or scenarios that illustrate the impact of donations
3. Use persuasive storytelling techniques to engage readers
4. Structure the content to build trust and credibility:
   - Clear problem statement
   - Tangible solution
   - Specific impact of donations
   - Call to action
5. Include key sections:
   - Introduction: Hook readers with a compelling narrative
   - The Challenge: Describe the problem in human terms
   - The Solution: Explain how donations will help
   - Impact Story: Share potential outcomes
   - Call to Action: Clear instructions on how to donate
6. Use formatting to enhance readability:
   - Engaging headers
   - Short, impactful paragraphs
   - Bullet points for key information
   - Highlighted donation amounts and their specific impact
7. End with a powerful conclusion that reinforces the urgency and importance of donating

Important: Do not use any markdown formatting symbols (* or _) in the response. Write in plain text with natural emphasis through word choice and structure.

Return the blog post with clear section breaks and formatting, but without any markdown symbols.`;

      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error occurred' } }));
        throw new Error(errorData.error?.message || `Failed to generate blog: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      // Clean any remaining markdown formatting from the response
      const cleanedContent = cleanMarkdownFormatting(data.candidates[0].content.parts[0].text);
      setGeneratedContent(cleanedContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blog. Please try again.');
      console.error('Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedContent) return;
    
    try {
      await navigator.clipboard.writeText(generatedContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
      setError('Failed to copy content to clipboard. Please try again.');
    }
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">

        {/* Gradient blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 rounded-full opacity-30 blur-3xl -z-10 animate-blob" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-r from-indigo-200 to-pink-200 dark:from-indigo-800 dark:to-pink-800 rounded-full opacity-30 blur-3xl -z-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-800 dark:to-indigo-800 rounded-full opacity-20 blur-3xl -z-10 animate-blob animation-delay-4000" />

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1 
            className="text-4xl mt-10 tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="block">AI-Powered Blog Generator</span>
            <span className="block bg-blue-600 dark:bg-blue-600 bg-clip-text text-transparent">
              Create Engaging Content
            </span>
          </motion.h1>
          
          <motion.p 
            className="mt-3 max-w-md mx-auto text-base text-gray-600 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Enter a topic and description to generate a professional blog post.
          </motion.p>
        </motion.div>

        <div className="mt-12 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 gap-8">
            {/* Inputs Section */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {/* Topic Input */}
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="-mt-6">
                    <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg transform transition hover:scale-110">
                      <PenTool className="h-8 w-8 text-white" />
                    </span>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Blog Topic</h3>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full p-3 mt-5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your blog topic..."
                    />
                  </div>
                </div>
              </div>

              {/* Description Input */}
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="-mt-6">
                    <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg transform transition hover:scale-110">
                      <FileText className="h-8 w-8 text-white" />

                    </span>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Blog Description</h3>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-32 p-3 mt-5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white resize-y"
                      placeholder="Enter a brief description of your blog..."
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateBlog}
                disabled={loading || !topic.trim() || !description.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-600 text-white rounded-md hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-700 dark:hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing...
                  </span>
                ) : (
                  'Generate Blog Post'
                )}
              </button>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Generated Content */}
            {generatedContent && (
              <motion.div 
                className="rounded-lg bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Blog Post</h2>
                    <button
                      onClick={handleCopyToClipboard}
                      disabled={!generatedContent}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                  <div className="prose prose-indigo dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{generatedContent}</pre>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogGenerator;