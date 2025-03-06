"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WorkflowDashboard({ user }) {
  const [stats, setStats] = useState({
    pendingReview: 0,
    pendingPublishing: 0,
    rejectedArticles: 0,
    myDrafts: 0
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflowData = async () => {
      try {
        const response = await fetch('/api/workflow/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch workflow stats');
        }
        const data = await response.json();
        setStats(data.stats);
        setItems(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse p-6 rounded-lg bg-white">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Get workflow status classes
  const getStatusClass = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#191970] mb-4">Workflow Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(user.role === 'superuser' || user.role === 'editor') && (
          <div className="p-4 bg-yellow-50 rounded-lg shadow-sm border border-yellow-200">
            <p className="text-yellow-800 font-semibold">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.pendingReview}</p>
            <Link 
              href="/admin/workflow/review"
              className="text-xs text-yellow-700 hover:underline mt-2 inline-block"
            >
              View all →
            </Link>
          </div>
        )}
        
        {(user.role === 'superuser' || user.role === 'publisher') && (
          <div className="p-4 bg-green-50 rounded-lg shadow-sm border border-green-200">
            <p className="text-green-800 font-semibold">Ready to Publish</p>
            <p className="text-3xl font-bold text-green-700">{stats.pendingPublishing}</p>
            <Link 
              href="/admin/workflow/publish"
              className="text-xs text-green-700 hover:underline mt-2 inline-block"
            >
              View all →
            </Link>
          </div>
        )}
        
        <div className="p-4 bg-red-50 rounded-lg shadow-sm border border-red-200">
          <p className="text-red-800 font-semibold">Rejected Articles</p>
          <p className="text-3xl font-bold text-red-700">{stats.rejectedArticles}</p>
          <Link 
            href="/admin/articles?status=rejected"
            className="text-xs text-red-700 hover:underline mt-2 inline-block"
          >
            View all →
          </Link>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-800 font-semibold">My Drafts</p>
          <p className="text-3xl font-bold text-gray-700">{stats.myDrafts}</p>
          <Link 
            href="/admin/articles?status=draft"
            className="text-xs text-gray-700 hover:underline mt-2 inline-block"
          >
            View all →
          </Link>
        </div>
      </div>
      
      {/* Workflow Activity */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={`${item.article_id}-${item.updated_at}`} className="px-6 py-4 hover:bg-gray-50">
                <Link href={`/admin/articles/${item.article_id}`} className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#191970] truncate">{item.title}</p>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>{item.author_name}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(item.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
