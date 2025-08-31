import React, { useState } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  PlayIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface DocsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsSidebar({ isOpen, onClose }: DocsSidebarProps): any {
  const [expandedSections, setExpandedSections] = useState<any>({
    gettingStarted: true,
    features: false,
    advanced: false,
    troubleshooting: false
  });

  const toggleSection = (section: any) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const docSections = [
    {
      id: 'gettingStarted',
      title: 'Getting Started',
      icon: PlayIcon,
      content: [
        {
          title: 'Quick Start Guide',
          items: [
            'Navigate to the Voice Q&A page',
            'Add at least 1 web URLs in the Content Sources section',
            'Wait for content extraction to complete',
            'Click the microphone to start voice recording',
            'Ask your question clearly',
            'Receive AI-powered responses with citations'
          ]
        },
        {
          title: 'Supported Content Types',
          items: [
            'Wikipedia articles',
            'News websites and blogs',
            'Documentation sites',
            'Educational content',
            'Research papers and PDFs',
            'Technical documentation'
          ]
        }
      ]
    },
    {
      id: 'features',
      title: 'Core Features',
      icon: SparklesIcon,
      content: [
        {
          title: 'Voice Q&A',
          items: [
            'Real-time voice recording with visual feedback',
            'Automatic speech-to-text conversion',
            'AI-powered question answering',
            'Audio responses with natural speech',
            'Source citations for all answers'
          ]
        },
        {
          title: 'Analytics Dashboard',
          items: [
            'Track usage statistics and metrics',
            'Monitor question success rates',
            'View response times and performance',
            'Recent activity tracking',
            'User engagement insights'
          ]
        },
        {
          title: 'Content Management',
          items: [
            'Bulk URL processing',
            'Content validation and error handling',
            'Word count and source tracking',
            'Content freshness monitoring'
          ]
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Usage',
      icon: Cog6ToothIcon,
      content: [
        {
          title: 'Best Practices',
          items: [
            'Use clear, specific questions for better results',
            'Provide diverse, high-quality source URLs',
            'Speak clearly and at a moderate pace',
            'Allow processing time for large content sets',
            'Review source citations for accuracy'
          ]
        },
        {
          title: 'Optimization Tips',
          items: [
            'Use recent, authoritative sources',
            'Combine multiple related URLs for context',
            'Ask follow-up questions for deeper insights',
            'Utilize the analytics dashboard for improvements',
            'Regular content updates for accuracy'
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: QuestionMarkCircleIcon,
      content: [
        {
          title: 'Common Issues',
          items: [
            'Microphone not working: Check browser permissions',
            'Poor audio quality: Ensure quiet environment',
            'Content extraction fails: Verify URL accessibility',
            'Slow responses: Check internet connection',
            'Inaccurate answers: Use more specific sources'
          ]
        },
        {
          title: 'Browser Requirements',
          items: [
            'Chrome 80+ (recommended)',
            'Safari 14+ (macOS/iOS)',
            'Firefox 75+ (limited voice support)',
            'Edge 80+ (Windows)',
            'Microphone access required',
            'JavaScript enabled'
          ]
        }
      ]
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 
        shadow-2xl border-l border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <BookOpenIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documentation
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Voice Q&A Guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* App Overview */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Voice-Driven Q&A Platform
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Transform any web content into an interactive knowledge base. 
              Ask questions using your voice and get AI-powered answers with citations.
            </p>
          </div>

          {/* Documentation Sections */}
          {docSections.map((section) => (
            <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <section.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {section.title}
                  </span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {expandedSections[section.id] && (
                <div className="px-4 pb-4 space-y-4">
                  {section.content.map((subsection, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">
                        {subsection.title}
                      </h4>
                      <ul className="space-y-2">
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Quick Tips */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <h3 className="font-medium text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
              <MicrophoneIcon className="w-4 h-4" />
              Pro Tips
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>• Use specific questions for better results</li>
              <li>• Provide multiple related sources for context</li>
              <li>• Check analytics for usage insights</li>
              <li>• Enable microphone permissions for voice features</li>
            </ul>
          </div>

          {/* Contact/Support */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              If you encounter issues or need additional support, try these resources:
            </p>
            <div className="space-y-2 text-sm">
              <a 
                href="#" 
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <DocumentTextIcon className="w-4 h-4" />
                View Analytics for troubleshooting
              </a>
              <a 
                href="#" 
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <QuestionMarkCircleIcon className="w-4 h-4" />
                Check browser compatibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}