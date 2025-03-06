import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only publishers and superusers can publish articles
  if (session.user.role !== 'publisher' && session.user.role !== 'superuser') {
    return Response.json({ error: 'Only publishers can publish articles' }, { status: 403 });
  }
  
  try {
    const { id } = params;
    
    // Check if article exists and is in the right state
    const articleCheck = await query(
      'SELECT author_id, title, workflow_status FROM articles WHERE id = ?', 
      [id]
    );
    
    if (articleCheck.rows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }
    
    const article = articleCheck.rows[0];
    
    // Check if article is approved
    if (article.workflow_status !== 'approved') {
      return Response.json({ error: 'Only approved articles can be published' }, { status: 400 });
    }
    
    // Update article status
    await query(
      `UPDATE articles 
       SET status = 'published', 
           workflow_status = 'published',
           publisher_id = ?,
           published_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [session.user.id, id]
    );
    
    // Create notification for the author
    await query(
      'INSERT INTO notifications (user_id, message, article_id) VALUES (?, ?, ?)',
      [
        article.author_id,
        `Your article "${article.title}" has been published`,
        id
      ]
    );
    
    return Response.json({
      success: true,
      message: 'Article published successfully'
    });
  } catch (error) {
    console.error('Error publishing article:', error);
    return Response.json({ error: 'Failed to publish article' }, { status: 500 });
  }
}
