import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminLayout from '@/components/AdminLayout';
import DeleteArticleButton from '@/components/DeleteArticleButton';
import SubmitArticleButton from '@/components/SubmitArticleButton';
import ApproveArticleButton from '@/components/ApproveArticleButton';
import RejectArticleButton from '@/components/RejectArticleButton';
import PublishArticleButton from '@/components/PublishArticleButton';
import WorkflowTimeline from '@/components/WorkflowTimeline';

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
  
  // Get article details with workflow information
  const result = await query(
    `SELECT 
      a.*,
      u_author.name as author_name,
      u_author.email as author_email,
      u_reviewer.name as reviewer_name,
      u_publisher.name as publisher_name
     FROM articles a 
     JOIN users u_author ON a.author_id = u_author.id
     LEFT JOIN users u_reviewer ON a.reviewer_id = u_reviewer.id
     LEFT JOIN users u_publisher ON a.publisher_id = u_publisher.id
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
    // Allow editors to see articles that are in_review
    if (session.user.role !== 'editor' || article.workflow_status !== 'in_review') {
      // Allow publishers to see articles that are approved
      if (session.user.role !== 'publisher' || article.workflow_status !== 'approved') {
        redirect('/admin/articles');
      }
    }
  }

  // Format dates for display
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString();
  };

  // Determine if user can edit this article
  const canEdit = 
    session.user.role === 'superuser' || 
    (article.author_id === session.user.id && article.workflow_status === 'draft');

  return (
    <AdminLayout user={session.user}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#191970]">{article.title}</h1>
        <div className="flex space-x-3">
          {/* Show different actions based on role and article status */}
          
          {canEdit && (
            <Link
              href={`/admin/articles/${id}/edit`}
              className="px-4 py-2 bg-[#191970] text-white rounded-md hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
            >
              Edit Article
            </Link>
          )}
          
          {/* Submit button (for writers) */}
          <SubmitArticleButton 
            articleId={id} 
            currentStatus={article.workflow_status} 
          />
          
          {/* Approve/Reject buttons (for editors) */}
          {(session.user.role === 'editor' || session.user.role === 'superuser') && 
           article.workflow_status === 'in_review' && (
            <>
              <ApproveArticleButton articleId={id} />
              <RejectArticleButton articleId={id} />
            </>
          )}
          
          {/* Publish button (for publishers) */}
          {(session.user.role === 'publisher' || session.user.role === 'superuser') && 
           article.workflow_status === 'approved' && (
            <PublishArticleButton articleId={id} />
          )}
          
          {/* Delete button (superusers only) */}
          {session.user.role === 'superuser' && (
            <DeleteArticleButton id={id} />
          )}
        </div>
      </div>

      {/* Article status info */}
      <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-4 py-4 sm:p-6">
          <WorkflowTimeline article={article} />
        </div>
      </div>

      {/* Article content */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                article.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {article.status}
              </span>
              <span>•</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                article.workflow_status === 'draft' 
                  ? 'bg-gray-100 text-gray-800'
                  : article.workflow_status === 'in_review'
                  ? 'bg-blue-100 text-blue-800'
                  : article.workflow_status === 'approved'
                  ? 'bg-purple-100 text-purple-800'
                  : article.workflow_status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {article.workflow_status.replace('_', ' ')}
              </span>
              <span>•</span>
              <span>By {article.author_name}</span>
              <span>•</span>
              <span>Created: {formatDate(article.created_at)}</span>
              {article.updated_at && (
                <>
                  <span>•</span>
                  <span>Updated: {formatDate(article.updated_at)}</span>
                </>
              )}
            </div>

            {/* Rejection reason if rejected */}
            {article.workflow_status === 'rejected' && article.rejection_reason && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-sm font-medium text-red-800">Revision Needed</h3>
                <p className="mt-1 text-sm text-red-700">{article.rejection_reason}</p>
              </div>
            )}

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
