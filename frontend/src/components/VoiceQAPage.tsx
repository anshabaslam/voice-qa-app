import { LinkInput } from './LinkInput';
import { VoiceRecorder } from './VoiceRecorder';
import { AnswerDisplay } from './AnswerDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppStore } from '../stores/appStore';

export function VoiceQAPage() {
  const { extractedContent, isLoading, error } = useAppStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Q&A</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Extract content from web sources and ask questions using your voice
        </p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner size="md" />
            <span className="text-gray-700 dark:text-gray-300">Processing...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <LinkInput />
          
          {extractedContent.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Extracted Content Summary
              </h3>
              <div className="space-y-3">
                {extractedContent.map((content, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">{content.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {content.word_count} words from {content.url}
                    </p>
                    {!content.success && content.error_message && (
                      <p className="text-sm text-red-600 dark:text-red-400">{content.error_message}</p>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              How to Use Voice-Driven Q&A
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="text-primary-600 dark:text-primary-400 text-2xl font-bold mb-2">1</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add Content Sources</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Provide at least 3 web links (websites, Wikipedia, news articles) 
                  to extract content from.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="text-primary-600 dark:text-primary-400 text-2xl font-bold mb-2">2</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ask Questions</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Use voice recording or type questions about the extracted content. 
                  The AI will analyze and provide answers.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="text-primary-600 dark:text-primary-400 text-2xl font-bold mb-2">3</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Listen & Learn</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get text and audio responses with source citations. 
                  Copy answers or replay audio as needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}