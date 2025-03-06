"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PublisherDashboard({ data }) {
  const router = useRouter();
  const { stats, readyToPublish } = data || { stats: {}, readyToPublish: [] };
  const [publishingId, setPublishingId] = useState(null);
  
  const handlePublish = async (articleId) => {
    setPublishingId(articleId);
    
    try {
      const response = await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to publish article');
      }
      
      // Refresh data after successful publish
      router.refresh();
    } catch (error) {
      console.error('Error publishing article:', error);
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Publisher Dashboard</h1>
        <p className="text-gray-600">Publish and manage content distribution</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.to_publish_count || 0}</div>
              <div className="text-sm text-gray-600">Ready to Publish</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?status=approved" className="text-sm text-[#880808] hover:underline">View All →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.published_count || 0}</div>
              <div className="text-sm text-gray-600">Published Articles</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?status=published" className="text-sm text-[#880808] hover:underline">View Published →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">👁️</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.total_views?.toLocaleString() || '0'}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/analytics" className="text-sm text-[#880808] hover:underline">View Analytics →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-yellow-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">📅</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.scheduled_count || 0}</div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/scheduled" className="text-sm text-[#880808] hover:underline">View Schedule →</Link>
          </div>
        </div>
      </div>
      
      {/* Articles Ready to Publish */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-700">Articles Ready to Publish</h2>
        </div>
        
        {readyToPublish && readyToPublish.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ready Since</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {readyToPublish.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{article.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.author_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.editor_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.reviewed_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        href={`/admin/articles/${article.id}/preview`}
                        className="text-[#191970] hover:text-[#191970]/80"
                      >
                        Preview
                      </Link>
                      <button
                        onClick={() => handlePublish(article.id)}
                        disabled={publishingId === article.id}
                        className={`text-green-600 hover:text-green-900 ${publishingId === article.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {publishingId === article.id ? 'Publishing...' : 'Publish'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No articles are currently waiting to be published.
            <div className="mt-2 text-sm">Check back later or refresh the page.</div>
          </div>
        )}
      </div>
      
      {/* Publishing Guidelines */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-700">Publishing Guidelines</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">📋</span> Pre-Publishing Checklist
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verify article has been properly reviewed</li>
                <li>• Check all images have proper attribution</li>
                <li>• Ensure headline is clear and engaging</li>
                <li>• Confirm all links are working correctly</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">⏱️</span> Optimal Publishing Times
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Breaking news: Publish immediately</li>
                <li>• Features: 8:00-9:00 AM or 12:00-1:00 PM</li>
                <li>• Analysis: 3:00-4:00 PM on weekdays</li>
                <li>• Weekend content: Saturday 10:00 AM</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">🔄</span> Post-Publishing Tasks
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Share on social media channels</li>
                <li>• Monitor initial engagement</li>
                <li>• Check for formatting issues</li>
                <li>• Review analytics after 24 hours</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/admin/publishing-guidelines"
              className="text-[#191970] hover:text-[#191970]/80 font-medium text-sm"
            >
              View complete publishing guidelines →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
