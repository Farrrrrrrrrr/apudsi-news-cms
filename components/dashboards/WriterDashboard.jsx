"use client";

import Link from 'next/link';

export default function WriterDashboard({ data }) {
  const { stats, recentArticles } = data || { stats: {}, recentArticles: [] };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Writer Dashboard</h1>
        <p className="text-gray-600">Create and manage your articles</p>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/articles/create"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
          >
            <div>
              <div className="text-2xl mb-2">✏️</div>
              <div className="font-medium text-gray-900">Create New Article</div>
            </div>
          </Link>
          
          <Link
            href="/admin/articles?status=draft"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
          >
            <div>
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium text-gray-900">My Drafts</div>
              <div className="text-sm text-gray-500 mt-1">{stats?.draft_count || 0} Articles</div>
            </div>
          </Link>
          
          <Link
            href="/admin/articles?status=in_review"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
          >
            <div>
              <div className="text-2xl mb-2">👀</div>
              <div className="font-medium text-gray-900">In Review</div>
              <div className="text-sm text-gray-500 mt-1">{stats?.in_review_count || 0} Articles</div>
            </div>
          </Link>
          
          <Link
            href="/admin/articles?status=published"
            className="flex items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-center"
          >
            <div>
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-medium text-gray-900">Published</div>
              <div className="text-sm text-gray-500 mt-1">{stats?.published_count || 0} Articles</div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Article Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Article Statistics</h2>
          <div className="flex items-center justify-center">
            <div className="w-full h-48 flex items-center justify-center">
              {stats?.total_articles > 0 ? (
                <div className="w-full">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Draft</span>
                    <span className="text-sm font-medium">{stats?.draft_count || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-400 h-2.5 rounded-full"
                      style={{ width: `${(stats?.draft_count / stats?.total_articles) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mb-2 mt-4">
                    <span className="text-sm text-gray-600">In Review</span>
                    <span className="text-sm font-medium">{stats?.in_review_count || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-yellow-400 h-2.5 rounded-full"
                      style={{ width: `${(stats?.in_review_count / stats?.total_articles) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mb-2 mt-4">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="text-sm font-medium">{stats?.published_count || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-400 h-2.5 rounded-full"
                      style={{ width: `${(stats?.published_count / stats?.total_articles) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center">No articles yet. Start creating!</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Writing Tips</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Use clear, concise language that's easy to understand</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Include relevant keywords in the title and first paragraph</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Break up content with subheadings for better readability</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Add high-quality images to make your article more engaging</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Always cite sources and verify information before publishing</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Content Calendar</h2>
          
          <div className="text-center text-gray-500">
            <div className="mb-3">📅</div>
            <p>The content calendar feature will be available soon.</p>
            <Link href="/admin/calendar" className="text-[#191970] hover:underline text-sm block mt-2">
              Plan your content schedule →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-700">Your Recent Articles</h2>
        </div>
        
        {recentArticles && recentArticles.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentArticles.map((article) => (
              <div key={article.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/admin/articles/${article.id}`}
                      className="text-lg font-medium text-[#191970] hover:underline"
                    >
                      {article.title}
                    </Link>
                    
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.workflow_status === 'published' ? 'bg-green-100 text-green-800' :
                        article.workflow_status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {article.workflow_status === 'published' ? 'Published' : 
                         article.workflow_status === 'in_review' ? 'In Review' : 
                         'Draft'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(article.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex-shrink-0">
                    <Link 
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-sm text-[#191970] hover:text-[#191970]/80"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p className="mb-4">You haven't created any articles yet.</p>
            <Link 
              href="/admin/articles/create" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#191970] hover:bg-[#191970]/90"
            >
              Create Your First Article
            </Link>
          </div>
        )}
        
        {recentArticles && recentArticles.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <Link 
              href="/admin/articles" 
              className="text-[#191970] hover:text-[#191970]/80 text-sm font-medium"
            >
              View all your articles →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
