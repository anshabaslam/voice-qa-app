import { createContext, useContext, useState, useEffect } from 'react';

export type VoiceProvider = 'elevenlabs';

interface VoiceSettings {
  provider: VoiceProvider;
  selectedVoice: string;
}

interface VoiceContextType {
  settings: VoiceSettings;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  speak: (text: string) => Promise<void>;
}

const defaultSettings: VoiceSettings = {
  provider: 'elevenlabs',
  selectedVoice: '',
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const storedSettings = localStorage.getItem('voice-qa-settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.warn('Failed to parse stored voice settings');
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage
    localStorage.setItem('voice-qa-settings', JSON.stringify(updatedSettings));
  };

  const speak = async (text: string): Promise<void> => {
    if (!text.trim()) return;

    console.log('🗣️ VoiceContext.speak() called:');
    console.log('  - Text length:', text.length);
    console.log('  - Selected voice:', settings.selectedVoice);
    console.log('  - Voice empty?', !settings.selectedVoice);
    console.log('  - All settings:', settings);
    console.log('  - Text preview:', text.substring(0, 50) + '...');

    try {
      // Import API service dynamically to avoid circular dependency
      const { apiService } = await import('../services/api');
      
      console.log('📡 Calling backend TTS API...');
      
      // Check if selected voice is a valid ElevenLabs voice ID (not OpenAI)
      const isOpenAIVoice = ['nova', 'shimmer', 'alloy', 'echo', 'fable', 'onyx'].includes(settings.selectedVoice);
      const voiceToUse = isOpenAIVoice ? '' : settings.selectedVoice; // Use empty string to get default ElevenLabs voice
      
      console.log('  - Original voice ID:', settings.selectedVoice);
      console.log('  - Is OpenAI voice:', isOpenAIVoice);
      console.log('  - Voice to use:', voiceToUse);
      
      // Always use the selected voice for TTS
      const response = await apiService.textToSpeech(text, voiceToUse);
      console.log('📨 Backend TTS response:', response);
      
      if (response.audio_url) {
        console.log('✅ Got audio URL, playing with ElevenLabs voice');
        // Play the generated audio from backend with cache busting
        const audio = new Audio();
        
        // Prevent caching
        audio.preload = 'none';
        audio.crossOrigin = 'anonymous';
        
        // Convert relative URL to absolute URL for cross-origin access
        const baseUrl = 'http://localhost:8000';
        const fullAudioUrl = response.audio_url.startsWith('http') 
          ? response.audio_url 
          : `${baseUrl}${response.audio_url}`;
        
        // Cache bust the URL
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const cacheBustUrl = fullAudioUrl.includes('?') 
          ? `${fullAudioUrl}&cb=${timestamp}&r=${random}`
          : `${fullAudioUrl}?cb=${timestamp}&r=${random}`;
        
        console.log('  - Full audio URL:', fullAudioUrl);
        console.log('  - Cache-bust URL:', cacheBustUrl);
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Audio load timeout')), 10000);
          
          audio.onended = () => {
            clearTimeout(timeout);
            console.log('✅ ElevenLabs audio finished playing');
            resolve();
          };
          
          audio.oncanplaythrough = () => {
            clearTimeout(timeout);
            console.log('▶️ Playing ElevenLabs audio...');
            audio.play().then(() => {
              // Audio started playing successfully
            }).catch(reject);
          };
          
          audio.onerror = (e) => {
            clearTimeout(timeout);
            console.error('🚨 Audio playback error:', e);
            console.error('  - Audio src:', audio.src);
            console.error('  - Audio readyState:', audio.readyState);
            console.error('  - Audio networkState:', audio.networkState);
            reject(new Error(`Failed to play audio: ${e.type}`));
          };
          
          audio.src = cacheBustUrl;
          audio.load();
        });
      } else {
        // Fallback to browser TTS if no audio URL
        console.warn('⚠️ No audio URL returned, using browser TTS fallback');
        return speakWithBrowser(text);
      }
    } catch (error) {
      // Fallback to browser TTS if backend fails
      console.error('❌ Backend TTS failed, falling back to browser TTS:', error);
      return speakWithBrowser(text);
    }
  };

  const value = {
    settings,
    updateSettings,
    speak,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

// Helper function for browser TTS fallback
async function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));
    
    speechSynthesis.speak(utterance);
  });
}