"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArticleWorkflowActions({ article, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(null);
  const router = useRouter();

  // Check permissions based on user role and article status
  const canSubmit = (article.author_id === user.id || user.role === 'superuser') 
                  && (article.workflow_status === 'draft' || article.workflow_status === 'rejected');
                  
  const canReview = (user.role === 'editor' || user.role === 'superuser') 
                  && article.workflow_status === 'in_review';
                  
  const canPublish = (user.role === 'publisher' || user.role === 'superuser') 
                    && article.workflow_status === 'approved';

  // Handle submit to review
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/articles/${article.id}/submit`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit article');
      }
      
      // Refresh the page to show updated status
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show review feedback modal
  const showReviewModal = (action) => {
    setReviewAction(action);
    setShowFeedbackModal(true);
  };

  // Handle review submission
  const handleReview = async () => {
    if (!reviewAction) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/articles/${article.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: reviewAction,
          feedback,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to review article');
      }
      
      // Close modal and refresh the page
      setShowFeedbackModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle publishing
  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/articles/${article.id}/publish`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish article');
      }
      
      // Refresh the page to show updated status
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get workflow status badge class
  const getStatusClass = () => {
    switch (article.workflow_status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div>
          <span className="font-medium text-gray-700 mr-2">Workflow Status:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass()}`}>
            {article.workflow_status.replace('_', ' ')}
          </span>
          
          {article.review_feedback && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700">Feedback:</span>
              <p className="text-sm text-gray-600 mt-1 p-2 bg-white border border-gray-200 rounded">{article.review_feedback}</p>
            </div>
          )}
        </div>
        
        <div className="space-x-3">
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          
          {canReview && (
            <>
              <button
                onClick={() => showReviewModal('reject')}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {loading ? 'Processing...' : 'Request Changes'}
              </button>
              
              <button
                onClick={() => showReviewModal('approve')}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {loading ? 'Processing...' : 'Approve'}
              </button>
            </>
          )}
          
          {canPublish && (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Publishing...' : 'Publish Now'}
            </button>
          )}
        </div>
      </div>
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {reviewAction === 'approve' ? 'Approve Article' : 'Request Changes'}
            </h3>
            
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                {reviewAction === 'approve' ? 'Comments (Optional)' : 'Feedback for Author'}
              </label>
              <textarea
                id="feedback"
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#191970] focus:border-[#191970]"
                placeholder={reviewAction === 'approve' ? 'Add any comments for the publishing team...' : 'Explain what changes are needed...'}
                required={reviewAction === 'reject'}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={loading || (reviewAction === 'reject' && !feedback)}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  reviewAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {loading ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Send Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
