import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import DashboardStats from '@/components/DashboardStats';

export const metadata = {
  title: 'Dashboard - APUDSI News CMS',
  description: 'Content management dashboard',
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Different queries based on user role
  const isSuperuser = session.user.role === 'superuser';
  const authorFilter = isSuperuser ? '' : `WHERE a.author_id = ${session.user.id}`;
  
  // Get article stats
  const statsQuery = `
    SELECT 
      COUNT(*) AS total,
      COUNT(CASE WHEN status = 'published' THEN 1 END) AS published,
      COUNT(CASE WHEN status = 'draft' THEN 1 END) AS drafts,
      COUNT(CASE WHEN workflow_status = 'in_review' THEN 1 END) AS in_review
    FROM articles a
    ${authorFilter}
  `;
  
  // Get recent articles
  const recentArticlesQuery = `
    SELECT 
      a.id, a.title, a.status, a.workflow_status, a.created_at, 
      u.name as author_name
    FROM articles a
    JOIN users u ON a.author_id = u.id
    ${authorFilter}
    ORDER BY a.created_at DESC
    LIMIT 5
  `;
  
  // Get user count if superuser
  const userCountQuery = isSuperuser 
    ? `SELECT COUNT(*) AS count FROM users` 
    : null;
  
  // Run queries
  const [statsResult, articlesResult, userCountResult] = await Promise.all([
    query(statsQuery),
    query(recentArticlesQuery),
    isSuperuser ? query(userCountQuery) : Promise.resolve({ rows: [{ count: 0 }] })
  ]);
  
  const stats = statsResult.rows[0];
  const recentArticles = articlesResult.rows;
  const userCount = userCountResult.rows[0].count;

  return (
    <AdminLayout user={session.user}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#191970]">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.user.name || session.user.email}</p>
      </div>

      {/* Stats cards */}
      <DashboardStats 
        stats={stats} 
        userCount={userCount} 
        isSuperuser={isSuperuser} 
      />

      {/* Recent articles */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-[#191970]">Recent Articles</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentArticles.length > 0 ? (
            recentArticles.map((article) => (
              <div key={article.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <Link 
                    href={`/admin/articles/${article.id}`}
                    className="text-[#191970] font-medium hover:underline"
                  >
                    {article.title}
                  </Link>
                  <div className="flex mt-1 text-xs text-gray-500 space-x-3">
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>By: {article.author_name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    article.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.status}
                  </span>
                  {article.workflow_status !== article.status && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      article.workflow_status === 'in_review' 
                        ? 'bg-blue-100 text-blue-800' 
                        : article.workflow_status === 'approved' 
                        ? 'bg-purple-100 text-purple-800'
                        : article.workflow_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.workflow_status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500 italic">
              No articles found
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50">
          <Link 
            href="/admin/articles" 
            className="text-[#191970] hover:text-[#191970]/80 font-medium"
          >
            View all articles →
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-[#191970]">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/admin/articles/create"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#191970] hover:bg-[#191970]/90"
            >
              <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Article
            </Link>
            
            {isSuperuser && (
              <Link
                href="/admin/users/create"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add New User
              </Link>
            )}
            
            <Link
              href="/admin/articles?status=published"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Published Articles
            </Link>
          </div>
        </div>
        
        {/* System info */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-[#191970]">System Info</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Your Role</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                {session.user.role}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Login</p>
              <p className="mt-1 text-gray-900">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">CMS Version</p>
              <p className="mt-1 text-gray-900">1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
