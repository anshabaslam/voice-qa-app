import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { apiService } from '../services/api';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const useVoiceRecording = () => {
  const [isSupported] = useState(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  
  const { voiceState, setVoiceState, setCurrentQuestion } = useAppStore();
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      console.warn('Speech recognition not supported');
      return;
    }
    
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up MediaRecorder for fallback audio upload
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      // Set up Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setVoiceState({ isRecording: true, isProcessing: false });
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
            isFinal = true;
          } else {
            transcript += result[0].transcript;
          }
        }
        
        setVoiceState({ transcript });
        
        if (isFinal) {
          setCurrentQuestion(transcript.trim());
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceState({ isRecording: false, isProcessing: false });
        
        // Fallback to audio upload if speech recognition fails
        if (mediaRecorderRef.current && audioChunksRef.current.length > 0) {
          handleAudioUpload();
        }
      };
      
      recognitionRef.current.onend = () => {
        setVoiceState({ isRecording: false });
      };
      
      // Start both recording methods
      recognitionRef.current.start();
      mediaRecorderRef.current.start();
      
      // Simulate audio level for visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value) / dataArray.length;
        setVoiceState({ audioLevel: average / 255 });
        
        if (voiceState.isRecording) {
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setVoiceState({ isRecording: false, isProcessing: false });
    }
  }, [isSupported, setVoiceState, setCurrentQuestion, voiceState.isRecording]);
  
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setVoiceState({ isRecording: false, audioLevel: 0 });
  }, [setVoiceState]);
  
  const handleAudioUpload = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setVoiceState({ isProcessing: true });
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const result = await apiService.uploadAudio(audioBlob);
      setCurrentQuestion(result.question);
    } catch (error) {
      console.error('Audio upload failed:', error);
    } finally {
      setVoiceState({ isProcessing: false });
      audioChunksRef.current = [];
    }
  }, [setVoiceState, setCurrentQuestion]);
  
  return {
    isSupported,
    isRecording: voiceState.isRecording,
    isProcessing: voiceState.isProcessing,
    audioLevel: voiceState.audioLevel,
    transcript: voiceState.transcript,
    startRecording,
    stopRecording,
  };
};