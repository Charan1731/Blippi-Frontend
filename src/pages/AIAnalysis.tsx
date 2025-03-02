import React, { useState, useEffect } from 'react';
import { Loader2, FileText, PenTool, Copy, Moon, Sun, Edit2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedText from '../components/AnimatedText';
import MDEditor from '@uiw/react-md-editor';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const BlogGenerator = () => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

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
    const apiKey = import.meta.env.VITE_GEMINI?.replace(/["']/g, '');
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

  // Update editedContent when new content is generated
  useEffect(() => {
    if (generatedContent) {
      setEditedContent(generatedContent);
    }
  }, [generatedContent]);

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

            {/* Generated Content Section with Markdown Editor */}
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Generated Blog Post
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title={isEditing ? "View preview" : "Edit content"}
                      >
                        {isEditing ? <Eye className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={handleCopyToClipboard}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Markdown Editor/Preview Toggle */}
                  <div data-color-mode={isDarkMode ? "dark" : "light"}>
                    {isEditing ? (
                      <div className="min-h-[500px]">
                        <MDEditor
                          value={editedContent}
                          onChange={(value) => setEditedContent(value || '')}
                          preview="edit"
                          height={500}
                          className="w-full"
                          hideToolbar={false}
                          enableScroll={true}
                        />
                      </div>
                    ) : (
                      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
                        <MDEditor.Markdown
                          source={editedContent || generatedContent}
                          style={{
                            backgroundColor: 'transparent',
                            color: isDarkMode ? '#fff' : '#000',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Save Changes Button (visible only in edit mode) */}
                  {isEditing && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // You can add save functionality here if needed
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                {/* Copy Confirmation Toast */}
                {isCopied && (
                  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-up">
                    Copied to clipboard!
                  </div>
                )}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogGenerator;