import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Validate id is numeric
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }
    
    // Get article with author name
    const result = await query(
      `SELECT a.id, a.title, a.content, a.image_path, 
              a.created_at, a.updated_at, u.name as author_name
       FROM articles a
       JOIN users u ON a.author_id = u.id
       WHERE a.id = ? AND a.status = 'published'`,
      [id]
    );
    
    // If no article found or not published
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json({ article: result.rows[0] });
  } catch (error) {
    console.error('Error fetching public article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
