import { create } from 'zustand';
import type { AppState, ExtractedContent, AnswerResponse, VoiceState } from '../types';

interface AppStore extends AppState {
  // URL management
  addUrl: (url: string) => void;
  removeUrl: (index: number) => void;
  clearUrls: () => void;
  
  // Content management
  setExtractedContent: (content: ExtractedContent[]) => void;
  
  // Question/Answer management
  setCurrentQuestion: (question: string) => void;
  setCurrentAnswer: (answer: AnswerResponse | null) => void;
  
  // Session management
  setSessionId: (sessionId: string) => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Voice state management
  setVoiceState: (voiceState: Partial<VoiceState>) => void;
  
  // Reset state
  reset: () => void;
}

const initialState: AppState = {
  urls: [], // Start with no URLs
  extractedContent: [],
  currentQuestion: '',
  currentAnswer: null,
  sessionId: null,
  isLoading: false,
  error: null,
  voiceState: {
    isRecording: false,
    isProcessing: false,
    audioLevel: 0,
    transcript: '',
  },
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  
  addUrl: (url: string) => {
    const { urls } = get();
    if (urls.length < 10) { // Max 10 URLs
      set({ urls: [...urls, url] });
    }
  },
  
  removeUrl: (index: number) => {
    const { urls } = get();
    set({ urls: urls.filter((_, i) => i !== index) });
  },
  
  clearUrls: () => {
    set({ urls: [] });
  },
  
  setExtractedContent: (content: ExtractedContent[]) => {
    set({ extractedContent: content });
  },
  
  setCurrentQuestion: (question: string) => {
    set({ currentQuestion: question });
  },
  
  setCurrentAnswer: (answer: AnswerResponse | null) => {
    set({ currentAnswer: answer });
  },
  
  setSessionId: (sessionId: string) => {
    set({ sessionId });
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setVoiceState: (voiceStateUpdate: Partial<VoiceState>) => {
    const { voiceState } = get();
    set({ voiceState: { ...voiceState, ...voiceStateUpdate } });
  },
  
  reset: () => {
    set(initialState);
  },
}));