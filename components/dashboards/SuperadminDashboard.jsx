"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperadminDashboard({ data }) {
  const router = useRouter();
  const { stats, recentActivity } = data || { stats: {}, recentActivity: [] };
  
  // Track which tabs are active in the dashboard
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administration Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>
      
      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.user_count || 0}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/users" className="text-sm text-[#880808] hover:underline">Manage Users →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.total_articles || 0}</div>
              <div className="text-sm text-gray-600">Total Articles</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles" className="text-sm text-[#880808] hover:underline">View Articles →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
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
            <div className="bg-amber-50 rounded-full h-12 w-12 flex items-center justify-center mr-4">
              <span className="text-xl">⏳</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#191970]">{stats?.in_progress_count || 0}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/articles?status=in_progress" className="text-sm text-[#880808] hover:underline">View In Progress →</Link>
          </div>
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['overview', 'workflow', 'users', 'system'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-[#880808] text-[#880808]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Content Status */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-700">Content Status</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col">
                  <div className="-my-2 overflow-x-auto">
                    <div className="py-2 align-middle inline-block min-w-full">
                      <div className="overflow-hidden">
                        {/* Content Pipeline */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                              <span className="mr-2">📝</span> Drafts
                            </h3>
                            <div className="text-2xl font-bold text-[#191970]">{stats?.draft_count || 0}</div>
                            <div className="flex items-center mt-2">
                              <div className="text-xs text-gray-500">
                                {stats?.draft_change ? (
                                  <span className={`font-medium ${stats.draft_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.draft_change > 0 ? '+' : ''}{stats.draft_change}%
                                  </span>
                                ) : '—'}
                                <span className="ml-1">vs last week</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                              <span className="mr-2">👀</span> In Review
                            </h3>
                            <div className="text-2xl font-bold text-[#191970]">{stats?.in_review_count || 0}</div>
                            <div className="flex items-center mt-2">
                              <div className="text-xs text-gray-500">
                                {stats?.review_change ? (
                                  <span className={`font-medium ${stats.review_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.review_change > 0 ? '+' : ''}{stats.review_change}%
                                  </span>
                                ) : '—'}
                                <span className="ml-1">vs last week</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                              <span className="mr-2">✅</span> Ready
                            </h3>
                            <div className="text-2xl font-bold text-[#191970]">{stats?.ready_count || 0}</div>
                            <div className="flex items-center mt-2">
                              <div className="text-xs text-gray-500">
                                {stats?.ready_change ? (
                                  <span className={`font-medium ${stats.ready_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.ready_change > 0 ? '+' : ''}{stats.ready_change}%
                                  </span>
                                ) : '—'}
                                <span className="ml-1">vs last week</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                              <span className="mr-2">🚀</span> Published
                            </h3>
                            <div className="text-2xl font-bold text-[#191970]">{stats?.published_count || 0}</div>
                            <div className="flex items-center mt-2">
                              <div className="text-xs text-gray-500">
                                {stats?.published_change ? (
                                  <span className={`font-medium ${stats.published_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.published_change > 0 ? '+' : ''}{stats.published_change}%
                                  </span>
                                ) : '—'}
                                <span className="ml-1">vs last week</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Velocity Chart would go here */}
                        <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <p>Content Velocity Chart</p>
                            <p className="text-sm mt-2">Shows publishing trends over time</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-700">Recent System Activity</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className={`bg-${activity.activity_type === 'new_article' ? 'blue' : 'green'}-100 rounded-full h-8 w-8 flex items-center justify-center mr-3`}>
                          <span>{activity.activity_type === 'new_article' ? '📝' : '🚀'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.activity_type === 'new_article' 
                              ? `${activity.user_name} created a new article` 
                              : `${activity.user_name} published an article`}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            <Link href={`/admin/articles/${activity.id}`} className="hover:underline text-[#191970]">
                              {activity.title}
                            </Link>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.activity_time).toLocaleString()}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <Link 
                            href={`/admin/articles/${activity.id}`}
                            className="text-sm font-medium text-[#191970] hover:text-[#191970]/80"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">No recent activity to display.</div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
                <Link 
                  href="/admin/activity-log"
                  className="text-sm font-medium text-[#191970] hover:text-[#191970]/80"
                >
                  View full activity log →
                </Link>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'workflow' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">Workflow Management</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-500 mb-4">Configure content approval workflows and publishing rules.</p>
              
              <div className="space-y-4">
                <Link 
                  href="/admin/settings/workflow"
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h3 className="text-lg font-medium text-gray-800">Content Approval Process</h3>
                  <p className="mt-1 text-sm text-gray-600">Define who can approve content at each stage</p>
                </Link>
                
                <Link 
                  href="/admin/settings/notifications"
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h3 className="text-lg font-medium text-gray-800">Notification Settings</h3>
                  <p className="mt-1 text-sm text-gray-600">Configure email alerts for content status changes</p>
                </Link>
                
                <Link 
                  href="/admin/settings/publishing-rules"
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h3 className="text-lg font-medium text-gray-800">Publishing Rules</h3>
                  <p className="mt-1 text-sm text-gray-600">Set content quality requirements before publishing</p>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">User Management</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500">Manage system users and their permissions.</p>
                <Link 
                  href="/admin/users/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#191970] hover:bg-[#191970]/90
