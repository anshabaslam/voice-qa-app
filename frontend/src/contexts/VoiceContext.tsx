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

    console.log('Speaking with voice:', settings.selectedVoice);

    try {
      // Import API service dynamically to avoid circular dependency
      const { apiService } = await import('../services/api');
      
      // Always use the selected voice for TTS
      const response = await apiService.textToSpeech(text, settings.selectedVoice);
      
      if (response.audio_url) {
        // Play the generated audio from backend with cache busting
        const audio = new Audio();
        
        // Prevent caching
        audio.preload = 'none';
        audio.crossOrigin = 'anonymous';
        
        // Cache bust the URL
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const cacheBustUrl = response.audio_url.includes('?') 
          ? `${response.audio_url}&cb=${timestamp}&r=${random}`
          : `${response.audio_url}?cb=${timestamp}&r=${random}`;
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Audio load timeout')), 10000);
          
          audio.onended = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          audio.oncanplaythrough = () => {
            clearTimeout(timeout);
            audio.play().then(() => {
              // Audio started playing successfully
            }).catch(reject);
          };
          
          audio.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Failed to play audio'));
          };
          
          audio.src = cacheBustUrl;
          audio.load();
        });
      } else {
        // Fallback to browser TTS if no audio URL
        console.warn('No audio URL returned, using browser TTS fallback');
        return speakWithBrowser(text);
      }
    } catch (error) {
      // Fallback to browser TTS if backend fails
      console.warn('Backend TTS failed, falling back to browser TTS:', error);
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