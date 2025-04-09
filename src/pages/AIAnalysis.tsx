import React, { useState, useEffect } from 'react';
import { Loader2, FileText, PenTool, Copy, CheckCircle, Edit2, Eye, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from '../components/AnimatedText';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from '../context/ThemeContext';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const BlogGenerator = () => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 transition-colors duration-300 pt-24 pb-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>

        {/* Header Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h1 
            variants={fadeIn}
            className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
          >
            <span className="block mb-2">AI-Powered</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              Blog Generator
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeIn}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300"
          >
            Create compelling blog posts to boost your crowdfunding campaigns
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
          {/* Input Section */}
          <motion.div 
            className="md:col-span-2 space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md mr-3">
                    <PenTool className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Blog Topic</h3>
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-3 bg-white/80 dark:bg-gray-700/80 border border-gray-300/60 dark:border-gray-600/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white shadow-sm"
                  placeholder="Enter your blog topic..."
                />
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md mr-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Blog Description</h3>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-40 p-3 bg-white/80 dark:bg-gray-700/80 border border-gray-300/60 dark:border-gray-600/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white shadow-sm resize-none"
                  placeholder="Provide details about your blog post. What's the purpose? Who's the audience? What key points should be included?"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <motion.button
                onClick={handleGenerateBlog}
                disabled={loading || !topic.trim() || !description.trim()}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Generating content...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Blog Post</span>
                  </span>
                )}
              </motion.button>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50"
                >
                  <p className="flex items-center gap-2">
                    <span className="flex-shrink-0 text-red-500">⚠️</span>
                    <span>{error}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Result Section */}
          <motion.div
            className="md:col-span-3"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {!generatedContent && !loading ? (
              <motion.div 
                variants={fadeIn}
                className="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <div className="p-4 bg-blue-100/70 dark:bg-blue-900/30 rounded-full inline-block mb-4">
                    <Zap className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ready to create amazing content</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Fill in the topic and description fields, then click "Generate Blog Post" to create compelling content for your crowdfunding campaign.
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {loading ? (
                  <motion.div 
                    variants={fadeIn}
                    className="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center justify-center min-h-[400px]"
                  >
                    <div className="text-center space-y-6">
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-40"></div>
                        <div className="relative p-4 bg-white/90 dark:bg-gray-800/90 rounded-full inline-block">
                          <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Generating your blog post</h3>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 8, ease: "easeInOut" }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment...</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={fadeIn}
                    className="relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                      <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                          Generated Blog Post
                        </h2>
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
                        <div className="p-5 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-end">
                          <motion.button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-blue-500/20 flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>Save Changes</span>
                            <ArrowRight className="w-4 h-4" />
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

        {/* Copy Confirmation Toast */}
        <AnimatePresence>
          {isCopied && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Copied to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add custom scrollbar styles */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.5);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(79, 70, 229, 0.7);
          }
        `}
      </style>
    </div>
  );
};

export default BlogGenerator;