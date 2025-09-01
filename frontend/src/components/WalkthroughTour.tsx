import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';

interface WalkthroughTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function WalkthroughTour({ isOpen, onComplete }: WalkthroughTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRun(true);
    }
  }, [isOpen]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-lg font-semibold mb-2">Welcome to Voice Q&A!</h2>
          <p>Let's take a quick tour to get you started with asking questions about web content using voice and text.</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '[data-tour="add-content-button"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Step 1: Add Content Sources</h3>
          <p>Click this <strong>+ icon</strong> to add web URLs. You need at least 3 URLs to extract content for Q&A.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="content-sources"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Content Sources Panel</h3>
          <p>This panel shows your added URLs and extracted content. Once you add URLs, content will be automatically extracted from them.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="chat-interface"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Step 2: Ask Questions</h3>
          <p>After adding content sources, you can ask questions here. The AI will answer based on the extracted content.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="voice-button"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Voice Recording</h3>
          <p>Click this microphone to ask questions using your voice instead of typing.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="chat-history"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Chat History</h3>
          <p>Your previous conversations are saved here. Click on any chat to view its history and content sources.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="new-chat-button"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">New Chat</h3>
          <p>Click here to start a fresh conversation with new content sources.</p>
        </div>
      ),
      placement: 'bottom',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      disableCloseOnEsc
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3B82F6',
          width: 380,
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        },
        spotlight: {
          borderRadius: '12px',
          border: '2px solid rgba(249, 115, 22, 0.6)',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
        },
        tooltip: {
          backgroundColor: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
          borderRadius: '20px',
          fontSize: '14px',
          padding: '24px 28px',
          boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid var(--tooltip-border, rgba(229, 231, 235, 0.8))',
          color: 'var(--tooltip-text, #111827)',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '8px',
          color: 'var(--tooltip-title, #111827)',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: '1.5',
          color: 'var(--tooltip-content, #4B5563)',
        },
        buttonNext: {
          backgroundColor: '#3B82F6',
          fontSize: '14px',
          fontWeight: '500',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginLeft: '8px',
        },
        buttonBack: {
          backgroundColor: 'transparent',
          color: 'var(--button-secondary, #6B7280)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid var(--button-secondary-border, #D1D5DB)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginRight: '8px',
        },
        buttonSkip: {
          backgroundColor: 'transparent',
          color: 'var(--button-secondary, #6B7280)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid var(--button-secondary-border, #D1D5DB)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
        buttonClose: {
          color: 'var(--button-close, #6B7280)',
          fontSize: '20px',
          fontWeight: '400',
          padding: '4px',
          right: '16px',
          top: '16px',
        },
      }}
    />
  );
}