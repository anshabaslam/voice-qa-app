import {
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  DocumentTextIcon,
  LinkIcon,
  MicrophoneIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAppStore } from '../stores/appStore';
import { toast } from '../utils/toast';
import { ChatInterface } from './ChatInterface';
import { WalkthroughTour } from './WalkthroughTour';


export function VoiceQAPage() {
  const { extractedContent, isLoading, error, urls, addUrl, removeUrl, setExtractedContent, setSessionId, chatHistory, selectChat, createNewChat, deleteChat, currentChatId, initializeDummyData } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [extractingUrls, setExtractingUrls] = useState<Set<string>>(new Set());
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  
  // Initialize dummy data on mount if needed
  useEffect(() => {
    initializeDummyData();
  }, [initializeDummyData]);

  // Check if this is user's first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('voice-qa-tour-completed');
    if (!hasSeenTour) {
      setIsFirstVisit(true);
      // Show tour after a small delay to let the component mount
      setTimeout(() => setShowWalkthrough(true), 1000);
    }
  }, []);

  const handleAddUrl = async () => {
    const url = newUrl.trim();
    if (url && validateUrl(url)) {
      addUrl(url);
      setNewUrl('');
      setShowAddUrl(false);
      
      // Auto-extract content immediately after adding URL
      const allUrls = [...urls, url];
      await handleAutoExtract(allUrls);
      toast.success(`URL added. Extracting content...`);
    } else {
      toast.error('Please enter a valid URL');
    }
  };

  const handleAutoExtract = async (urlsToExtract: string[]) => {
    const validUrls = urlsToExtract.filter(url => url.trim() && validateUrl(url.trim()));
    
    if (validUrls.length < 1) {
      return;
    }

    // Set all URLs as extracting
    validUrls.forEach(url => {
      setExtractingUrls(prev => new Set(prev).add(url));
    });

    try {
      console.log('Auto-extracting content from:', validUrls);
      const result = await apiService.extractContent(validUrls);
      console.log('Extraction result:', result);
      
      if (result.success && result.extracted_content && result.extracted_content.length > 0) {
        setExtractedContent(result.extracted_content);
        
        if (result.session_id) {
          setSessionId(result.session_id);
        }
        
        const successCount = result.extracted_content.filter(c => c.success).length;
        toast.success(`Content extracted from ${successCount}/${validUrls.length} URLs`);
        
        // Show individual errors for failed extractions
        result.extracted_content.filter(c => !c.success).forEach(extraction => {
          if (extraction.error_message) {
            toast.error(`Failed: ${extraction.url} - ${extraction.error_message}`, { duration: 6000 });
          }
        });
      } else {
        toast.error('No content could be extracted from the URLs');
      }
    } catch (error) {
      console.error('Auto-extraction error:', error);
      const message = error instanceof Error ? error.message : 'Failed to extract content';
      toast.error(`Error during extraction: ${message}`);
    } finally {
      // Clear all extracting states
      validUrls.forEach(url => {
        setExtractingUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
      });
    }
  };

  const handleTourComplete = () => {
    setShowWalkthrough(false);
    localStorage.setItem('voice-qa-tour-completed', 'true');
    setIsFirstVisit(false);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };


  return (
    <div className="h-[90vh] bg-white dark:bg-black flex overflow-hidden">

      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-transparent text-gray-900 dark:text-white flex flex-col ${isSidebarOpen ? 'border-r border-gray-200 dark:border-gray-800' : ''}`}
        style={{ 
          minWidth: isSidebarOpen ? '256px' : '0',
          maxWidth: isSidebarOpen ? '256px' : '0'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MicrophoneIcon className="w-5 h-5 text-blue-400" />
            <h1 className="font-semibold">Voice Q&A</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={createNewChat}
              className="flex items-center gap-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              data-tour="new-chat-button"
            >
              <PlusIcon className="w-3 h-3" />
              <span className="text-xs">New</span>
            </button>
            <button 
              onClick={() => setShowWalkthrough(true)}
              className="flex items-center gap-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Show walkthrough tour"
            >
              <span className="text-xs">?</span>
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded lg:hidden"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Content Sources Section */}
        <div className="px-4 pb-4" data-tour="content-sources">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2 mt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                Content Sources
              </h3>
              <button
                onClick={() => setShowAddUrl(!showAddUrl)}
                className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ${
                  isFirstVisit && urls.length === 0 && !showAddUrl
                    ? 'animate-pulse ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-900/20' 
                    : ''
                }`}
                title="Add URL"
                data-tour="add-content-button"
              >
                <PlusIcon className={`w-3 h-3 ${
                  isFirstVisit && urls.length === 0 && !showAddUrl
                    ? 'text-blue-600' 
                    : 'text-gray-400'
                }`} />
              </button>
            </div>

            {/* Add URL Input */}
            {showAddUrl && (
              <div className="mb-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-2 py-1 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded text-xs text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                  />
                  <button
                    onClick={handleAddUrl}
                    disabled={!newUrl.trim()}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
                  >
                    <CheckIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Current URLs */}
            {urls.length > 0 && (
              <div className="mb-3">
                <div className="space-y-1">
                  {urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-dark-800 rounded text-xs">
                      {extractingUrls.has(url) ? (
                        <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      ) : (
                        <LinkIcon className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white truncate">{url}</p>
                        {extractingUrls.has(url) && (
                          <p className="text-blue-400 text-xs">Extracting...</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeUrl(index)}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        disabled={extractingUrls.has(url)}
                      >
                        <TrashIcon className="w-3 h-3 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Content Display */}
            {extractedContent.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Extracted Content:</p>
                {extractedContent.map((content, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${content.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{content.title}</p>
                      <p className="text-gray-600 dark:text-gray-400">{content.word_count} words</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Help Text */}
            {urls.length === 0 && !showAddUrl && (
              <div className="text-xs text-gray-500 dark:text-gray-500 p-3 border border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="mb-2">Add web sources to get started</p>
                <p>Content will be extracted automatically when you add URLs</p>
                <p>1-5 URLs allowed for Q&A</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden px-4" data-tour="chat-history">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Recent Chats
            </h3>
          </div>
          <div className="space-y-1 overflow-y-auto h-full pb-4">
            {chatHistory.length > 0 ? (
              chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => selectChat(chat.id)}
                  className={`group p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors rounded-md ${
                    currentChatId === chat.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Message icon */}
                    <div className="flex-shrink-0 mt-1">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">{chat.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{chat.lastMessage}</p>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                    >
                      <TrashIcon className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-500 p-3 border border-gray-300 dark:border-gray-700 rounded-lg text-center">
                <p className="mb-2">No conversations yet</p>
                <p>Start a new chat to see your conversation history</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        {!isSidebarOpen && (
          <div className="p-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 min-h-0" data-tour="chat-interface">
          <ChatInterface />
        </div>
      </div>

      {/* Walkthrough Tour */}
      <WalkthroughTour 
        isOpen={showWalkthrough}
        onComplete={handleTourComplete}
      />
    </div>
  );
}