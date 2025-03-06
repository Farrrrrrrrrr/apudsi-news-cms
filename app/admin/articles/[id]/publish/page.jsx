import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminLayout from '@/components/AdminLayout';
import ArticlePublish from '@/components/ArticlePublish';

export const metadata = {
  title: 'Publish Article - APUDSI News CMS',
  description: 'Publish an approved article',
};

export default async function PublishArticlePage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Only allow publishers or superusers to access this page
  if (session.user.role !== 'publisher' && session.user.role !== 'superuser') {
    redirect('/admin');
  }

  const { id } = params;
  
  // Fetch the article with author name
  const result = await query(`
    SELECT a.*, u.name as author_name, u.email as author_email,
           r.name as reviewer_name
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN users r ON a.reviewer_id = r.id
    WHERE a.id = ?
  `, [id]);
  
  if (result.rows.length === 0) {
    notFound();
  }
  
  const article = result.rows[0];
  
  // Verify the article is approved and ready for publishing
  if (article.workflow_status !== 'approved') {
    redirect(`/admin/articles/${id}`);
  }

  return (
    <AdminLayout user={session.user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191970]">Publish Article</h1>
        <p className="mt-1 text-gray-600">Review and publish approved content</p>
      </div>
      
      <ArticlePublish article={article} userId={session.user.id} />
    </AdminLayout>
  );
}
