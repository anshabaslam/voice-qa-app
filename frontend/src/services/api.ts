import axios from 'axios';
import type { ExtractionResponse, QuestionInput, AnswerResponse, TTSResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - server may be unavailable');
    }
    
    if (error.response?.status === 500) {
      throw new Error(error.response?.data?.detail || 'Server error occurred');
    }
    
    if (error.response?.status === 422) {
      throw new Error('Invalid input data');
    }
    
    if (!error.response) {
      throw new Error('Network error - check your connection');
    }
    
    throw new Error(error.response?.data?.detail || 'An unexpected error occurred');
  }
);

export const apiService = {
  // Extract content from URLs
  extractContent: async (urls: string[]): Promise<ExtractionResponse> => {
    const response = await api.post('/links', { urls });
    return response.data;
  },

  // Ask a question
  askQuestion: async (questionInput: QuestionInput): Promise<AnswerResponse> => {
    const response = await api.post('/ask', questionInput);
    return response.data;
  },

  // Convert text to speech
  textToSpeech: async (text: string, voiceId?: string): Promise<TTSResponse> => {
    const response = await api.post('/tts', { text, voice_id: voiceId });
    return response.data;
  },

  // Upload audio file for transcription
  uploadAudio: async (audioBlob: Blob): Promise<{ question: string }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    const response = await api.post('/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get available voices
  getVoices: async (): Promise<{ voices: { id: string; name: string }[] }> => {
    const response = await api.get('/voices');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; version: string; services: any }> => {
    const response = await api.get('/health');
    return response.data;
  },
};