import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Initialize stats object
    const stats = {
      pendingReview: 0,
      pendingPublishing: 0, 
      rejectedArticles: 0,
      myDrafts: 0
    };
    
    // Build different queries based on user role
    if (session.user.role === 'superuser' || session.user.role === 'editor') {
      // Get count of articles waiting for review
      const pendingReviewResult = await query(`
        SELECT COUNT(*) as count 
        FROM articles 
        WHERE workflow_status = 'in_review'
      `);
      stats.pendingReview = parseInt(pendingReviewResult.rows[0].count);
    }
    
    if (session.user.role === 'superuser' || session.user.role === 'publisher') {
      // Get count of articles ready to be published
      const pendingPublishingResult = await query(`
        SELECT COUNT(*) as count 
        FROM articles 
        WHERE workflow_status = 'approved'
      `);
      stats.pendingPublishing = parseInt(pendingPublishingResult.rows[0].count);
    }
    
    // Get count of user's rejected articles 
    const rejectedArticlesResult = await query(`
      SELECT COUNT(*) as count 
      FROM articles 
      WHERE workflow_status = 'rejected' 
      AND author_id = ?
    `, [session.user.id]);
    stats.rejectedArticles = parseInt(rejectedArticlesResult.rows[0].count);
    
    // Get count of user's drafts
    const myDraftsResult = await query(`
      SELECT COUNT(*) as count 
      FROM articles 
      WHERE workflow_status = 'draft' 
      AND author_id = ?
    `, [session.user.id]);
    stats.myDrafts = parseInt(myDraftsResult.rows[0].count);
    
    // Get recent workflow items
    let workflowItems = [];
    
    if (session.user.role === 'superuser') {
      // Superusers see all recent workflow activity
      const itemsResult = await query(`
        SELECT a.id as article_id, a.title, a.workflow_status as status, 
               a.updated_at, u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        ORDER BY a.updated_at DESC
        LIMIT 10
      `);
      workflowItems = itemsResult.rows;
    } else if (session.user.role === 'editor') {
      // Editors see articles in review and their own
      const itemsResult = await query(`
        SELECT a.id as article_id, a.title, a.workflow_status as status, 
               a.updated_at, u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.workflow_status = 'in_review' OR a.author_id = ?
        ORDER BY a.updated_at DESC
        LIMIT 10
      `, [session.user.id]);
      workflowItems = itemsResult.rows;
    } else if (session.user.role === 'publisher') {
      // Publishers see articles ready for publishing and their own
      const itemsResult = await query(`
        SELECT a.id as article_id, a.title, a.workflow_status as status, 
               a.updated_at, u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.workflow_status = 'approved' OR a.author_id = ?
        ORDER BY a.updated_at DESC
        LIMIT 10
      `, [session.user.id]);
      workflowItems = itemsResult.rows;
    } else {
      // Writers just see their own articles
      const itemsResult = await query(`
        SELECT a.id as article_id, a.title, a.workflow_status as status, 
               a.updated_at, u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.author_id = ?
        ORDER BY a.updated_at DESC
        LIMIT 10
      `, [session.user.id]);
      workflowItems = itemsResult.rows;
    }
    
    return Response.json({
      stats,
      items: workflowItems
    });
  } catch (error) {
    console.error('Error fetching workflow stats:', error);
    return Response.json({ error: 'Failed to fetch workflow statistics' }, { status: 500 });
  }
}