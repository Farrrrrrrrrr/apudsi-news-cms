import { query } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure route is not cached

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get article details
    const result = await query(`
      SELECT a.id, a.title, a.content, a.image_path, 
             a.created_at, a.updated_at, 
             u.name as author_name 
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      WHERE a.id = ? AND a.status = 'published'
    `, [id]);
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Get related articles
    const relatedArticlesResult = await query(`
      SELECT id, title, image_path,
             SUBSTRING(content, 1, 150) as excerpt
      FROM articles
      WHERE id != ? 
        AND status = 'published'
      ORDER BY created_at DESC
      LIMIT 3
    `, [id]);
    
    const relatedArticles = relatedArticlesResult.rows.map(article => ({
      ...article,
      // Clean excerpt by removing HTML tags
      excerpt: article.excerpt.replace(/<[^>]*>/g, '').trim() + '...'
    }));
    
    return Response.json({
      article: result.rows[0],
      relatedArticles
    });
  } catch (error) {
    console.error('Error fetching public article:', error);
    return Response.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
