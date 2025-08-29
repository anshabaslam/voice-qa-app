import React, { useState } from 'react';
import { SpeakerWaveIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import { useAppStore } from '../stores/appStore';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const AnswerDisplay: React.FC = () => {
  const { currentQuestion, currentAnswer, sessionId, isLoading, setLoading, setCurrentAnswer, setError } = useAppStore();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  // const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!sessionId) {
      toast.error('Please extract content from URLs first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.askQuestion({
        question: currentQuestion,
        session_id: sessionId,
      });

      setCurrentAnswer(result);
      toast.success('Answer generated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get answer';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    if (!currentAnswer?.answer) return;

    setIsPlayingAudio(true);

    try {
      // Try to generate TTS
      const result = await apiService.textToSpeech(currentAnswer.answer);
      
      if (result.audio_url) {
        // Server-generated audio
        const audio = new Audio(result.audio_url);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
          setIsPlayingAudio(false);
          // Fallback to browser TTS
          useBrowserTTS();
        };
        await audio.play();
      } else {
        // Use browser TTS
        useBrowserTTS();
      }
    } catch (error) {
      console.error('TTS failed, using browser fallback:', error);
      useBrowserTTS();
    }
  };

  const useBrowserTTS = () => {
    if (!currentAnswer?.answer) return;

    const utterance = new SpeechSynthesisUtterance(currentAnswer.answer);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      toast.error('Text-to-speech failed');
    };
    
    speechSynthesis.speak(utterance);
  };

  const copyToClipboard = async () => {
    if (!currentAnswer?.answer) return;

    try {
      await navigator.clipboard.writeText(currentAnswer.answer);
      toast.success('Answer copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Input */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <ChatBubbleLeftIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Ask a Question</h2>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={currentQuestion}
            onChange={(e) => useAppStore.getState().setCurrentQuestion(e.target.value)}
            placeholder="Enter your question here or use voice recording..."
            className="input-field min-h-[100px] resize-none"
            rows={4}
          />
          
          <button
            onClick={handleAskQuestion}
            disabled={isLoading || !currentQuestion.trim() || !sessionId}
            className={clsx(
              'btn-primary w-full',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? 'Generating Answer...' : 'Get Answer'}
          </button>
        </div>
      </div>

      {/* Answer Display */}
      {currentAnswer && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Answer</h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleTextToSpeech}
                disabled={isPlayingAudio}
                className={clsx(
                  'btn-secondary p-2',
                  isPlayingAudio && 'opacity-50 cursor-not-allowed'
                )}
                title="Listen to answer"
              >
                <SpeakerWaveIcon className={clsx('h-4 w-4', isPlayingAudio && 'animate-pulse')} />
              </button>
              
              <button
                onClick={copyToClipboard}
                className="btn-secondary p-2"
                title="Copy answer"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {currentAnswer.answer}
            </p>
          </div>
          
          {currentAnswer.sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sources:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {currentAnswer.sources.map((source, index) => (
                  <li key={index}>
                    <a 
                      href={source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {currentAnswer.confidence && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Confidence:</span>
                <span>{Math.round(currentAnswer.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentAnswer.confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};