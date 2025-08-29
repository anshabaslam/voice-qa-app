import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LinkInput } from './components/LinkInput';
import { VoiceRecorder } from './components/VoiceRecorder';
import { AnswerDisplay } from './components/AnswerDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useAppStore } from './stores/appStore';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

function App() {
  const { extractedContent, isLoading, error } = useAppStore();

  useEffect(() => {
    // Check API health on startup
    import('./services/api').then(({ apiService }) => {
      apiService.healthCheck().catch(() => {
        console.warn('Backend API not available');
      });
    });
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <MicrophoneIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Voice-Driven Q&A
                </h1>
                <p className="text-sm text-gray-600">
                  Extract content from web sources and ask questions using your voice
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <LoadingSpinner size="md" />
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <LinkInput />
              
              {extractedContent.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Extracted Content Summary
                  </h3>
                  <div className="space-y-3">
                    {extractedContent.map((content, index) => (
                      <div key={index} className="border-l-4 border-primary-500 pl-4">
                        <h4 className="font-medium text-gray-900">{content.title}</h4>
                        <p className="text-sm text-gray-600">
                          {content.word_count} words from {content.url}
                        </p>
                        {!content.success && content.error_message && (
                          <p className="text-sm text-red-600">{content.error_message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {extractedContent.length > 0 && <VoiceRecorder />}
              <AnswerDisplay />
            </div>
          </div>

          {/* Instructions */}
          {extractedContent.length === 0 && (
            <div className="mt-12 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  How to Use Voice-Driven Q&A
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-primary-600 text-2xl font-bold mb-2">1</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Add Content Sources</h3>
                    <p className="text-gray-600 text-sm">
                      Provide at least 3 web links (websites, Wikipedia, news articles) 
                      to extract content from.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-primary-600 text-2xl font-bold mb-2">2</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ask Questions</h3>
                    <p className="text-gray-600 text-sm">
                      Use voice recording or type questions about the extracted content. 
                      The AI will analyze and provide answers.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-primary-600 text-2xl font-bold mb-2">3</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Listen & Learn</h3>
                    <p className="text-gray-600 text-sm">
                      Get text and audio responses with source citations. 
                      Copy answers or replay audio as needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              Voice-Driven Q&A Application - Built with React, FastAPI, and modern web technologies
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
