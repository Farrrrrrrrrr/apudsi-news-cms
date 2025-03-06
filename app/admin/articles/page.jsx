import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminLayout from '@/components/AdminLayout';
import Pagination from '@/components/Pagination';

export const metadata = {
  title: 'Articles - APUDSI News CMS',
  description: 'Manage articles in the content management system',
};

export default async function ArticlesPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  // Handle pagination and filtering
  const page = parseInt(searchParams?.page || '1', 10);
  const limit = 10;
  const offset = (page - 1) * limit;
  
  // Apply filters
  const status = searchParams?.status;
  const searchTerm = searchParams?.search;
  
  // Build query conditions
  let conditions = [];
  let queryParams = [];
  
  // Filter by status if provided
  if (status) {
    conditions.push("a.status = ?");
    queryParams.push(status);
  }
  
  // Filter by search term if provided
  if (searchTerm) {
    conditions.push("(a.title LIKE ? OR a.content LIKE ?)");
    queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }
  
  // For non-superusers, only show their own articles
  if (session.user.role !== 'superuser') {
    conditions.push("a.author_id = ?");
    queryParams.push(session.user.id);
  }
  
  // Construct the WHERE clause
  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  
  // Get total articles count for pagination
  const countResult = await query(`
    SELECT COUNT(*) AS total
    FROM articles a
    ${whereClause}
  `, queryParams);
  
  const totalArticles = parseInt(countResult.rows[0].total, 10);
  const totalPages = Math.ceil(totalArticles / limit);

  // Get articles
  const articlesResult = await query(`
    SELECT a.*, u.name as author_name 
    FROM articles a 
    JOIN users u ON a.author_id = u.id 
    ${whereClause}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `, [...queryParams, limit, offset]);

  return (
    <AdminLayout user={session.user}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191970]">Articles</h1>
          <p className="text-gray-600">Manage your news articles</p>
        </div>
        <Link 
          href="/admin/articles/create"
          className="px-4 py-2 bg-[#191970] text-white rounded-md hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
        >
          Create New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form className="flex flex-wrap gap-4">
          <div className="flex-grow">
            <input
              type="text"
              name="search"
              placeholder="Search articles..."
              defaultValue={searchParams.search || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#191970] focus:border-[#191970]"
            />
          </div>
          <div>
            <select 
              name="status"
              defaultValue={searchParams.status || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#191970] focus:border-[#191970]"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button 
            type="submit"
            className="px-4 py-2 bg-[#191970] text-white rounded-md hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
          >
            Filter
          </button>
          <Link 
            href="/admin/articles"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
          >
            Reset
          </Link>
        </form>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {articlesResult.rows.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  {session.user.role === 'superuser' && (
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  )}
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articlesResult.rows.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/articles/${article.id}`} className="text-[#191970] font-medium hover:underline">
                        {article.title}
                      </Link>
                    </td>
                    {session.user.role === 'superuser' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.author_name}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/articles/${article.id}`} className="text-[#191970] hover:text-[#191970]/80 mr-4">View</Link>
                      <Link href={`/admin/articles/${article.id}/edit`} className="text-[#880808] hover:text-[#880808]/80">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchParams.search || searchParams.status 
                ? "Try adjusting your search or filter." 
                : "Get started by creating a new article."}
            </p>
            <div className="mt-6">
              <Link 
                href="/admin/articles/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#191970] hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
              >
                <span className="mr-2">+</span>
                New Article
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
