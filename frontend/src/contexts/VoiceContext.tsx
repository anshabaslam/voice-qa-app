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
  stopSpeaking: () => void;
}

const defaultSettings: VoiceSettings = {
  provider: 'elevenlabs',
  selectedVoice: '',
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>(defaultSettings);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

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

  const stopSpeaking = () => {
    console.log('🛑 Stopping current speech...');
    
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      console.log('✅ Stopped current audio');
    }
    
    // Stop browser TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log('✅ Stopped browser TTS');
    }
  };

  const speak = async (text: string): Promise<void> => {
    if (!text.trim()) return;

    // Stop any currently playing speech before starting new one
    stopSpeaking();

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
        setCurrentAudio(audio);
        
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
            setCurrentAudio(null);
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
    stopSpeaking,
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

// Helper function for browser TTS fallback with good female voice selection
async function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const speakWithVoices = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = speechSynthesis.getVoices();
      console.log('🗣️ Available browser voices:', voices.map(v => `${v.name} (${v.lang}) - ${v.localService ? 'Local' : 'Remote'}`));
      
      // Find the best female voice in order of preference
      const preferredFemaleVoices = [
        // High-quality female voices (prioritize local voices)
        'Samantha',           // macOS - excellent quality
        'Victoria',           // macOS - British English
        'Fiona',             // macOS - Scottish English  
        'Karen',             // macOS - Australian English
        'Serena',            // macOS - English
        'Allison',           // macOS - English
        'Susan',             // macOS - English
        'Google UK English Female', // Chrome - British
        'Google US English Female', // Chrome - American
        'Microsoft Zira Desktop',   // Windows - American
        'Microsoft Hazel Desktop',  // Windows - British
        'Microsoft Eva Desktop',    // Windows
        'Alice',             // Generic
        'Emma',              // Generic
        'Aria',              // Generic
        'Jenny',             // Generic
        'Nova',              // Generic
      ];

      // Find the best available female voice
      let selectedVoice = null;
      for (const voiceName of preferredFemaleVoices) {
        selectedVoice = voices.find(voice => 
          voice.name.includes(voiceName) && 
          voice.lang.startsWith('en') // English only
        );
        if (selectedVoice) break;
      }

      // Fallback: find any English female voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('woman') ||
           voice.name.toLowerCase().includes('lady'))
        );
      }

      // Ultimate fallback: any English voice (prefer local)
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        ) || voices.find(voice => voice.lang.startsWith('en'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🎤 Selected browser voice:', selectedVoice.name, `(${selectedVoice.lang})`);
      } else {
        console.warn('⚠️ No suitable female voice found, using default');
      }

      // Configure voice settings for natural speech
      utterance.rate = 0.9;      // Slightly slower for clarity
      utterance.pitch = 1.1;     // Slightly higher pitch for femininity  
      utterance.volume = 0.8;    // Comfortable volume
      
      utterance.onend = () => {
        console.log('✅ Browser TTS finished');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Browser TTS error:', event.error);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };
      
      console.log('🗣️ Speaking with browser TTS...');
      speechSynthesis.speak(utterance);
    };

    // Check if voices are already loaded  
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      speakWithVoices();
    } else {
      // Wait for voices to load
      console.log('⏳ Waiting for browser voices to load...');
      speechSynthesis.addEventListener('voiceschanged', speakWithVoices, { once: true });
      
      // Fallback timeout in case voiceschanged doesn't fire
      setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', speakWithVoices);
        speakWithVoices();
      }, 1000);
    }
  });
}