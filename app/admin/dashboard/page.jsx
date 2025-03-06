import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { jwtVerify } from 'jose';
import AdminLayout from '../../../components/AdminLayout';
import { query } from '../../../lib/db';
import DashboardStats from '../../../components/DashboardStats';
import WorkflowDashboard from '../../../components/WorkflowDashboard';

export const metadata = {
  title: 'Dashboard - APUDSI News CMS',
  description: 'Content management dashboard',
};

export default async function AdminDashboard() {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      redirect('/login');
    }

    // Verify and decode the JWT token
    const secretKey = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-at-least-32-chars'
    );
    
    let userSession;
    
    try {
      // Verify the JWT token
      const { payload } = await jwtVerify(token, secretKey);
      
      // Create a user session object from the JWT payload
      userSession = {
        user: {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role
        }
      };
    } catch (jwtError) {
      console.error('Invalid JWT token:', jwtError);
      redirect('/login');
    }

    // Different queries based on user role
    const isSuperuser = userSession.user.role === 'superuser';

    // Get article stats
    let stats;
    let recentArticles;
    
    try {
      // Get basic stats
      const statsResult = await query(`
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
          SUM(CASE WHEN workflow_status = 'in_review' THEN 1 ELSE 0 END) AS in_review
        FROM articles
        ${!isSuperuser ? `WHERE author_id = ${userSession.user.id}` : ''}
      `);
      
      stats = statsResult.rows[0] || { total: 0, published: 0, drafts: 0, in_review: 0 };
      
      // Get recent articles
      const articlesResult = await query(`
        SELECT a.id, a.title, a.status, a.workflow_status, a.created_at, u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        ${!isSuperuser ? `WHERE a.author_id = ${userSession.user.id}` : ''}
        ORDER BY a.created_at DESC
        LIMIT 5
      `);
      
      recentArticles = articlesResult.rows;
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Provide fallback data if DB query fails
      stats = { total: 0, published: 0, drafts: 0, in_review: 0 };
      recentArticles = [];
    }
    
    // Get user count if superuser
    let userCount = 0;
    if (isSuperuser) {
      try {
        const userCountResult = await query('SELECT COUNT(*) as count FROM users');
        userCount = userCountResult.rows[0]?.count || 0;
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    }

    return (
      <AdminLayout user={userSession.user}>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#191970]">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {userSession.user.name || userSession.user.email}</p>
        </div>

        {/* Stats cards */}
        <DashboardStats 
          stats={stats} 
          userCount={userCount} 
          isSuperuser={isSuperuser} 
        />

        {/* Workflow dashboard */}
        {(userSession.user.role === 'editor' || userSession.user.role === 'publisher' || userSession.user.role === 'superuser') && (
          <div className="mt-6">
            <WorkflowDashboard userRole={userSession.user} />
          </div>
        )}

        {/* Recent articles */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-medium text-[#191970]">Recent Articles</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentArticles && recentArticles.length > 0 ? (
              recentArticles.map((article) => (
                <div key={article.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <Link 
                      href={`/admin/articles/${article.id}`}
                      className="text-sm text-[#191970] font-medium hover:underline"
                    >
                      {article.title}
                    </Link>
                    <div className="flex mt-1 text-xs text-gray-500 space-x-2">
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By: {article.author_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500 italic text-sm">
                No articles found
              </div>
            )}
          </div>
          <div className="px-4 py-3 bg-gray-50">
            <Link 
              href="/admin/articles" 
              className="text-xs text-[#191970] hover:text-[#191970]/80 font-medium"
            >
              View all articles →
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
        <p className="mb-6">There was an error loading your dashboard. Please try logging in again.</p>
        <Link href="/login" className="px-4 py-2 bg-[#191970] text-white rounded-md">
          Return to Login
        </Link>
      </div>
    );
  }
}
