"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApproveArticleButton({ articleId }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleApprove = async () => {
    setIsApproving(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${articleId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve article');
      }
      
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsApproving(false);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        aria-label="Approve article"
      >
        Approve
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full" role="dialog" aria-modal="true" aria-labelledby="approve-dialog-title">
            <h3 id="approve-dialog-title" className="text-lg font-medium text-gray-900">Approve Article</h3>
            
            <p className="mt-3 text-sm text-gray-600">
              By approving this article, it will be sent to publishers for final review and publishing.
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
                disabled={isApproving}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
