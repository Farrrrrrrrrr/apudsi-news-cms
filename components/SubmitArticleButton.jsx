"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitArticleButton({ articleId, currentStatus }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Only show the button if article is in draft state
  if (currentStatus !== 'draft') {
    return null;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${articleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit article');
      }
      
      // Close modal and refresh page to show new status
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-[#191970] text-white rounded-md hover:bg-[#191970]/90"
        aria-label="Submit article for review"
      >
        Submit for Review
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4" role="dialog" aria-labelledby="submit-dialog-title">
            <h3 id="submit-dialog-title" className="text-lg font-medium">Submit Article for Review</h3>
            
            <p className="text-sm text-gray-600">
              Once submitted, your article will be reviewed by an editor. You can't edit the article while it's under review.
            </p>
            
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md" role="alert">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#191970] hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
