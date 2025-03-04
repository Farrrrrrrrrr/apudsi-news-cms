import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard - APUDSI News CMS',
  description: 'Admin dashboard for APUDSI News Content Management System',
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Get statistics for dashboard
  const [articleStats, userCount] = await Promise.all([
    query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'draft') as drafts,
        COUNT(*) as total
      FROM articles
      ${session.user.role !== 'superuser' ? `WHERE author_id = ${session.user.id}` : ''}
    `),
    session.user.role === 'superuser' 
      ? query('SELECT COUNT(*) FROM users')
      : { rows: [{ count: 0 }] }
  ]);

  // Get recent articles
  const recentArticles = await query(`
    SELECT a.id, a.title, a.status, a.created_at, u.name as author_name
    FROM articles a
    JOIN users u ON a.author_id = u.id
    ${session.user.role !== 'superuser' ? `WHERE a.author_id = ${session.user.id}` : ''}
    ORDER BY a.created_at DESC
    LIMIT 5
  `);

  const stats = articleStats.rows[0];

  return (
    <AdminLayout user={session.user}>
      <h1 className="text-2xl font-bold text-[#191970] mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-[#191970] mb-2">Published Articles</h2>
          <p className="text-3xl font-bold">{stats.published}</p>
          <Link href="/admin/articles?status=published" className="text-[#880808] mt-2 inline-block">View all</Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-[#191970] mb-2">Draft Articles</h2>
          <p className="text-3xl font-bold">{stats.drafts}</p>
          <Link href="/admin/articles?status=draft" className="text-[#880808] mt-2 inline-block">View all</Link>
        </div>
        
        {session.user.role === 'superuser' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-[#191970] mb-2">Total Users</h2>
            <p className="text-3xl font-bold">{userCount.rows[0].count}</p>
            <Link href="/admin/users" className="text-[#880808] mt-2 inline-block">Manage users</Link>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#191970]">Recent Articles</h2>
        </div>
        {recentArticles.rows.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {session.user.role === 'superuser' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentArticles.rows.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/articles/${article.id}`} className="text-[#191970] hover:underline">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  {session.user.role === 'superuser' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.author_name}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">No articles yet</div>
        )}
        <div className="px-6 py-4 border-t">
          <Link href="/admin/articles" className="text-[#880808] font-medium">View all articles →</Link>
        </div>
      </div>
    </AdminLayout>
  );
}
