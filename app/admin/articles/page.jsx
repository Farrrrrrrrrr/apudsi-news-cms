import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { query } from '../../../lib/db';
import AdminLayout from '../../../components/AdminLayout';
import Pagination from '../../../components/Pagination';
import ArticlesTable from '../../../components/ArticlesTable';
import FilterBar from '../../../components/FilterBar';

export const metadata = {
  title: 'Articles - APUDSI News CMS',
};

export default async function ArticlesPage({ searchParams }) {
  // Get current page and other query parameters
  const currentPage = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const offset = (currentPage - 1) * limit;
  const statusFilter = searchParams.status || null;
  const categoryFilter = searchParams.category || null;
  const searchQuery = searchParams.search || null;
  
  // Get user session from JWT token
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  let user;
  try {
    const secretKey = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-at-least-32-chars'
    );
    
    const { payload } = await jwtVerify(token, secretKey);
    user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Invalid JWT token:', error);
    redirect('/login');
  }
  
  // Build the query based on filters
  let whereClause = '';
  const queryParams = [];
  
  // Filter by status if specified
  if (statusFilter) {
    whereClause = 'WHERE status = ?';
    queryParams.push(statusFilter);
  }
  
  // Add category filter if specified
  if (categoryFilter) {
    whereClause = whereClause ? `${whereClause} AND category = ?` : 'WHERE category = ?';
    queryParams.push(categoryFilter);
  }
  
  // Add search filter if specified
  if (searchQuery) {
    whereClause = whereClause 
      ? `${whereClause} AND (title LIKE ? OR content LIKE ?)`
      : 'WHERE title LIKE ? OR content LIKE ?';
    queryParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
  }
  
  // For non-superusers, only show their own articles
  if (user.role !== 'superuser') {
    whereClause = whereClause 
      ? `${whereClause} AND author_id = ?` 
      : 'WHERE author_id = ?';
    queryParams.push(user.id);
  }
  
  // Get articles with pagination
  const articlesQuery = `
    SELECT a.id, a.title, a.status, a.created_at, a.updated_at, 
           u.name as author_name, a.workflow_status
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    ${whereClause}
    ORDER BY a.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM articles a
    ${whereClause}
  `;
  
  // Execute queries
  try {
    const articlesResult = await query(articlesQuery, [...queryParams, limit, offset]);
    const countResult = await query(countQuery, queryParams);
    
    const articles = articlesResult.rows;
    const totalArticles = countResult.rows[0].total;
    const totalPages = Math.ceil(totalArticles / limit);

    // Get available categories
    const categoriesResult = await query('SELECT DISTINCT category FROM articles WHERE category IS NOT NULL');
    const categories = categoriesResult.rows.map(row => row.category).filter(Boolean);

    return (
      <AdminLayout user={user}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-[#191970]">Articles</h1>
          {(user.role === 'superuser' || user.role === 'writer') && (
            <Link 
              href="/admin/articles/new" 
              className="bg-[#191970] text-white px-3 py-1.5 rounded text-sm hover:bg-[#191970]/90"
            >
              + New Article
            </Link>
          )}
        </div>
        
        <FilterBar 
          statusOptions={['draft', 'published', 'archived']}
          categories={categories}
          currentStatus={statusFilter}
          currentCategory={categoryFilter}
          searchQuery={searchQuery}
        />
        
        <div className="bg-white shadow overflow-hidden rounded-lg mt-4">
          <ArticlesTable articles={articles} userRole={user.role} />
        </div>
        
        <div className="mt-6">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages}
            totalItems={totalArticles}
          />
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return (
      <AdminLayout user={user}>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                There was an error loading the articles. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
}
