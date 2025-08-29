import React, { useState } from 'react';
import { PlusIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../stores/appStore';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const LinkInput: React.FC = () => {
  const { urls, addUrl, removeUrl, setExtractedContent, setLoading, setError, setSessionId } = useAppStore();
  const [newUrl, setNewUrl] = useState('');

  const handleAddUrl = () => {
    if (newUrl.trim()) {
      addUrl(newUrl.trim());
      setNewUrl('');
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    useAppStore.setState({ urls: newUrls });
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleExtractContent = async () => {
    const validUrls = urls.filter(url => url.trim() && validateUrl(url.trim()));
    
    if (validUrls.length < 3) {
      toast.error('Please provide at least 3 valid URLs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.extractContent(validUrls);
      
      if (!result.success) {
        throw new Error('Failed to extract content from URLs');
      }

      setExtractedContent(result.extracted_content);
      if (result.session_id) {
        setSessionId(result.session_id);
      }
      
      toast.success(`Successfully extracted content from ${result.extracted_content.length} URLs`);
      
      if (result.failed_urls.length > 0) {
        toast.error(`Failed to extract from ${result.failed_urls.length} URLs`);
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to extract content';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <LinkIcon className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Content Sources</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Add at least 3 web links to extract content for Q&A (websites, Wikipedia, news articles, etc.)
      </p>

      <div className="space-y-3 mb-4">
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              placeholder={`URL ${index + 1} (e.g., https://example.com)`}
              className="input-field"
            />
            {urls.length > 3 && (
              <button
                onClick={() => removeUrl(index)}
                className="btn-secondary p-2"
                title="Remove URL"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Add another URL..."
          className="input-field flex-1"
          onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
        />
        <button
          onClick={handleAddUrl}
          disabled={!newUrl.trim() || urls.length >= 10}
          className="btn-secondary p-2"
          title="Add URL"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={handleExtractContent}
        disabled={urls.filter(url => url.trim()).length < 3}
        className="btn-primary w-full"
      >
        Extract Content
      </button>
      
      {urls.filter(url => url.trim()).length < 3 && (
        <p className="text-sm text-gray-500 mt-2">
          Need at least 3 URLs to proceed
        </p>
      )}
    </div>
  );
};