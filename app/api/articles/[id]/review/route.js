import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only editors and superusers can review articles
  if (session.user.role !== 'editor' && session.user.role !== 'superuser') {
    return Response.json({ error: 'Only editors can review articles' }, { status: 403 });
  }
  
  try {
    const { id } = params;
    const { decision, feedback } = await request.json();
    
    // Check if decision is valid
    if (decision !== 'approve' && decision !== 'reject') {
      return Response.json({ error: 'Invalid review decision' }, { status: 400 });
    }
    
    // Check if article exists and is in the right state
    const articleCheck = await query(
      'SELECT author_id, title, workflow_status FROM articles WHERE id = ?', 
      [id]
    );
    
    if (articleCheck.rows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const article = articleCheck.rows[0];
    
    // Check if article is in review state
    if (article.workflow_status !== 'in_review') {
      return Response.json({ error: 'Only articles in review can be approved or rejected' }, { status: 400 });
    }
    
    // Update article based on decision
    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    
    await query(
      `UPDATE articles 
       SET workflow_status = ?, 
           reviewer_id = ?,
           review_feedback = ?,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, session.user.id, feedback || null, id]
    );
    
    // Create notification for the author
    await query(
      'INSERT INTO notifications (user_id, message, article_id) VALUES (?, ?, ?)',
      [
        article.author_id,
        decision === 'approve' 
          ? `Your article "${article.title}" has been approved` 
          : `Your article "${article.title}" needs revisions`,
        id
      ]
    );
    
    // If approved, also notify publishers
    if (decision === 'approve') {
      const publishers = await query(
        "SELECT id FROM users WHERE role = 'publisher' OR role = 'superuser'"
      );
      
      for (const publisher of publishers.rows) {
        // Don't duplicate notification for superusers who are also reviewers
        if (publisher.id !== session.user.id) {
          await query(
            'INSERT INTO notifications (user_id, message, article_id) VALUES (?, ?, ?)',
            [publisher.id, `Article "${article.title}" is ready for publishing`, id]
          );
        }
      }
    }
    
    return Response.json({
      success: true,
      message: decision === 'approve' 
        ? 'Article approved successfully' 
        : 'Article returned for revisions'
    });
  } catch (error) {
    console.error('Error reviewing article:', error);
    return Response.json({ error: 'Failed to process review' }, { status: 500 });
  }
}
