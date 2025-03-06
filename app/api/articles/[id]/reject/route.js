import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Reject article with feedback
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only editors and superusers can reject articles
  if (session.user.role !== 'editor' && session.user.role !== 'superuser') {
    return Response.json({ error: 'Permission denied' }, { status: 403 });
  }
  
  try {
    const { id } = params;
    const { reason } = await request.json();
    
    if (!reason || reason.trim() === '') {
      return Response.json({ error: 'Rejection reason is required' }, { status: 400 });
    }
    
    // Check if article exists and is in review
    const articleCheck = await query(
      'SELECT workflow_status FROM articles WHERE id = ?',
      [id]
    );
    
    if (articleCheck.rows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const article = articleCheck.rows[0];
    
    // Article must be in review status to be rejected
    if (article.workflow_status !== 'in_review') {
      return Response.json({ 
        error: 'Only articles in review can be rejected' 
      }, { status: 400 });
    }
    
    // Update article status
    const result = await query(
      `UPDATE articles 
       SET workflow_status = 'rejected', 
           reviewed_at = CURRENT_TIMESTAMP, 
           reviewer_id = ?,
           rejection_reason = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? 
       RETURNING *`,
      [session.user.id, reason, id]
    );
    
    return Response.json({ 
      article: result.rows[0],
      message: 'Article rejected with feedback'
    });
  } catch (error) {
    console.error('Error rejecting article:', error);
    return Response.json({ error: 'Failed to reject article' }, { status: 500 });
  }
}
