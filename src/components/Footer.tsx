import React from 'react';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import FadeIn from './FadeIn';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FadeIn delay={100}>
            <div>
              <h3 className="font-sans text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subscribe to our newsletter
              </h3>
              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div>
              <h3 className="font-sans text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><a href="https://zippy-kiwi-7e8.notion.site/About-Us-16c184f7e1cf80bfb53cd5eed65c0638" target='_blank' className="hover:text-blue-600 dark:hover:text-blue-400">About Us</a></li>
                <li><a href="https://zippy-kiwi-7e8.notion.site/Contact-Us-16c184f7e1cf802f9656e01e2ed8ad8c" target='_blank' className="hover:text-blue-600 dark:hover:text-blue-400">Contact</a></li>
                <li><a href="https://zippy-kiwi-7e8.notion.site/Privacy-Policy-16c184f7e1cf80a18d7ae96970acab54?pvs=4" target='_blank' className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a></li>
                <li><a href="https://zippy-kiwi-7e8.notion.site/Terms-of-Service-16c184f7e1cf8014b2c6d9f89372e780?pvs=4" target='_blank' className="hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</a></li>
              </ul>
            </div>
          </FadeIn>
          <FadeIn delay={300}>
            <div>
              <h3 className="font-sans text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Categories
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><a href="https://zippy-kiwi-7e8.notion.site/Technology-170184f7e1cf8019a033caa1d117cf40" target='_blank' className="hover:text-blue-600 dark:hover:text-blue-400">Technology</a></li>
                <li><a href="https://zippy-kiwi-7e8.notion.site/Buisiness-170184f7e1cf8003ae73ca96d780e7c8?pvs=73" target='_blank' className="hover:text-blue-600 dark:hover:text-blue-400">Business</a></li>
                <li><a href="https://zippy-kiwi-7e8.notion.site/Creativity-170184f7e1cf80c7b973cd6664ee93c2?pvs=73" target='_blank' className="hover:text-blue-600 dark:hover:text-blue-400">Creativity</a></li>
                <li><a href="https://zippy-kiwi-7e8.notion.site/Innovation-170184f7e1cf8044b88ecf783279fa9f?pvs=73" target='_blank' className="hover:text-blue-600 dark:hover:text-blue-400">Innovation</a></li>
              </ul>
            </div>
          </FadeIn>
          <FadeIn delay={400}>
            <div>
              <h3 className="font-sans text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                <a href="https://x.com/CharanR18433412" target='_blank' className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://github.com/Charan1731" target='_blank' className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/charandeep-reddy-2640a4301/" target='_blank' className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:charan23114@gmail.com" target='_blank' className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
        
        <FadeIn delay={500}>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Your Blog. All rights reserved.
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}