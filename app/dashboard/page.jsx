import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import WriterDashboard from '@/components/dashboards/WriterDashboard';
import EditorDashboard from '@/components/dashboards/EditorDashboard';
import PublisherDashboard from '@/components/dashboards/PublisherDashboard';
import SuperadminDashboard from '@/components/dashboards/SuperadminDashboard';
import DashboardLayout from '@/components/DashboardLayout';

export const metadata = {
  title: 'Dashboard - APUDSI News CMS',
  description: 'Content Management Dashboard',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Fetch role-specific dashboard data
  let dashboardData = {};
  
  switch (session.user.role) {
    case 'writer':
      // Get writer's statistics
      const writerStats = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE workflow_status = 'draft') as draft_count,
          COUNT(*) FILTER (WHERE workflow_status = 'in_review') as in_review_count,
          COUNT(*) FILTER (WHERE workflow_status = 'approved') as approved_count,
          COUNT(*) FILTER (WHERE workflow_status = 'published') as published_count,
          COUNT(*) as total_articles
        FROM articles
        WHERE author_id = ?
      `, [session.user.id]);
      
      // Get writer's recent articles
      const writerArticles = await query(`
        SELECT id, title, workflow_status, created_at, updated_at
        FROM articles
        WHERE author_id = ?
        ORDER BY updated_at DESC
        LIMIT 5
      `, [session.user.id]);
      
      dashboardData = {
        stats: writerStats.rows[0],
        recentArticles: writerArticles.rows
      };
      break;
      
    case 'editor':
      // Get editor statistics
      const editorStats = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE workflow_status = 'in_review') as to_review_count,
          COUNT(*) FILTER (WHERE workflow_status = 'approved' AND reviewer_id = ?) as reviewed_count
        FROM articles
      `, [session.user.id]);
      
      // Get articles pending review
      const pendingReviews = await query(`
        SELECT a.id, a.title, a.created_at, u.name as author_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.workflow_status = 'in_review' AND a.reviewer_id IS NULL
        ORDER BY a.created_at ASC
        LIMIT 10
      `);
      
      dashboardData = {
        stats: editorStats.rows[0],
        pendingReviews: pendingReviews.rows
      };
      break;
      
    case 'publisher':
      // Get publisher statistics
      const publisherStats = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE workflow_status = 'approved') as to_publish_count,
          COUNT(*) FILTER (WHERE workflow_status = 'published' AND publisher_id = ?) as published_count
        FROM articles
      `, [session.user.id]);
      
      // Get articles ready for publishing
      const readyToPublish = await query(`
        SELECT a.id, a.title, a.reviewed_at, u.name as author_name, ed.name as editor_name
        FROM articles a
        JOIN users u ON a.author_id = u.id
        JOIN users ed ON a.reviewer_id = ed.id
        WHERE a.workflow_status = 'approved' AND a.publisher_id IS NULL
        ORDER BY a.reviewed_at ASC
        LIMIT 10
      `);
      
      dashboardData = {
        stats: publisherStats.rows[0],
        readyToPublish: readyToPublish.rows
      };
      break;
      
    case 'superadmin':
      // Get system-wide statistics
      const systemStats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as user_count,
          COUNT(*) FILTER (WHERE workflow_status = 'draft') as draft_count,
          COUNT(*) FILTER (WHERE workflow_status = 'in_review') as in_review_count,
          COUNT(*) FILTER (WHERE workflow_status = 'approved') as ready_count,
          COUNT(*) FILTER (WHERE workflow_status = 'published') as published_count,
          COUNT(*) as total_articles
        FROM articles
      `);
      
      // Recent activity
      const recentActivity = await query(`
        (SELECT 
          a.id, 
          a.title, 
          'new_article' as activity_type, 
          u.name as user_name,
          a.created_at as activity_time
        FROM articles a
        JOIN users u ON a.author_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 5)
        
        UNION ALL
        
        (SELECT 
          a.id, 
          a.title, 
          'article_published' as activity_type, 
          u.name as user_name,
          a.published_at as activity_time
        FROM articles a
        JOIN users u ON a.publisher_id = u.id
        WHERE a.workflow_status = 'published' AND a.published_at IS NOT NULL
        ORDER BY a.published_at DESC
        LIMIT 5)
        
        ORDER BY activity_time DESC
        LIMIT 10
      `);
      
      dashboardData = {
        stats: systemStats.rows[0],
        recentActivity: recentActivity.rows
      };
      break;
  }

  // Render the appropriate dashboard based on user role
  return (
    <DashboardLayout user={session.user}>
      {session.user.role === 'writer' && <WriterDashboard data={dashboardData} />}
      {session.user.role === 'editor' && <EditorDashboard data={dashboardData} />}
      {session.user.role === 'publisher' && <PublisherDashboard data={dashboardData} />}
      {session.user.role === 'superadmin' && <SuperadminDashboard data={dashboardData} />}
    </DashboardLayout>
  );
}
