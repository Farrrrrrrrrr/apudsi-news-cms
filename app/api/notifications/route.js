import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Get notifications for the current user
export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // Ensure user can only access their own notifications
    if (userId !== session.user.id.toString() && session.user.role !== 'superuser') {
      return Response.json({ error: 'You can only access your own notifications' }, { status: 403 });
    }
    
    const result = await query(`
      SELECT n.*, a.title as article_title
      FROM notifications n
      LEFT JOIN articles a ON n.article_id = a.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 20
    `, [userId]);
    
    return Response.json({ notifications: result.rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// Mark notification as read
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return Response.json({ error: 'Notification ID is required' }, { status: 400 });
    }
    
    // Ensure the notification belongs to the user
    const notificationCheck = await query(
      'SELECT user_id FROM notifications WHERE id = ?',
      [id]
    );
    
    if (notificationCheck.rows.length === 0) {
      return Response.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    if (notificationCheck.rows[0].user_id !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return Response.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
