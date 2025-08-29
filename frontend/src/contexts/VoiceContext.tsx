import { createContext, useContext, useState, useEffect } from 'react';

export type VoiceProvider = 'browser' | 'elevenlabs' | 'custom';

interface VoiceSettings {
  provider: VoiceProvider;
  selectedVoice: string;
  elevenLabsApiKey: string;
  customVoices: Array<{
    id: string;
    name: string;
    file: File;
    url: string;
  }>;
}

interface VoiceContextType {
  settings: VoiceSettings;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  speak: (text: string) => Promise<void>;
}

const defaultSettings: VoiceSettings = {
  provider: 'browser',
  selectedVoice: '',
  elevenLabsApiKey: '',
  customVoices: [],
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
    
    // Save to localStorage (excluding File objects)
    const settingsToStore = {
      ...updatedSettings,
      customVoices: updatedSettings.customVoices.map(voice => ({
        id: voice.id,
        name: voice.name,
        // File objects can't be serialized, we'll handle them separately
      }))
    };
    localStorage.setItem('voice-qa-settings', JSON.stringify(settingsToStore));
  };

  const speak = async (text: string): Promise<void> => {
    if (!text.trim()) return;

    switch (settings.provider) {
      case 'browser':
        return speakWithBrowser(text, settings.selectedVoice);
      
      case 'elevenlabs':
        if (!settings.elevenLabsApiKey) {
          throw new Error('ElevenLabs API key not configured');
        }
        return speakWithElevenLabs(text, settings.selectedVoice, settings.elevenLabsApiKey);
      
      case 'custom':
        const customVoice = settings.customVoices.find(v => v.id === settings.selectedVoice);
        if (!customVoice) {
          throw new Error('Custom voice not found');
        }
        return speakWithCustomVoice(text, customVoice);
      
      default:
        throw new Error('Invalid voice provider');
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

// Helper functions
async function speakWithBrowser(text: string, voiceName?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceName) {
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === voiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));
    
    speechSynthesis.speak(utterance);
  });
}

async function speakWithElevenLabs(text: string, voiceId: string, apiKey: string): Promise<void> {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Failed to play ElevenLabs audio'));
      };
      audio.play().catch(reject);
    });
  } catch (error) {
    throw new Error(`ElevenLabs TTS failed: ${error.message}`);
  }
}

async function speakWithCustomVoice(text: string, customVoice: any): Promise<void> {
  // For custom voices, we just play the uploaded audio file
  // In a real implementation, you might use a TTS service that can clone voices
  const audio = new Audio(customVoice.url);
  
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Failed to play custom voice'));
    audio.play().catch(reject);
  });
}