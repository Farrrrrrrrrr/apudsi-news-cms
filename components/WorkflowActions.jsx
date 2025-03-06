"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkflowActions({ article, userRole }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  
  // Disable buttons when actions aren't allowed
  const canSubmitForReview = userRole === 'writer' && 
                           (article.workflow_status === 'draft' || article.workflow_status === 'rejected');
  
  const canApprove = (userRole === 'editor' || userRole === 'superuser') && 
                    article.workflow_status === 'in_review';
  
  const canReject = (userRole === 'editor' || userRole === 'superuser') && 
                  article.workflow_status === 'in_review';
  
  const canPublish = (userRole === 'publisher' || userRole === 'superuser') && 
                   article.workflow_status === 'approved';
  
  // Submit article for review
  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/submit`, {
        method: 'POST',
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
  
  // Approve article
  const handleApprove = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/approve`, {
        method: 'POST',
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
  
  // Show rejection modal
  const showRejectModal = () => {
    setShowRejectionModal(true);
  };
  
  // Reject article
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setIsRejecting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject article');
      }
      
      setShowRejectionModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRejecting(false);
    }
  };
  
  // Publish article
  const handlePublish = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/publish`, {
        method: 'POST',
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
  
  // If no available actions for this user+article combo
  if (!canSubmitForReview && !canApprove && !canReject && !canPublish) {
    return null;
  }
  
  // Color by workflow status
  const getWorkflowStatusColor = () => {
    switch (article.workflow_status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-[#191970]">Workflow Actions</h2>
      </div>
      
      <div className="p-6">
        {/* Current Status */}
        <div className="flex items-center mb-6">
          <span className="mr-2 text-sm text-gray-600">Current Status:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWorkflowStatusColor()}`}>
            {article.workflow_status?.replace('_', ' ')}
          </span>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">
            {error}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {canSubmitForReview && (
            <button
              onClick={handleSubmitForReview}
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Approving...' : 'Approve Article'}
            </button>
          )}
          
          {canReject && (
            <button
              onClick={showRejectModal}
              disabled={isSubmitting || isRejecting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isRejecting ? 'Rejecting...' : 'Reject Article'}
            </button>
          )}
          
          {canPublish && (
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Now'}
            </button>
          )}
        </div>
      </div>
      
      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rejection Reason</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                Please provide a reason for rejection:
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#191970] focus:border-[#191970]"
                rows={4}
                placeholder="Explain why this article needs revisions..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isRejecting ? 'Rejecting...' : 'Reject Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
