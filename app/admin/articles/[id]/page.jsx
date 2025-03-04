import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminLayout from '@/components/AdminLayout';
import DeleteArticleButton from '@/components/DeleteArticleButton';

export async function generateMetadata({ params }) {
  const { id } = params;
  const result = await query('SELECT title FROM articles WHERE id = $1', [id]);
  const title = result.rows[0]?.title || 'Article';
  
  return {
    title: `${title} - APUDSI News CMS`,
    description: `View article details`,
  };
}

export default async function ArticleViewPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const { id } = params;
  
  // Get article details
  const result = await query(
    `SELECT a.*, u.name as author_name, u.email as author_email
     FROM articles a 
     JOIN users u ON a.author_id = u.id 
     WHERE a.id = $1`,
    [id]
  );

  // Check if article exists
  if (result.rows.length === 0) {
    redirect('/admin/articles');
  }

  const article = result.rows[0];
  
  // Check permissions: only superuser or article author can view
  if (session.user.role !== 'superuser' && article.author_id !== session.user.id) {
    redirect('/admin/articles');
  }

  // Format date for display
  const createdDate = new Date(article.created_at).toLocaleDateString();
  const updatedDate = new Date(article.updated_at).toLocaleDateString();

  return (
    <AdminLayout user={session.user}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#191970]">{article.title}</h1>
        <div className="flex space-x-3">
          <Link
            href={`/admin/articles/${id}/edit`}
            className="px-4 py-2 bg-[#191970] text-white rounded-md hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
          >
            Edit Article
          </Link>
          {session.user.role === 'superuser' && (
            <DeleteArticleButton id={id} />
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {article.status}
              </span>
              <span>•</span>
              <span>By {article.author_name}</span>
              <span>•</span>
              <span>Created: {createdDate}</span>
              <span>•</span>
              <span>Updated: {updatedDate}</span>
            </div>

            {article.image_path && (
              <div className="mb-6">
                <img
                  src={article.image_path}
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
