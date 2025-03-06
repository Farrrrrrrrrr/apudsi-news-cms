import { cookies } from 'next/headers';
import { query } from '../../../lib/db';
import { jwtVerify } from 'jose';

// Get auth token and verify user from cookies
async function getUserFromToken(req) {
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

// Get notifications for the current user
export async function GET(request) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;
    
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unread') === 'true';
    
    // SQL query with parameters
    const sqlQuery = `
      SELECT id, message, link, is_read, created_at, type
      FROM notifications
      WHERE user_id = ?
      ${unreadOnly ? 'AND is_read = 0' : ''}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    // Get notifications
    const results = await query(sqlQuery, [userId, limit, offset]);
    
    // Count total notifications and unread for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread FROM notifications WHERE user_id = ?',
      [userId]
    );
    
    const total = countResult.rows[0]?.total || 0;
    const unreadCount = countResult.rows[0]?.unread || 0;
    
    return Response.json({
      notifications: results.rows,
      pagination: {
        total,
        unreadCount,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// Mark notifications as read
export async function PUT(request) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { ids, all = false } = await request.json();
    
    if (all) {
      // Mark all notifications as read
      await query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        [user.id]
      );
      
      return Response.json({ success: true });
    }
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'No notification IDs provided' }, { status: 400 });
    }
    
    // Build placeholders for SQL query
    const placeholders = ids.map(() => '?').join(',');
    
    // Mark specified notifications as read
    await query(
      `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders}) AND user_id = ?`,
      [...ids, user.id]
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return Response.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
