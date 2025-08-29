import React from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import clsx from 'clsx';

export const VoiceRecorder: React.FC = () => {
  const {
    isSupported,
    isRecording,
    isProcessing,
    audioLevel,
    transcript,
    startRecording,
    stopRecording,
  } = useVoiceRecording();

  if (!isSupported) {
    return (
      <div className="card p-6">
        <div className="text-center text-gray-500">
          <MicrophoneIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Voice recording not supported in this browser</p>
          <p className="text-sm">Please use Chrome, Edge, or Safari</p>
        </div>
      </div>
    );
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Generate audio visualization bars
  const generateBars = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const height = isRecording 
        ? Math.max(8, audioLevel * 40 + Math.random() * 20)
        : 8;
      
      bars.push(
        <div
          key={i}
          className={clsx(
            'voice-bar transition-all duration-100',
            isRecording ? 'bg-voice-recording animate-wave' : 'bg-voice-idle'
          )}
          style={{
            height: `${height}px`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="card p-6">
      <div className="text-center">
        <div className="mb-4">
          <button
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className={clsx(
              'relative p-6 rounded-full transition-all duration-200 shadow-lg',
              isRecording
                ? 'bg-voice-recording text-white hover:bg-red-600 animate-pulse'
                : 'bg-primary-600 text-white hover:bg-primary-700',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isRecording ? (
              <StopIcon className="h-8 w-8" />
            ) : (
              <MicrophoneIcon className="h-8 w-8" />
            )}
          </button>
        </div>

        <div className="voice-visualizer mb-4">
          {generateBars()}
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isProcessing
              ? 'Processing...'
              : isRecording
              ? 'Listening...'
              : 'Click to ask a question'}
          </p>
          
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-3 text-left">
              <p className="text-sm text-gray-600 mb-1">Transcript:</p>
              <p className="text-gray-900">{transcript}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            {isRecording
              ? 'Speak clearly and click stop when done'
              : 'Make sure you have extracted content first'}
          </p>
        </div>
      </div>
    </div>
  );
};