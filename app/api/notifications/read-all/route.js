import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { userId } = await request.json();
    
    // Ensure user can only mark their own notifications as read
    if (parseInt(userId) !== session.user.id && session.user.role !== 'superuser') {
      return Response.json({ error: 'You can only mark your own notifications as read' }, { status: 403 });
    }
    
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return Response.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}
