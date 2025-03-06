import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Submit article for review
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    // Check if article exists and is owned by the user
    const articleCheck = await query(
      'SELECT author_id, workflow_status FROM articles WHERE id = ?',
      [id]
    );
    
    if (articleCheck.rows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const article = articleCheck.rows[0];
    
    // Only the owner or a superuser can submit an article
    if (article.author_id !== session.user.id && session.user.role !== 'superuser') {
      return Response.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Article must be in draft status to be submitted
    if (article.workflow_status !== 'draft' && article.workflow_status !== 'rejected') {
      return Response.json({ 
        error: 'Only draft or rejected articles can be submitted for review' 
      }, { status: 400 });
    }
    
    // Update article status
    const result = await query(
      `UPDATE articles 
       SET workflow_status = 'in_review', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? 
       RETURNING *`,
      [id]
    );
    
    return Response.json({ 
      article: result.rows[0],
      message: 'Article submitted for review successfully'
    });
  } catch (error) {
    console.error('Error submitting article:', error);
    return Response.json({ error: 'Failed to submit article' }, { status: 500 });
  }
}
