"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkflowControls({ article, userRole }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [actionError, setActionError] = useState('');
  
  // Workflow action buttons based on user role and article status
  const handleWorkflowAction = async (action) => {
    setIsSubmitting(true);
    setActionError('');
    
    try {
      let endpoint, method, body = {};
      
      switch (action) {
        case 'submit':
          endpoint = `/api/articles/${article.id}/submit`;
          method = 'POST';
          break;
          
        case 'approve':
        case 'reject':
          endpoint = `/api/articles/${article.id}/review`;
          method = 'POST';
          body = { 
            decision: action,
            feedback: action === 'reject' ? feedback : undefined
          };
          break;
          
        case 'publish':
          endpoint = `/api/articles/${article.id}/publish`;
          method = 'POST';
          break;
          
        default:
          throw new Error('Invalid action');
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      // Success - refresh the page
      router.refresh();
      
      // Close the feedback form if it was open
      setShowFeedbackForm(false);
      
    } catch (error) {
      console.error('Workflow action error:', error);
      setActionError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // For submit button (writer role)
  const showSubmitButton = 
    userRole === 'writer' || 
    userRole === 'superuser' &&
    (article.workflow_status === 'draft' || article.workflow_status === 'rejected');
  
  // For review buttons (editor role)
  const showReviewButtons = 
    (userRole === 'editor' || userRole === 'superuser') &&
    article.workflow_status === 'in_review';
  
  // For publish button (publisher role)
  const showPublishButton = 
    (userRole === 'publisher' || userRole === 'superuser') &&
    article.workflow_status === 'approved' &&
    article.status !== 'published';
  
  // If no actions should be shown for this user/article combination
  if (!showSubmitButton && !showReviewButtons && !showPublishButton) {
    return null;
  }
  
  return (
    <div className="mt-8">
      {actionError && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
          {actionError}
        </div>
      )}
      
      <div className="flex flex-wrap gap-3">
        {/* Submit button for writers */}
        {showSubmitButton && (
          <button
            onClick={() => handleWorkflowAction('submit')}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Submit article for review"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        )}
        
        {/* Review buttons for editors */}
        {showReviewButtons && (
          <>
            <button
              onClick={() => handleWorkflowAction('approve')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              aria-label="Approve article"
            >
              {isSubmitting ? 'Processing...' : 'Approve'}
            </button>
            
            <button
              onClick={() => setShowFeedbackForm(true)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              aria-label="Reject article"
            >
              Needs Revision
            </button>
          </>
        )}
        
        {/* Publish button for publishers */}
        {showPublishButton && (
          <button
            onClick={() => handleWorkflowAction('publish')}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            aria-label="Publish article"
          >
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </button>
        )}
      </div>
      
      {/* Feedback form for rejections */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Provide Feedback</h3>
            
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Explain what needs improvement:
              </label>
              <textarea
                id="feedback"
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#191970] focus:border-[#191970]"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowFeedbackForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleWorkflowAction('reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Send Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
