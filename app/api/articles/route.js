import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const workflow_status = url.searchParams.get('workflow_status');

    let whereClause = '';
    const params = [];

    // Add filters if provided
    if (status) {
      whereClause += ' WHERE a.status = ?';
      params.push(status);
    }

    if (workflow_status) {
      whereClause += whereClause ? ' AND a.workflow_status = ?' : ' WHERE a.workflow_status = ?';
      params.push(workflow_status);
    }

    const result = await query(`
      SELECT a.*, u.name as author_name 
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      ${whereClause}
      ORDER BY a.created_at DESC
    `, params);
    
    return Response.json({ articles: result.rows });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return Response.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { title, content, image_path, status = 'draft' } = await request.json();
    
    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO articles (
        title, 
        author_id, 
        content, 
        image_path, 
        status,
        workflow_status
      ) VALUES (?, ?, ?, ?, ?, ?) 
      RETURNING *`,
      [
        title, 
        session.user.id, 
        content, 
        image_path || null, 
        status,
        status === 'published' && session.user.role === 'superuser' ? 'published' : 'draft'
      ]
    );
    
    return Response.json({ article: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return Response.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
