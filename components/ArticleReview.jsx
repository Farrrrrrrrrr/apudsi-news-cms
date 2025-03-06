"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ArticleReview({ article, userRole }) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isEditor = userRole.role === 'editor' || userRole.role === 'superuser';
  const canReview = isEditor && article.workflow_status === 'in_review';
  
  if (!canReview) {
    return (
      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
        <p className="text-yellow-800">
          This article is not currently available for review.
        </p>
      </div>
    );
  }

  const handleApprove = async () => {
    await handleReviewDecision('approve');
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      setError('Feedback is required when rejecting an article');
      return;
    }
    await handleReviewDecision('reject');
  };

  const handleReviewDecision = async (decision) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          feedback: feedback.trim() || null
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process review');
      }
      
      // Success - redirect to the editor dashboard
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || 'An error occurred during review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[#191970] mb-4">Review Article</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">Article Information</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Title</dt>
            <dd className="font-medium">{article.title}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Author</dt>
            <dd className="font-medium">{article.author_name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Submitted On</dt>
            <dd>{new Date(article.submitted_at || article.created_at).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Word Count</dt>
            <dd>{article.content.split(/\s+/).filter(Boolean).length} words</dd>
          </div>
        </dl>
      </div>
      
      <div className="mb-6">
        <label htmlFor="feedback" className="block font-medium mb-1">
          Editorial Feedback
          {article.workflow_status !== 'approved' && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-32 focus:border-[#191970] focus:ring focus:ring-[#191970] focus:ring-opacity-50"
          placeholder="Provide detailed feedback for the author..."
          required={article.workflow_status !== 'approved'}
          aria-describedby="feedback-desc"
        ></textarea>
        <p id="feedback-desc" className="mt-1 text-sm text-gray-500">
          Required if rejecting. Be specific and constructive with your feedback.
        </p>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        <Link
          href={`/admin/articles/${article.id}`}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 inline-flex justify-center"
        >
          Cancel
        </Link>
        <button
          onClick={handleReject}
          disabled={isSubmitting}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 inline-flex justify-center"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Request Changes'}
        </button>
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 inline-flex justify-center"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Approve Article'}
        </button>
      </div>
    </div>
  );
}
