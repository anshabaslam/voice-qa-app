import {
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  MicrophoneIcon,
  QuestionMarkCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Table of Contents */}
        <div className="mb-16">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5" />
            Table of Contents
          </h2>
          <div className="inline-block p-6 border border-gray-300 dark:border-dark-600 rounded-[20px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="#quick-start" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <CommandLineIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Start</span>
              </a>
              <a href="#voice-features" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MicrophoneIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Features</span>
              </a>
              <a href="#content-sources" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <BookOpenIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Sources</span>
              </a>
              <a href="#settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Cog6ToothIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
              </a>
              <a href="#analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChartBarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analytics</span>
              </a>
              <a href="#best-practices" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <SparklesIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Best Practices</span>
              </a>
              <a href="#troubleshooting" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <QuestionMarkCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Troubleshooting</span>
              </a>
            </div>
          </div>
        </div>


        {/* Quick Start Section */}
        <section id="quick-start" className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <CommandLineIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Quick Start</h2>
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            This guide will help you create your first Voice Q&A application and ask questions using your voice.
          </p>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Step 1: Add Content Sources</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by adding web URLs that contain the information you want to query:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-400 ml-6 text-lg">
                <li>Navigate to the Voice Q&A page from the main sidebar</li>
                <li>Click the + icon in the Content Sources section</li>
                <li>Add 1-5 web URLs (content will auto-extract after each URL)</li>
                <li>Wait for the extraction process to complete for each URL</li>
                <li>Verify extracted content appears with word counts and success status</li>
              </ol>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Step 2: Ask Questions</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Once your content is ready, you can start asking questions using voice or text:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-400 ml-6 text-lg">
                <li><strong>Voice:</strong> Click the microphone button to start recording your question</li>
                <li>Speak clearly and release the button when finished</li>
                <li><strong>Text:</strong> Type your question directly in the chat input field</li>
                <li>Receive AI-powered responses with TTS audio playback</li>
                <li>View chat history and manage multiple conversations</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Voice Features Section */}
        <section id="voice-features" className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <MicrophoneIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Voice Features</h2>
          </div>
          
          <div className="space-y-12">
            {/* Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-blue-900 dark:text-blue-300 mb-4">Voice-Powered Q&A System</h3>
              <p className="text-lg text-blue-800 dark:text-blue-200 leading-relaxed">
                Experience seamless voice interaction with browser-based speech recognition and ElevenLabs TTS. Ask questions naturally using your microphone and receive AI-powered answers with high-quality voice synthesis playback.
              </p>
            </div>

            {/* Core Capabilities */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Core Capabilities</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                    <MicrophoneIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Voice Recording</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Push-to-talk voice recording with visual feedback and automatic speech-to-text conversion using browser APIs.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                    <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Speech Recognition</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Advanced AI converts speech to text with high accuracy, supporting multiple languages and natural speech patterns.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                    <CommandLineIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">TTS Playback</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    High-quality text-to-speech using ElevenLabs voices with configurable voice selection and audio playback controls.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Speech Recognition</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">Accent adaptation and regional dialects</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">Real-time processing with &lt;2s latency</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">95%+ accuracy in optimal conditions</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Audio Processing</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">Noise cancellation and audio enhancement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">Automatic gain control (AGC)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">Echo suppression for clear recording</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">Support for various microphone types</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-300">Optimization Tips</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-3">Environment Setup</h4>
                  <ul className="space-y-2 text-amber-800 dark:text-amber-200">
                    <li>• Use a quiet, echo-free environment</li>
                    <li>• Position microphone 6-12 inches from mouth</li>
                    <li>• Minimize background noise and distractions</li>
                    <li>• Ensure stable internet connection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-3">Speaking Technique</h4>
                  <ul className="space-y-2 text-amber-800 dark:text-amber-200">
                    <li>• Speak clearly at a moderate pace</li>
                    <li>• Use natural pauses between sentences</li>
                    <li>• Articulate technical terms and names</li>
                    <li>• Keep questions concise and focused</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sources Section */}
        <section id="content-sources" className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <BookOpenIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Content Sources</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Supported Content Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Web Content</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Wikipedia articles</li>
                    <li>• News websites</li>
                    <li>• Blog posts</li>
                    <li>• Documentation sites</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Documents</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Research papers</li>
                    <li>• Technical documentation</li>
                    <li>• Educational content</li>
                    <li>• Knowledge bases</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Content Processing</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                The platform automatically extracts and processes content from your sources:
              </p>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-dark-700">
                <pre className="text-blue-400 font-mono text-sm overflow-x-auto">
{`{
  "url": "https://example.com/article",
  "status": "processed",
  "wordCount": 2500,
  "extractedAt": "2024-01-15T10:30:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Settings & Configuration Section */}
        <section id="settings" className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Cog6ToothIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings & Configuration</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Voice Settings</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Configure text-to-speech options for AI response playback:
              </p>
              <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">TTS Configuration</h4>
                <ul className="list-disc list-inside space-y-3 text-gray-600 dark:text-gray-400 ml-6">
                  <li>Select from available ElevenLabs voices</li>
                  <li>Test voice samples before selection</li>
                  <li>Fallback to browser speech synthesis if ElevenLabs unavailable</li>
                  <li>Audio controls for play/pause/stop during response</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Chat Management</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Organize your conversations and content sources:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Chat History</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Auto-saved conversations</li>
                    <li>• Quick chat switching</li>
                    <li>• Delete unwanted chats</li>
                    <li>• Persistent content sources per chat</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Session Management</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• New chat creates fresh session</li>
                    <li>• Browser refresh starts new session</li>
                    <li>• Content sources preserved per chat</li>
                    <li>• Walkthrough tour for new users</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section id="analytics" className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <ChartBarIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Available Metrics</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                The analytics page provides comprehensive insights into your application usage:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Usage Analytics</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Interactive charts and graphs</li>
                    <li>• Question volume tracking</li>
                    <li>• Session duration metrics</li>
                    <li>• Response time analysis</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Performance Insights</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Content extraction success rates</li>
                    <li>• Voice recognition accuracy</li>
                    <li>• TTS usage statistics</li>
                    <li>• User engagement patterns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices Section */}
        <section id="best-practices" className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <SparklesIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Best Practices</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Content Strategy</h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
                <p className="text-amber-800 dark:text-amber-200 text-lg">⚡ <strong>Pro Tip:</strong> Quality over quantity - fewer high-quality sources often perform better than many low-quality ones.</p>
              </div>
              <ul className="list-disc list-inside space-y-3 text-gray-600 dark:text-gray-400 ml-6 text-lg">
                <li>Use recent, authoritative sources</li>
                <li>Ensure content diversity for comprehensive coverage</li>
                <li>Regularly update sources to maintain accuracy</li>
                <li>Verify source accessibility and content quality</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Voice Query Optimization</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Get better results by optimizing how you ask questions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3 text-lg">✅ Good Example</h4>
                  <p className="text-green-800 dark:text-green-200 italic text-lg">"What are the key benefits of using React hooks for state management?"</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h4 className="font-semibold text-red-900 dark:text-red-300 mb-3 text-lg">❌ Avoid</h4>
                  <p className="text-red-800 dark:text-red-200 italic text-lg">"Tell me about React stuff"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting Section */}
        <section id="troubleshooting" className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <QuestionMarkCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Troubleshooting</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Common Issues</h3>
              <div className="space-y-6">
                <div className="border border-gray-300 dark:border-dark-700 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Microphone Not Working</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">If the microphone isn't responding:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-6">
                    <li>Check browser permissions for microphone access</li>
                    <li>Ensure your microphone is not muted</li>
                    <li>Try refreshing the page and allowing permissions</li>
                    <li>Test with a different browser if issues persist</li>
                  </ul>
                </div>
                
                <div className="border border-gray-300 dark:border-dark-700 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Poor Response Quality</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">If responses are inaccurate or irrelevant:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-6">
                    <li>Add more relevant content sources</li>
                    <li>Use more specific questions</li>
                    <li>Ensure content sources are up-to-date</li>
                    <li>Check that URLs are accessible and contain relevant content</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Browser Requirements</h3>
              <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-300 dark:border-dark-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-6 text-lg">Supported Browsers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-3">✅ Fully Supported</p>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                      <li>• Chrome 80+</li>
                      <li>• Safari 14+</li>
                      <li>• Edge 80+</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-amber-600 dark:text-amber-400 font-semibold text-lg mb-3">⚠️ Limited Support</p>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                      <li>• Firefox 75+ (limited voice features)</li>
                      <li>• Mobile browsers (basic functionality)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-20 pt-12 border-t border-gray-300 dark:border-dark-700">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              by Anshab Aslam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}