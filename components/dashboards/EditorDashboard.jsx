"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditorDashboard({ data }) {
  const router = useRouter();
  const { stats, pendingReviews } = data || { stats: {}, pendingReviews: [] };
  const [reviewingId, setReviewingId] = useState(null);
  
  const handleReviewClick = (articleId) => {
    router.push(`/admin/articles/${articleId}/review`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editor Dashboard</h1>
        <p className="text-gray-600">Review and approve submitted articles</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.to_review_count || 0}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?workflow_status=in_review" className="text-sm text-[#880808] hover:underline">View All →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.reviewed_count || 0}</div>
              <div className="text-sm text-gray-600">Reviewed</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?reviewer_id=${stats?.user_id}" className="text-sm text-[#880808] hover:underline">View Reviewed →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.approved_count || 0}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?workflow_status=approved" className="text-sm text-[#880808] hover:underline">View Approved →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">↩️</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.rejected_count || 0}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?workflow_status=rejected" className="text-sm text-[#880808] hover:underline">View Rejected →</Link>
          </div>
        </div>
      </div>
      
      {/* Articles Awaiting Review */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-700">Articles Awaiting Review</h2>
        </div>
        
        {pendingReviews && pendingReviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingReviews.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{article.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.author_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          href={`/admin/articles/${article.id}`}
                          className="text-[#191970] hover:text-[#191970]/80"
                        >
                          Preview
                        </Link>
                        <button
                          onClick={() => handleReviewClick(article.id)}
                          disabled={reviewingId === article.id}
                          className={`text-blue-600 hover:text-blue-900 ${reviewingId === article.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label={`Review article: ${article.title}`}
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No articles are currently waiting for review.</p>
            <p className="text-sm mt-2">Check back later or refresh the page.</p>
          </div>
        )}
      </div>
      
      {/* Editorial Guidelines */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-700">Editorial Guidelines</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">✏️</span> Content Standards
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check for factual accuracy and sources</li>
                <li>• Ensure proper grammar and formatting</li>
                <li>• Verify image credits are included</li>
                <li>• Confirm content is original</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">🧐</span> Review Criteria
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clarity and flow of the narrative</li>
                <li>• Quality and relevance of sources</li>
                <li>• Appropriate tone for the topic</li>
                <li>• Engaging headline and subheadings</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">📋</span> Rejection Guidelines
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Always provide clear feedback</li>
                <li>• Focus on specific improvements</li>
                <li>• Be constructive and respectful</li>
                <li>• Suggest resources when appropriate</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/admin/editorial-guidelines"
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
