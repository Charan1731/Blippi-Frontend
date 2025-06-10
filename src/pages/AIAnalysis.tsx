import React, { useState, useEffect } from 'react';
import { Loader2, FileText, PenTool, Copy, CheckCircle, Edit2, Eye, Zap, Sparkles, ArrowRight, Wand2, Brain, Lightbulb, Target, BookOpen, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from '../components/AnimatedText';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from '../context/ThemeContext';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
const RETRY_DELAY = 5000;
const MAX_RETRIES = 2;
const CACHE_DURATION = 1000 * 60 * 60;

interface CacheEntry {
  result: boolean;
  timestamp: number;
}

const contentCache: Map<string, CacheEntry> = new Map();

export default function BlogGenerator() {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModeratingContent, setIsModeratingContent] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showAnimatedText, setShowAnimatedText] = useState(false);
  const { theme } = useTheme();

  // Update editedContent when new content is generated
  useEffect(() => {
    if (generatedContent) {
      setEditedContent(generatedContent);
    }
  }, [generatedContent]);

  const getCachedResult = (text: string): boolean | null => {
    const cached = contentCache.get(text);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      contentCache.delete(text);
      return null;
    }
    
    return cached.result;
  };

  const setCachedResult = (text: string, result: boolean) => {
    contentCache.set(text, {
      result,
      timestamp: Date.now()
    });
  };

  const analyzeContent = React.useCallback(async (text: string, retryCount = 0): Promise<{isAppropriate: boolean, error?: string, details?: string}> => {
    const cachedResult = getCachedResult(text);
    if (cachedResult !== null) {
      return { isAppropriate: cachedResult };
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.replace(/["']/g, '');
    
    if (!apiKey) {
      console.error('Content analysis service is not properly configured - missing API key');
      return { 
        isAppropriate: true, 
        error: 'Content moderation service is not available. Please check your settings or try again later.'
      };
    }

    try {
      const endpoint = new URL(GEMINI_API_ENDPOINT);
      endpoint.searchParams.append('key', apiKey);

      const response = await fetch(endpoint.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze if the following text is appropriate for a fundraising campaign. Only mark as inappropriate if the content contains explicit harmful content such as hate speech, threats, explicit adult content, or illegal activities(consider bettings and scams as high level threats).

Text: ${text}

If the content is inappropriate, explain what specific part is inappropriate and why. If the content is appropriate, reply with "true".`
            }]
          }],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        })
      });

      if (response.status === 429) {
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY * (retryCount + 1);
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return analyzeContent(text, retryCount + 1);
        }
        console.log('Rate limit retries exhausted, proceeding with content');
        return { isAppropriate: true, error: 'Content moderation service is busy. Your content has been accepted.' };
      }

      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        return { isAppropriate: true, error: 'Content moderation service encountered an error. Your content has been accepted.' };
      }

      const data = await response.json();
      
      console.log('Gemini API response:', JSON.stringify(data, null, 2));
      
      let result = true;
      let details = '';
      if (data.candidates && data.candidates.length > 0) {
        const textResponse = data.candidates[0]?.content?.parts?.[0]?.text?.trim();
        console.log('Gemini text response:', textResponse);
        
        if (textResponse.toLowerCase() === 'true') {
          result = true;
        } else {
          result = false;
          details = textResponse;
        }
      }
      
      setCachedResult(text, result);
      return { isAppropriate: result, details: details };
    } catch (error) {
      console.error('Content analysis error:', error);
      return { isAppropriate: true, error: 'Content moderation check failed. Your content has been accepted.' };
    }
  }, []);

  const handleGenerateBlog = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.replace(/["']/g, '');
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
    setShowAnimatedText(false);

    try {
      const prompt = `You are an expert blog writer specializing in compelling storytelling and impact-driven content. Generate a **persuasive blog post** that will **inspire readers to support the cause through donations**, formatted in **Markdown**.

### **Topic:** ${topic}  
### **Description:** ${description}  

## **Guidelines for Writing the Blog Post:**

### **1. Powerful Opening**  
- Begin with an **emotional hook** that creates a strong connection with the reader.  
- Use storytelling techniques to **draw them in** and make them feel personally involved.  

### **2. The Challenge**  
- Clearly describe the **problem** in **human terms**.  
- Use real-world examples or relatable scenarios to **illustrate the severity** of the issue.  

### **3. The Solution**  
- Explain **how donations** will directly **address the problem**.  
- Provide a clear, actionable plan that **builds trust and credibility**.  

### **4. Impact Story**  
- Share a **compelling real-life example or testimonial** that shows the **tangible difference** donations can make.  
- Make the reader **visualize the outcome** of their support.  

### **5. Call to Action (CTA)**  
- Provide a **strong, clear directive** on how to donate.  
- Use bullet points to break down **different donation amounts in ETH** and their specific impact:  

  - **0.01 ETH**: Provides food and shelter for a child for a day.  
  - **0.05 ETH**: Supports healthcare for a family in need.  
  - **0.1 ETH**: Funds an entire education program for a child.  

### **6. Formatting for Readability**  
- Use **bold** for emphasis.  
- Break content into **short, engaging paragraphs**.  
- Include **bullet points and numbered lists** for clarity.  
- Use **quotes or testimonials** to reinforce credibility.  

### **7. Conclusion**  
- End with a **powerful, urgent message** that reinforces why donating **now** is crucial.  
- Leave readers with a **sense of purpose and inspiration**.  

---

## **Output Format:**
Ensure the final blog post is structured using **Markdown** with:  
- **Headers (#, ##, ###)** for sections.  
- **Bold text (**bold**)** for emphasis.  
- **Bullet points (-)** for lists.  
- **Numbered lists (1. 2. 3.) when needed.**  
- **Quotes (>) for impactful messages.**  

**Do not use markdown symbols in the prompt, but ensure the final output is in proper Markdown format.**  

Return only the **fully written blog post** in Markdown format without explaining the structure separately.`;

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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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
        throw new Error(errorData.error?.message || `Failed to generate blog: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      // Store generated content with markdown formatting intact
      const content = data.candidates[0].content.parts[0].text;
      setGeneratedContent(content);
      setShowAnimatedText(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blog. Please try again.');
      console.error('Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modified copy handler to use edited content
  const handleCopyToClipboard = async () => {
    const contentToCopy = isEditing ? editedContent : generatedContent;
    if (!contentToCopy) return;
    
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
      setError('Failed to copy content to clipboard. Please try again.');
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 transition-colors duration-300 pt-24 pb-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Enhanced decorative elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-400/20 via-cyan-400/20 to-teal-400/20 dark:from-indigo-500/10 dark:via-cyan-500/10 dark:to-teal-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-rose-400/20 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-rose-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>

        {/* Floating icons */}
        <motion.div 
          className="absolute top-32 left-10 text-blue-500/30 dark:text-blue-400/20"
          animate={floatingAnimation}
        >
          <Brain className="w-8 h-8" />
        </motion.div>
        <motion.div 
          className="absolute top-48 right-20 text-purple-500/30 dark:text-purple-400/20"
          animate={floatingAnimation}
          style={{ animationDelay: '1s' }}
        >
          <Lightbulb className="w-6 h-6" />
        </motion.div>
        <motion.div 
          className="absolute bottom-32 left-20 text-indigo-500/30 dark:text-indigo-400/20"
          animate={floatingAnimation}
          style={{ animationDelay: '2s' }}
        >
          <Wand2 className="w-7 h-7" />
        </motion.div>

        {/* Enhanced Header Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div 
            variants={fadeIn}
            className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800/30 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Powered by Advanced AI</span>
          </motion.div>
          
          <motion.h1 
            variants={fadeIn}
            className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-4"
          >
            <span className="block mb-2">AI-Powered</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              Blog Generator
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeIn}
            className="mt-4 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300"
          >
            Transform your ideas into compelling blog posts that inspire action and drive engagement
          </motion.p>

          {/* Feature highlights */}
          <motion.div 
            variants={fadeIn}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            {[
              { icon: <Target className="w-4 h-4" />, text: "Persuasive Content" },
              { icon: <BookOpen className="w-4 h-4" />, text: "SEO Optimized" },
              { icon: <Rocket className="w-4 h-4" />, text: "Instant Results" }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                <span className="text-blue-600 dark:text-blue-400">{feature.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
          {/* Enhanced Input Section */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg mr-3">
                    <PenTool className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Blog Topic</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">What's your main subject?</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-4 bg-white/90 dark:bg-gray-700/90 border border-gray-300/60 dark:border-gray-600/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white shadow-sm transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g., Sustainable Energy Solutions, Education for All..."
                  />
                  {topic && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg mr-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Blog Description</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Provide detailed context</p>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-40 p-4 bg-white/90 dark:bg-gray-700/90 border border-gray-300/60 dark:border-gray-600/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white shadow-sm resize-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Describe your blog's purpose, target audience, key points to include, and the impact you want to make..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                    {description.length}/500
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <motion.button
                onClick={handleGenerateBlog}
                disabled={loading || !topic.trim() || !description.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {loading ? (
                  <span className="relative flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-medium">
                      {isModeratingContent ? 'Analyzing content...' : 'Generating your blog...'}
                    </span>
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-3">
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Amazing Content</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </motion.button>
            </motion.div>

            {/* Enhanced Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="relative p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center mt-0.5">
                      <span className="text-red-600 dark:text-red-400 text-xs">!</span>
                    </div>
                    <div>
                      <p className="font-medium">Generation Error</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Enhanced Result Section */}
          <motion.div
            className="lg:col-span-3"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {!generatedContent && !loading ? (
              <motion.div 
                variants={fadeIn}
                className="h-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden"
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10">
                  <div className="absolute top-10 left-10 w-20 h-20 border border-blue-500 rounded-full"></div>
                  <div className="absolute top-32 right-16 w-16 h-16 border border-purple-500 rounded-lg rotate-45"></div>
                  <div className="absolute bottom-20 left-20 w-12 h-12 border border-indigo-500 rounded-full"></div>
                  <div className="absolute bottom-32 right-10 w-24 h-24 border border-pink-500 rounded-lg rotate-12"></div>
                </div>
                
                <div className="text-center space-y-6 relative z-10">
                  <motion.div 
                    className="relative"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl inline-block mb-6 shadow-lg">
                      <Zap className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Ready to Create Magic</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                    Fill in your topic and description, then watch as AI transforms your ideas into compelling, 
                    professional blog content that engages and inspires.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    {['AI-Powered', 'SEO Ready', 'Engaging', 'Professional'].map((tag, index) => (
                      <motion.span 
                        key={tag}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {loading ? (
                  <motion.div 
                    variants={fadeIn}
                    className="h-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden"
                  >
                    <div className="text-center space-y-8 relative z-10">
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative p-6 bg-white/90 dark:bg-gray-800/90 rounded-2xl inline-block shadow-xl">
                          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Crafting Your Perfect Blog
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Our AI is analyzing your requirements and creating compelling content...
                        </p>
                      </div>
                      
                      <div className="w-full max-w-md mx-auto">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span>Progress</span>
                          <span>Generating...</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 8, ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={fadeIn}
                    className="relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                      <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                              Generated Blog Post
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">AI-crafted content ready for publishing</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => setIsEditing(!isEditing)}
                            className="p-2.5 bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title={isEditing ? "View preview" : "Edit content"}
                          >
                            {isEditing ? <Eye className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
                          </motion.button>
                          <motion.button
                            onClick={handleCopyToClipboard}
                            className="p-2.5 bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Copy to clipboard"
                          >
                            {isCopied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                          </motion.button>
                        </div>
                      </div>
                      <div className="p-6" data-color-mode={theme}>
                        {isEditing ? (
                          <div className="min-h-[500px]">
                            <MDEditor
                              value={editedContent}
                              onChange={(value) => setEditedContent(value || '')}
                              preview="edit"
                              height={500}
                              className="w-full rounded-xl overflow-hidden border-none"
                              hideToolbar={false}
                              enableScroll={true}
                            />
                          </div>
                        ) : (
                          <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none min-h-[500px] max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                            {showAnimatedText ? (
                              <AnimatedText 
                                text={editedContent || generatedContent} 
                                speed={5}
                                className="block whitespace-pre-wrap text-gray-800 dark:text-gray-200"
                              />
                            ) : (
                              <MDEditor.Markdown
                                source={editedContent || generatedContent}
                                style={{
                                  backgroundColor: 'transparent',
                                  color: theme === 'dark' ? '#fff' : '#000',
                                  fontFamily: 'inherit'
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20 flex justify-end">
                          <motion.button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-blue-500/20 flex items-center gap-2 font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Save Changes</span>
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Enhanced Copy Confirmation Toast */}
        <AnimatePresence>
          {isCopied && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="fixed z-50 bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-sm"
            >
              <div className="p-1 bg-white/20 rounded-full">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Content Copied!</p>
                <p className="text-sm opacity-90">Ready to paste anywhere</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced custom scrollbar styles */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, rgba(99, 102, 241, 0.6), rgba(79, 70, 229, 0.6));
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, rgba(99, 102, 241, 0.8), rgba(79, 70, 229, 0.8));
            background-clip: content-box;
          }
        `}
      </style>
    </div>
  );
};