"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkflowState({ article, userRole }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Define colors and labels for each workflow state
  const stateStyles = {
    draft: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Draft'
    },
    in_review: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'In Review'
    },
    approved: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'Approved'
    },
    published: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Published'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Rejected'
    }
  };

  // Determine which actions are allowed based on role and current state
  const canSubmit = (userRole === 'writer' || userRole === 'superuser') && 
                    (article.workflow_status === 'draft' || article.workflow_status === 'rejected') &&
                    (article.author_id === article.current_user_id || userRole === 'superuser');
  
  const canApprove = (userRole === 'editor' || userRole === 'superuser') && 
                     article.workflow_status === 'in_review';
  
  const canReject = (userRole === 'editor' || userRole === 'superuser') && 
                    article.workflow_status === 'in_review';
  
  const canPublish = (userRole === 'publisher' || userRole === 'superuser') && 
                     article.workflow_status === 'approved';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/submit`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit article');
      }
      
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/approve`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve article');
      }
      
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject article');
      }
      
      setShowRejectModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/publish`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish article');
      }
      
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentState = stateStyles[article.workflow_status] || stateStyles.draft;

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Workflow Status</h3>
      </div>
      
      <div className="p-4">
        {/* Current status */}
        <div className="flex items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentState.bg} ${currentState.text}`}>
            {currentState.label}
          </span>
          
          {article.rejection_reason && article.workflow_status === 'rejected' && (
            <span className="ml-3 text-sm text-red-600">
              <span className="font-medium">Reason:</span> {article.rejection_reason}
            </span>
          )}
        </div>
        
        {/* Workflow timeline */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Created</p>
              <p className="text-xs text-gray-500">
                {new Date(article.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          
          {article.submitted_at && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Submitted for review</p>
                <p className="text-xs text-gray-500">
                  {new Date(article.submitted_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          
          {article.reviewed_at && (
            <div className="flex items-start">
              <div className={`flex-shrink-0 h-5 w-5 rounded-full ${article.workflow_status === 'rejected' ? 'bg-red-500' : 'bg-purple-500'} flex items-center justify-center`}>
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {article.workflow_status === 'rejected' ? 'Rejected' : 'Approved'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(article.reviewed_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          
          {article.published_at && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-gray-500">
                  {new Date(article.published_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          
          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </button>
          )}
          
          {canReject && (
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              Reject
            </button>
          )}
          
          {canPublish && (
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
      
      {/* Rejection modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-medium mb-4">Reject Article</h3>
            <p className="mb-4 text-gray-600">Please provide a reason for rejecting this article:</p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32 focus:ring-[#191970] focus:border-[#191970]"
              placeholder="Enter rejection reason here..."
              aria-label="Rejection reason"
            ></textarea>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Rejecting...' : 'Reject Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
