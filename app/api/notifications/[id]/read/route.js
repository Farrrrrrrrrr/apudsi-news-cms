import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    // Verify ownership of notification
    const notificationCheck = await query(
      'SELECT user_id FROM notifications WHERE id = ?',
      [id]
    );
    
    if (notificationCheck.rows.length === 0) {
      return Response.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    if (notificationCheck.rows[0].user_id !== session.user.id) {
      return Response.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Mark notification as read
    await query(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [id]
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return Response.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
