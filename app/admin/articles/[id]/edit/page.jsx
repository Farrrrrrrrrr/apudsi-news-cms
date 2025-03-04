import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminLayout from '@/components/AdminLayout';
import ArticleForm from '@/components/ArticleForm';

export async function generateMetadata({ params }) {
  const { id } = params;
  const result = await query('SELECT title FROM articles WHERE id = $1', [id]);
  const title = result.rows[0]?.title || 'Article';
  
  return {
    title: `Edit ${title} - APUDSI News CMS`,
    description: `Edit article content`,
  };
}

export default async function EditArticlePage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const { id } = params;
  
  // Get article details
  const result = await query(
    'SELECT * FROM articles WHERE id = $1',
    [id]
  );

  // Check if article exists
  if (result.rows.length === 0) {
    redirect('/admin/articles');
  }

  const article = result.rows[0];
  
  // Check permissions: only superuser or article author can edit
  if (session.user.role !== 'superuser' && article.author_id !== session.user.id) {
    redirect('/admin/articles');
  }

  return (
    <AdminLayout user={session.user}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#191970]">Edit Article</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update the article details below
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <ArticleForm article={article} />
      </div>
    </AdminLayout>
  );
}
