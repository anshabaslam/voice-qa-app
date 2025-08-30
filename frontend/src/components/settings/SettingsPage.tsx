import { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import {
  PlayIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../LoadingSpinner';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

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
        
        const audio = new Audio();
        
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
          
          audio.onerror = (e) => {
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
            
            audio.onerror = (e) => {
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
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your ElevenLabs voice preferences
          </p>
        </div>

        {/* ElevenLabs Voice Selection */}
        <div className="bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select ElevenLabs Voice
          </h3>

        {loadingVoices ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading voices...</span>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Voices
            </label>
            <div className="space-y-3">
              <select
                value={settings.selectedVoice}
                onChange={(e) => {
                  updateSettings({ selectedVoice: e.target.value, provider: 'elevenlabs' });
                }}
                className="input-field"
              >
                <option value="">Select a voice...</option>
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
              
              {/* Voice Description */}
              {settings.selectedVoice && voices.find(v => v.id === settings.selectedVoice) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {voices.find(v => v.id === settings.selectedVoice)?.name}
                      </p>
                      {voices.find(v => v.id === settings.selectedVoice)?.description && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {voices.find(v => v.id === settings.selectedVoice)?.description}
                        </p>
                      )}
                    </div>
                    {/* Preview Button */}
                    {voices.find(v => v.id === settings.selectedVoice)?.preview_url && (
                      <button
                        onClick={() => {
                          const previewUrl = voices.find(v => v.id === settings.selectedVoice)?.preview_url;
                          if (previewUrl) {
                            const audio = new Audio(previewUrl);
                            audio.play().catch(e => console.error('Preview failed:', e));
                          }
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        🎵 Preview
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {voices.length === 0 && !loadingVoices && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-2">
                  ElevenLabs API not configured
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  To use ElevenLabs voices, add your API key to the server's <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code> file:
                </p>
                <code className="block text-xs bg-yellow-100 dark:bg-yellow-800 p-2 rounded mt-2 text-yellow-800 dark:text-yellow-200">
                  ELEVENLABS_API_KEY=your_api_key_here<br/>
                  USE_ELEVENLABS=true
                </code>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Voice testing will fall back to browser TTS until configured.
                </p>
              </div>
            )}
            
            <button
              onClick={loadVoices}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Refresh voices
            </button>
          </div>
        )}
        </div>

        {/* Voice Testing */}
        {settings.selectedVoice && (
          <div className="bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Voice
            </h3>
            <button
              onClick={testVoice}
              disabled={isTestingVoice}
              className="btn-primary"
            >
              {isTestingVoice ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  <span>Test Voice</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Save Settings */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="btn-primary"
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
    </div>
  );
}