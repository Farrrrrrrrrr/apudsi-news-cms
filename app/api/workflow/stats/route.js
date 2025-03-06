import { cookies } from 'next/headers';
import { query } from '../../../../lib/db';
import { jwtVerify } from 'jose';

// Get user from JWT token
async function getUserFromToken() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const secretKey = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-at-least-32-chars'
    );
    
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

export async function GET() {
  try {
    const user = await getUserFromToken();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get workflow stats based on user role
    const stats = { 
      pendingReview: 0,
      pendingPublishing: 0,
      rejectedArticles: 0,
      myDrafts: 0
    };
    
    const items = [];
    
    // Different queries based on user role
    if (user.role === 'editor' || user.role === 'superuser') {
      // Get pending review count
      const reviewResult = await query(
        'SELECT COUNT(*) as count FROM articles WHERE workflow_status = ?',
        ['in_review']
      );
      stats.pendingReview = reviewResult.rows[0]?.count || 0;
    }
    
    if (user.role === 'publisher' || user.role === 'superuser') {
      // Get pending publishing count
      const publishResult = await query(
        'SELECT COUNT(*) as count FROM articles WHERE workflow_status = ?',
        ['approved']
      );
      stats.pendingPublishing = publishResult.rows[0]?.count || 0;
    }
    
    // Get rejected articles count
    const rejectedResult = await query(
      'SELECT COUNT(*) as count FROM articles WHERE workflow_status = ? AND author_id = ?',
      ['rejected', user.id]
    );
    stats.rejectedArticles = rejectedResult.rows[0]?.count || 0;
    
    // Get my drafts count
    const draftsResult = await query(
      'SELECT COUNT(*) as count FROM articles WHERE status = ? AND author_id = ?',
      ['draft', user.id]
    );
    stats.myDrafts = draftsResult.rows[0]?.count || 0;
    
    // Get recent workflow activity items
    let recentActivityQuery = '';
    let queryParams = [];
    
    if (user.role === 'superuser') {
      // All recent workflow changes for superuser
      recentActivityQuery = `
        SELECT a.id as article_id, a.title, a.workflow_status as status, a.updated_at, 
               u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.workflow_status != 'draft'
        ORDER BY a.updated_at DESC
        LIMIT 10
      `;
    } else if (user.role === 'editor') {
      // Articles pending review for editors
      recentActivityQuery = `
        SELECT a.id as article_id, a.title, a.workflow_status as status, a.updated_at, 
               u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.workflow_status = 'in_review'
        ORDER BY a.updated_at DESC
        LIMIT 10
      `;
      queryParams = ['in_review'];
    } else if (user.role === 'publisher') {
      // Approved articles for publishers
      recentActivityQuery = `
        SELECT a.id as article_id, a.title, a.workflow_status as status, a.updated_at, 
               u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.workflow_status = 'approved'
        ORDER BY a.updated_at DESC
        LIMIT 10
      `;
      queryParams = ['approved'];
    } else {
      // User's own articles
      recentActivityQuery = `
        SELECT a.id as article_id, a.title, a.workflow_status as status, a.updated_at, 
               u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.author_id = ?
        ORDER BY a.updated_at DESC
        LIMIT 10
      `;
      queryParams = [user.id];
    }
    
    // Execute the activity query
    const activityResult = await query(recentActivityQuery, queryParams);
    
    return Response.json({
      stats,
      items: activityResult.rows || []
    });
    
  } catch (error) {
    console.error('Error fetching workflow stats:', error);
    return Response.json({ error: 'Failed to fetch workflow stats' }, { status: 500 });
  }
}