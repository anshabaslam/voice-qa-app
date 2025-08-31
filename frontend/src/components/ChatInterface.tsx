import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, PhotoIcon, SpeakerWaveIcon, ClipboardDocumentIcon, HandThumbUpIcon, HandThumbDownIcon, ArrowPathIcon, StopIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../stores/appStore';
import { useVoice } from '../contexts/VoiceContext';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { apiService } from '../services/api';
import { toast } from '../utils/toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [shakeMessageId, setShakeMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentAnswer, currentQuestion, voiceState, sessionId, extractedContent, setCurrentAnswer, setLoading, setError } = useAppStore();
  const { speak, settings } = useVoice();
  const { isSupported, isRecording, isProcessing, audioLevel, transcript, startRecording, stopRecording } = useVoiceRecording();
  const voiceIsProcessing = voiceState.isProcessing;
  const hasContentSources = extractedContent.length >= 3;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processQuestion = async (question: string) => {
    if (!question.trim()) return;

    setIsTyping(true);
    setLoading(true);
    setError(null);

    try {
      // Check if content sources are available
      if (!hasContentSources) {
        // Create a mock response asking to add content sources with unique timestamp
        const mockResponse = {
          answer: "Please add at least 3 content sources from the sidebar to get accurate answers. I need web content to provide you with relevant information.",
          sources: [],
          session_id: sessionId || 'no-session',
          confidence: 0,
          timestamp: Date.now() // Add unique timestamp to force new message creation
        };
        setCurrentAnswer(mockResponse);
        return;
      }

      // Only proceed with real API call if content sources exist
      if (!sessionId) {
        toast.error('Please extract content from URLs first');
        return;
      }

      const result = await apiService.askQuestion({
        question: question.trim(),
        session_id: sessionId,
      });

      setCurrentAnswer(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get answer';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Add user question when transcript updates and automatically process it
  useEffect(() => {
    if (currentQuestion && currentQuestion.trim()) {
      const questionExists = messages.some(msg => msg.content === currentQuestion && msg.isUser);
      if (!questionExists) {
        const newMessage: Message = {
          id: Date.now().toString() + '-q',
          content: currentQuestion,
          isUser: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Automatically process the question from voice recording
        processQuestion(currentQuestion);
      }
    }
  }, [currentQuestion]);

  // Add AI response when answer updates
  useEffect(() => {
    if (currentAnswer && currentAnswer.answer && currentAnswer.answer.trim()) {
      // Always create new message with unique timestamp
      const newMessage: Message = {
        id: Date.now().toString() + '-a-' + Math.random().toString(36).substring(7),
        content: currentAnswer.answer,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  }, [currentAnswer]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const question = inputValue.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      content: question,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Process the question to get AI response
    processQuestion(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePlayMessage = async (messageId: string, content: string) => {
    if (playingMessageId === messageId) {
      // Already playing this message, don't play again
      return;
    }

    setPlayingMessageId(messageId);
    
    try {
      console.log('ChatInterface: Using voice:', settings.selectedVoice);
      await speak(content);
      toast.success(`Message read aloud${settings.selectedVoice ? ' with selected voice' : ''}`);
    } catch (error) {
      console.error('TTS failed:', error);
      toast.error('Text-to-speech failed');
    } finally {
      setPlayingMessageId(null);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (isSupported) {
        startRecording();
      } else {
        toast.error('Voice recording is not supported in your browser');
      }
    }
  };

  // Use transcript as input when voice recording finishes
  useEffect(() => {
    if (transcript && !isRecording) {
      setInputValue(transcript);
    }
  }, [transcript, isRecording]);

  const handleLike = (messageId: string) => {
    const currentFeedback = messageFeedback[messageId];
    const newFeedback = currentFeedback === 'like' ? null : 'like';
    setMessageFeedback(prev => ({ ...prev, [messageId]: newFeedback }));
    
    // Add shake animation
    setShakeMessageId(messageId);
    setTimeout(() => setShakeMessageId(null), 500);
  };

  const handleDislike = (messageId: string) => {
    const currentFeedback = messageFeedback[messageId];
    const newFeedback = currentFeedback === 'dislike' ? null : 'dislike';
    setMessageFeedback(prev => ({ ...prev, [messageId]: newFeedback }));
    
    // Add shake animation
    setShakeMessageId(messageId);
    setTimeout(() => setShakeMessageId(null), 500);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
      {/* No header for ChatGPT-like design */}

      {/* Messages Area - ChatGPT Style */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <MicrophoneIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Start a conversation</p>
              <p className="text-xs mt-1">Ask questions using voice or text</p>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="px-6 py-4 space-y-6">
            {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar - only show for AI */}
              {!message.isUser && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9H21ZM12 15C10.9 15 10 15.9 10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17C14 15.9 13.1 15 12 15ZM12 21C10.9 21 10 21.9 10 23H14C14 21.9 13.1 21 12 21Z"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Message Card */}
              <div className={`group max-w-2xl ${
                message.isUser 
                  ? 'ml-12' 
                  : 'mr-12'
              }`}>
                <div className={`rounded-2xl px-4 py-3 shadow-sm relative ${
                  message.isUser
                    ? 'bg-blue-600 text-white ml-auto'
                    : !hasContentSources
                      ? 'bg-transparent text-white border border-orange-400/70'
                      : 'bg-transparent text-white border border-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm mb-2">{message.content}</p>
                  
                  {/* Warning for AI responses without content sources */}
                  {!message.isUser && !hasContentSources && (
                    <div className="mb-4 pb-2 border-b border-orange-200 dark:border-orange-800">
                      <div className="text-xs text-orange-400 font-medium">
                        ⚠️ Add at least 3 content sources for more accurate answers
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons for AI Messages - Inside Card */}
                  {!message.isUser && (
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Copy message"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePlayMessage(message.id, message.content)}
                          disabled={playingMessageId === message.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                          title="Play message audio"
                        >
                          <SpeakerWaveIcon className={`w-4 h-4 ${playingMessageId === message.id ? 'animate-pulse text-blue-400' : ''}`} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Save message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDislike(message.id)}
                          className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-800 ${
                            shakeMessageId === message.id && messageFeedback[message.id] === 'dislike' ? 'animate-bounce' : ''
                          }`}
                          title="Bad response"
                        >
                          <HandThumbDownIcon className={`w-4 h-4 transition-colors ${
                            messageFeedback[message.id] === 'dislike' 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-400'
                          }`} />
                        </button>
                        <button
                          onClick={() => handleLike(message.id)}
                          className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-800 ${
                            shakeMessageId === message.id && messageFeedback[message.id] === 'like' ? 'animate-bounce' : ''
                          }`}
                          title="Good response"
                        >
                          <HandThumbUpIcon className={`w-4 h-4 transition-colors ${
                            messageFeedback[message.id] === 'like' 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-400'
                          }`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* User avatar after message */}
                {message.isUser && (
                  <div className="flex justify-end mt-2">
                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xs">
                      AE
                    </div>
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>
        )}

        {(isTyping || voiceIsProcessing) && (
          <div className="px-6 py-4">
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9H21ZM12 15C10.9 15 10 15.9 10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17C14 15.9 13.1 15 12 15ZM12 21C10.9 21 10 21.9 10 23H14C14 21.9 13.1 21 12 21Z"/>
                  </svg>
                </div>
              </div>
              
              <div className="max-w-2xl mr-12">
                <div className={`rounded-2xl px-6 py-4 shadow-sm ${
                  !hasContentSources
                    ? 'bg-white dark:bg-dark-800 border-l-4 border-orange-500 text-gray-900 dark:text-white'
                    : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-dark-700'
                }`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Dashboard Style */}
      <div className="border-t border-gray-300 dark:border-dark-700 bg-gray-50 dark:bg-black">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <div className="flex flex-col gap-2">
              {/* Recording Status */}
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 dark:text-red-300 text-sm font-medium">Recording...</span>
                  {transcript && (
                    <span className="text-red-600 dark:text-red-400 text-sm italic">\"...{transcript.slice(-30)}\"</span>
                  )}
                </div>
              )}
              
              <div className="flex items-end gap-3 bg-gray-200 dark:bg-gray-800 rounded-3xl p-3">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRecording ? "Listening..." : "Message Voice Q&A..."}
                  className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-relaxed"
                  rows={1}
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                  readOnly={isRecording}
                />
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                
                {/* Voice Recording Button with Animation */}
                <button 
                  onClick={handleVoiceToggle}
                  disabled={isProcessing}
                  className={`p-1.5 rounded-lg transition-colors relative ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isRecording ? 'Stop recording' : 'Start voice recording'}
                >
                  {isRecording ? (
                    <div className="relative">
                      <StopIcon className="w-4 h-4" />
                      {/* Recording animation rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75"></div>
                      <div className="absolute inset-0 rounded-full border border-white animate-pulse opacity-50"></div>
                    </div>
                  ) : (
                    <MicrophoneIcon className="w-4 h-4" />
                  )}
                  
                  {/* Audio level visualization */}
                  {isRecording && audioLevel > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </button>
                
                {/* Always show send button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  title="Send message"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}