"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublishArticleButton({ articleId }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePublish = async () => {
    setIsPublishing(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish article');
      }
      
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsPublishing(false);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        aria-label="Publish article"
      >
        Publish
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full" role="dialog" aria-modal="true" aria-labelledby="publish-dialog-title">
            <h3 id="publish-dialog-title" className="text-lg font-medium text-gray-900">Publish Article</h3>
            
            <p className="mt-3 text-sm text-gray-600">
              This article will be published and visible to the public. Continue?
            </p>
            
            {error && (
              <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mt-5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isPublishing}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isPublishing ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
