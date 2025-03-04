import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const result = await query(`
      SELECT a.*, u.name as author_name 
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      ORDER BY a.created_at DESC
    `);
    
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
    const { title, content, image_path } = await request.json();
    
    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const result = await query(
      'INSERT INTO articles (title, author_id, content, image_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, session.user.id, content, image_path || null]
    );
    
    return Response.json({ article: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return Response.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
