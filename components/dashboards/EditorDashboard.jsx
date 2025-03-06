"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditorDashboard({ data }) {
  const router = useRouter();
  const { stats, pendingReviews } = data || { stats: {}, pendingReviews: [] };
  const [reviewingId, setReviewingId] = useState(null);
  
  const handleStartReview = async (articleId) => {
    setReviewingId(articleId);
    
    try {
      const response = await fetch(`/api/articles/${articleId}/assign-reviewer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign as reviewer');
      }
      
      router.push(`/admin/articles/${articleId}/review`);
    } catch (error) {
      console.error('Error starting review:', error);
      setReviewingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editor Dashboard</h1>
        <p className="text-gray-600">Manage content reviews and quality assurance</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">👀</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.to_review_count || 0}</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?status=in_review" className="text-sm text-[#880808] hover:underline">View All →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.reviewed_count || 0}</div>
              <div className="text-sm text-gray-600">Reviewed Articles</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?reviewed_by_me=true" className="text-sm text-[#880808] hover:underline">View Reviews →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">⏰</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.avg_review_time || '—'}</div>
              <div className="text-sm text-gray-600">Avg. Review Time</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">🔍</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.feedback_count || 0}</div>
              <div className="text-sm text-gray-600">Feedback Given</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Articles Pending Review */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-700">Articles Pending Review</h2>
        </div>
        
        {pendingReviews && pendingReviews.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingReviews.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.author_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleStartReview(article.id)}
                      disabled={reviewingId === article.id}
                      className={`text-[#191970] hover:text-[#191970]/80 ${reviewingId === article.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {reviewingId === article.id ? 'Starting...' : 'Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No articles are currently waiting for review.
            <div className="mt-2 text-sm">Check back later or refresh the page.</div>
          </div>
        )}
      </div>
      
      {/* Review Guidelines */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-700">Editor Guidelines</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">📝</span> Quality Standards
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check for factual accuracy</li>
                <li>• Ensure sources are properly cited</li>
                <li>• Verify information from multiple sources</li>
                <li>• Review for bias and neutrality</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">✍️</span> Writing Style
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Correct grammar and spelling</li>
                <li>• Clear and concise language</li>
                <li>• Proper paragraph structure</li>
                <li>• Consistent tone throughout</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">🔍</span> Review Process
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Provide constructive feedback</li>
                <li>• Approve or request changes</li>
                <li>• Give specific examples for improvement</li>
                <li>• Complete reviews within 24 hours</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/admin/editor-guidelines"
              className="text-[#191970] hover:text-[#191970]/80 font-medium text-sm"
            >
              View complete editorial guidelines →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
