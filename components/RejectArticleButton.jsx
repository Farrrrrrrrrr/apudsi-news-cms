"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RejectArticleButton({ articleId }) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setIsRejecting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${articleId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject article');
      }
      
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsRejecting(false);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        aria-label="Reject article"
      >
        Request Changes
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full" role="dialog" aria-modal="true" aria-labelledby="reject-dialog-title">
            <h3 id="reject-dialog-title" className="text-lg font-medium text-gray-900">Request Changes</h3>
            
            <div className="mt-3">
              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                Reason for changes
              </label>
              <div className="mt-1">
                <textarea
                  id="rejection-reason"
                  name="reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Please explain what changes are needed..."
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This feedback will be sent to the author.
              </p>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mt-5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isRejecting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isRejecting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isRejecting ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
