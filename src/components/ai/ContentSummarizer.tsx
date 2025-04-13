import React, { useState } from 'react';
import { Loader2, FileText, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedText from '../AnimatedText';
import Modal from '../Modal';

interface ContentSummarizerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
}

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const ContentSummarizer: React.FC<ContentSummarizerProps> = ({
  isOpen,
  onClose,
  content,
  title = "Content Summary"
}) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showAnimatedText, setShowAnimatedText] = useState(false);

  const handleGenerateSummary = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.replace(/["']/g, '');
    if (!apiKey) {
      setError('Gemini API key is not configured');
      return;
    }

    if (!content.trim()) {
      setError('No content provided to summarize');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');
    setShowAnimatedText(false);

    try {
      const prompt = `Please provide a concise and engaging summary of the following content. The summary should:
      
1. Capture the main points and key information
2. Be approximately 2-3 paragraphs in length
3. Maintain the original tone but be more concise
4. Highlight any calls to action or important points
5. Be well-structured and easy to read

Here is the content to summarize:

${content}

Return ONLY the summary text without any additional commentary or explanation.`;

      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error occurred' } }));
        throw new Error(errorData.error?.message || `Failed to generate summary: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const summaryText = data.candidates[0].content.parts[0].text;
      setSummary(summaryText);
      setShowAnimatedText(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary. Please try again.');
      console.error('Summary Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
      setError('Failed to copy content to clipboard. Please try again.');
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Auto-generate summary when modal opens
  React.useEffect(() => {
    if (isOpen && content && !summary && !loading) {
      handleGenerateSummary();
    }
  }, [isOpen, content]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="info">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Analyzing content and generating summary...
            </p>
          </div>
        ) : summary ? (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-20 blur-sm"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Generated Summary</span>
                </div>
                <button 
                  onClick={handleCopyToClipboard}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Copy to clipboard"
                >
                  {isCopied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                {showAnimatedText ? (
                  <AnimatedText text={summary} speed={2} />
                ) : (
                  <p>{summary}</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-4 flex flex-col items-center text-center text-gray-500 dark:text-gray-400">
            <FileText className="w-10 h-10 mb-2 opacity-50" />
            <p>Click the button below to generate a summary</p>
          </div>
        )}

        {!loading && !summary && (
          <button
            onClick={handleGenerateSummary}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm hover:shadow-blue-500/20 transition-all duration-200 flex items-center justify-center"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Summary
          </button>
        )}
      </div>
    </Modal>
  );
};

export default ContentSummarizer; 