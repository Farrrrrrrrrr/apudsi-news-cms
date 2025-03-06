"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WorkflowStatus({ article, userRole }) {
  const [currentStatus, setCurrentStatus] = useState(article?.workflow_status || 'draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState('');

  const isAuthor = article?.author_id === parseInt(userRole.id);
  const isEditor = userRole.role === 'editor' || userRole.role === 'superuser';
  const isPublisher = userRole.role === 'publisher' || userRole.role === 'superuser';
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    approved: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800'
  };
  
  const statusLabels = {
    draft: 'Draft',
    in_review: 'In Review',
    rejected: 'Needs Revision',
    approved: 'Approved',
    published: 'Published'
  };

  // Handle submit for review
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/articles/${article.id}/submit`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit article');
      }
      
      setCurrentStatus('in_review');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle review actions (approve/reject)
  const handleReviewAction = async (decision) => {
    if (decision === 'reject' && !feedback) {
      setError('Feedback is required when rejecting an article');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          feedback
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to review article');
      }
      
      setCurrentStatus(decision === 'approve' ? 'approved' : 'rejected');
      setShowFeedbackModal(false);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle publishing
  const handlePublish = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/publish`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish article');
      }
      
      setCurrentStatus('published');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showFeedbackForm = (action) => {
    setActionType(action);
    setShowFeedbackModal(true);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Editorial Workflow</h2>
      
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700">
          {error}
        </div>
      )}
      
      <div className="flex items-center mb-6">
        <div className="mr-4">
          <span className="text-sm text-gray-500">Current Status:</span>
          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[currentStatus]}`}>
            {statusLabels[currentStatus]}
          </span>
        </div>

        <div className="flex-grow"></div>

        {/* Show action buttons based on role and status */}
        {currentStatus === 'draft' && isAuthor && (
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        )}
        
        {currentStatus === 'in_review' && isEditor && (
          <div className="space-x-2">
            <button 
              onClick={() => handleReviewAction('approve')}
              disabled={loading}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {loading ? 'Processing...' : 'Approve'}
            </button>
            <button 
              onClick={() => showFeedbackForm('reject')}
              disabled={loading}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Request Changes
            </button>
          </div>
        )}
        
        {currentStatus === 'approved' && isPublisher && (
          <button 
            onClick={handlePublish}
            disabled={loading}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {loading ? 'Publishing...' : 'Publish Now'}
          </button>
        )}
        
        {currentStatus === 'rejected' && isAuthor && (
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Resubmitting...' : 'Resubmit'}
          </button>
        )}
      </div>
      
      {/* Workflow visualization */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          {['draft', 'in_review', 'approved', 'published'].map((status, index) => {
            const statuses = ['draft', 'in_review', 'approved', 'published'];
            const currentIndex = statuses.indexOf(currentStatus);
            const statusIndex = statuses.indexOf(status);
            
            let bgColor = 'bg-gray-300';
            
            if (statusIndex <= currentIndex) {
              if (currentStatus === 'rejected' && statusIndex === 1) {
                bgColor = 'bg-red-500';
              } else {
                bgColor = 'bg-blue-600';
              }
            }
            
            return (
              <div
                key={status}
                className={`${bgColor} h-2`}
                style={{ width: '25%' }}
              ></div>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-gray-600">
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStatus === 'draft' ? 'bg-blue-600' : 'bg-blue-600'}`}></div>
            <span>Draft</span>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStatus === 'in_review' ? 'bg-blue-600' : currentStatus === 'rejected' ? 'bg-red-500' : currentStatus === 'approved' || currentStatus === 'published' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <span>Review</span>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStatus === 'approved' ? 'bg-blue-600' : currentStatus === 'published' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <span>Approved</span>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStatus === 'published' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <span>Published</span>
          </div>
        </div>
      </div>
      
      {/* Show review feedback if available */}
      {article.review_feedback && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Editorial Feedback:</h3>
          <p className="text-sm text-yellow-700">{article.review_feedback}</p>
        </div>
      )}
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-medium mb-4">
              {actionType === 'reject' ? 'Provide Feedback for Revision' : 'Add Editorial Notes'}
            </h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 h-32"
              placeholder="Enter detailed feedback to help the author improve the article..."
              required={actionType === 'reject'}
            ></textarea>
            
            {error && (
              <div className="mt-2 p-2 rounded-md bg-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction(actionType)}
                disabled={loading || (actionType === 'reject' && !feedback)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? 'Processing...' : actionType === 'reject' ? 'Send Feedback' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
