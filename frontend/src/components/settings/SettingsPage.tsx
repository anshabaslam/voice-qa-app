import { useState } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import {
  MicrophoneIcon,
  CloudIcon,
  MusicalNoteIcon,
  DocumentArrowUpIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../LoadingSpinner';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { settings, updateSettings, speak } = useVoice();
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const elevenLabsVoices = [
    { id: 'rachel', name: 'Rachel - Calm' },
    { id: 'domi', name: 'Domi - Strong' },
    { id: 'bella', name: 'Bella - Narration' },
    { id: 'antoni', name: 'Antoni - Well-rounded' },
    { id: 'elli', name: 'Elli - Emotional' },
    { id: 'josh', name: 'Josh - Deep' },
    { id: 'arnold', name: 'Arnold - Crisp' },
    { id: 'adam', name: 'Adam - Conversational' },
    { id: 'sam', name: 'Sam - Raspy' },
  ];

  const handleCustomVoiceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const customVoice = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        file,
        url: URL.createObjectURL(file),
      };
      updateSettings({
        customVoices: [...settings.customVoices, customVoice]
      });
      toast.success('Custom voice uploaded successfully');
    }
  };

  const removeCustomVoice = (id: string) => {
    const voice = settings.customVoices.find(v => v.id === id);
    if (voice) {
      URL.revokeObjectURL(voice.url);
    }
    updateSettings({
      customVoices: settings.customVoices.filter(v => v.id !== id)
    });
    toast.success('Custom voice removed');
  };

  const testVoice = async () => {
    setIsTestingVoice(true);
    const testText = "Hello! This is a test of the selected voice. How does it sound?";
    
    try {
      await speak(testText);
      toast.success('Voice test completed');
    } catch (error) {
      toast.error(`Voice test failed: ${error.message}`);
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your preferred voice provider and settings
        </p>
      </div>

      {/* Voice Provider Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Voice Provider
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Browser TTS */}
          <div
            onClick={() => updateSettings({ provider: 'browser' })}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              settings.provider === 'browser'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <MicrophoneIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Browser TTS</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Built-in browser voices</p>
              </div>
            </div>
          </div>

          {/* ElevenLabs */}
          <div
            onClick={() => updateSettings({ provider: 'elevenlabs' })}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              settings.provider === 'elevenlabs'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CloudIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">ElevenLabs</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">High-quality AI voices</p>
              </div>
            </div>
          </div>

          {/* Custom Voices */}
          <div
            onClick={() => updateSettings({ provider: 'custom' })}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              settings.provider === 'custom'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <MusicalNoteIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Custom Voices</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload your own recordings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider-specific Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Voice Configuration
        </h3>

        {settings.provider === 'browser' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Voice
              </label>
              <select
                value={settings.selectedVoice}
                onChange={(e) => updateSettings({ selectedVoice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a voice...</option>
                {speechSynthesis.getVoices().map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {settings.provider === 'elevenlabs' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.elevenLabsApiKey}
                onChange={(e) => updateSettings({ elevenLabsApiKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your ElevenLabs API key"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Get your API key from{' '}
                <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                  ElevenLabs
                </a>
              </p>
            </div>
            
            {settings.elevenLabsApiKey && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Voice
                </label>
                <select
                  value={settings.selectedVoice}
                  onChange={(e) => updateSettings({ selectedVoice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a voice...</option>
                  {elevenLabsVoices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {settings.provider === 'custom' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Custom Voice
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleCustomVoiceUpload}
                  className="hidden"
                  id="voice-upload"
                />
                <label
                  htmlFor="voice-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload audio file
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Supports MP3, WAV, M4A formats
                  </span>
                </label>
              </div>
            </div>

            {settings.customVoices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Custom Voice
                </label>
                <div className="space-y-2">
                  {settings.customVoices.map((voice) => (
                    <div
                      key={voice.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                        settings.selectedVoice === voice.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => updateSettings({ selectedVoice: voice.id })}
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {voice.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomVoice(voice.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Testing */}
      {settings.selectedVoice && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Voice
          </h3>
          <button
            onClick={testVoice}
            disabled={isTestingVoice}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
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
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
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
  );
}