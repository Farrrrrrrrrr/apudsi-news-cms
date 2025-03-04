import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Get single article
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      `SELECT a.*, u.name as author_name 
       FROM articles a 
       JOIN users u ON a.author_id = u.id 
       WHERE a.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return Response.json({ article: result.rows[0] });
  } catch (error) {
    console.error('Error fetching article:', error);
    return Response.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

// Update article
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const { title, content, image_path, status } = await request.json();
    
    // Only allow superuser or author to update
    const articleCheck = await query('SELECT author_id FROM articles WHERE id = $1', [id]);
    
    if (articleCheck.rows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }
    
    if (session.user.role !== 'superuser' && articleCheck.rows[0].author_id !== session.user.id) {
      return Response.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    const result = await query(
      `UPDATE articles 
       SET title = $1, content = $2, image_path = $3, status = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING *`,
      [title, content, image_path, status, id]
    );
    
    return Response.json({ article: result.rows[0] });
  } catch (error) {
    console.error('Error updating article:', error);
    return Response.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// Delete article
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.role !== 'superuser') {
    return Response.json({ error: 'Permission denied' }, { status: 403 });
  }
  
  try {
    const { id } = params;
    await query('DELETE FROM articles WHERE id = $1', [id]);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return Response.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
