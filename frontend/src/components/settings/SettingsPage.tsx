import { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import {
  PlayIcon,
  Cog6ToothIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../LoadingSpinner';
import { apiService } from '../../services/api';
import { toast } from '../../utils/toast';

export function SettingsPage() {
  const { settings, updateSettings } = useVoice();
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [voices, setVoices] = useState<{ id: string; name: string; preview_url?: string; description?: string }[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      setLoadingVoices(true);
      const response = await apiService.getVoices();
      setVoices(response.voices);
    } catch (error) {
      console.error('Failed to load voices:', error);
      toast.error('Failed to load available voices');
    } finally {
      setLoadingVoices(false);
    }
  };

  const testVoice = async () => {
    if (!settings.selectedVoice) {
      toast.error('Please select a voice first');
      return;
    }

    setIsTestingVoice(true);
    
    // Get voice info
    const selectedVoice = voices.find(v => v.id === settings.selectedVoice);
    const voiceName = selectedVoice?.name?.split(' - ')[0] || 'Unknown';
    
    try {
      console.log('=== VOICE TEST DEBUG ===');
      console.log('Selected voice ID:', settings.selectedVoice);
      console.log('Voice name:', voiceName);
      
      // Use preview URL if available (works exactly like preview button)
      if (selectedVoice?.preview_url) {
        console.log('Using preview URL:', selectedVoice.preview_url);
        
        const audio:any = new Audio();
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Audio load timeout')), 10000);
          
          audio.oncanplaythrough = () => {
            clearTimeout(timeout);
            audio.play().then(resolve).catch(reject);
          };
          
          audio.onended = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          
          audio.onerror = (e:any) => {
            clearTimeout(timeout);
            console.error('Audio error:', e);
            reject(new Error('Failed to load preview audio'));
          };
          
          audio.src = selectedVoice.preview_url;
        });
        
        toast.success(`Voice test completed with ${voiceName} (Preview)`);
      } else {
        // Fallback to generated TTS if no preview URL
        const testText = `Hello! I'm ${voiceName}. This is how I sound for voice responses.`;
        console.log('No preview URL, generating TTS with text:', testText);
        
        const response = await apiService.textToSpeech(testText, settings.selectedVoice);
        
        if (response.audio_url) {
          const audio = new Audio();
          audio.preload = 'none';
          audio.crossOrigin = 'anonymous';
          
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const cacheBustUrl = response.audio_url.includes('?') 
            ? `${response.audio_url}&cb=${timestamp}&r=${random}&v=${settings.selectedVoice}`
            : `${response.audio_url}?cb=${timestamp}&r=${random}&v=${settings.selectedVoice}`;
          
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Audio load timeout')), 10000);
            
            audio.oncanplaythrough = () => {
              clearTimeout(timeout);
              audio.play().then(resolve).catch(reject);
            };
            
            audio.onended = () => {
              clearTimeout(timeout);
              resolve(true);
            };
            
            audio.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Failed to load generated audio'));
            };
            
            audio.src = cacheBustUrl;
            audio.load();
          });
          
          toast.success(`Voice test completed with ${voiceName} (Generated)`);
        } else {
          throw new Error('No audio generated');
        }
      }
    } catch (error: any) {
      console.error('Voice test error:', error);
      toast.error(`Voice test failed: ${error.message || 'Unknown error'}`);
    } finally {
      setTimeout(() => setIsTestingVoice(false), 2000);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Settings are automatically saved via the VoiceContext
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Voice settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[90vh] bg-white dark:bg-black flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"> */}
                <Cog6ToothIcon className="w-4 h-4 text-white" />
              {/* </div> */}
              <h1 className="text-[25px] font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-[14px]">
              Configure your voice preferences and system settings
            </p>
          </div>

          <div className="max-w-4xl">
            {/* Single Settings Card */}
            <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 space-y-8">
                {/* Voice Configuration Section */}
                <div>
                  <div className="flex items-center gap-3">
                    <MicrophoneIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Voice Configuration
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Choose your preferred ElevenLabs voice for AI responses
                  </p>

                {loadingVoices ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="md" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading available voices...</span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Available Voices
                    </label>
                    <div className="space-y-4">
                      <div className="relative">
                        <select
                          value={settings.selectedVoice}
                          onChange={(e) => {
                            updateSettings({ selectedVoice: e.target.value, provider: 'elevenlabs' });
                          }}
                          className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white appearance-none"
                        >
                          <option value="">Select a voice...</option>
                          {voices.map((voice) => (
                            <option key={voice.id} value={voice.id}>
                              {voice.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      {voices.length === 0 && !loadingVoices && (
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                ElevenLabs API not configured
                              </p>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                To use ElevenLabs voices, add your API key to the server's environment configuration:
                              </p>
                              <div className="bg-yellow-100 dark:bg-yellow-800/30 p-3 rounded-md">
                                <code className="text-xs text-yellow-800 dark:text-yellow-200 block">
                                  ELEVENLABS_API_KEY=your_api_key_here<br/>
                                  USE_ELEVENLABS=true
                                </code>
                              </div>
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                Voice testing will fall back to browser TTS until configured.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <button
                          onClick={loadVoices}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          Refresh voices
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                </div>

                {/* Voice Testing Section */}
                {settings.selectedVoice && (
                  <div className="border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <PlayIcon className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Voice Testing
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Test your selected voice to hear how it sounds
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={testVoice}
                        disabled={isTestingVoice}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                      >
                        {isTestingVoice ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Testing Voice...</span>
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4" />
                            <span>Test Voice</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Cog6ToothIcon className="h-4 w-4" />
                            <span>Save Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}