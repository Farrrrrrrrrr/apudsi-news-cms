import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Fetch media library items
export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Get media items with pagination
    const result = await query(`
      SELECT * FROM media_library
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    // Get total count for pagination
    const countResult = await query(`SELECT COUNT(*) as total FROM media_library`);
    const total = countResult.rows[0]?.total || 0;
    
    return NextResponse.json({
      media: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media library' }, { status: 500 });
  }
}

// Delete media item
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }
    
    // Check if user owns the media or is a superuser
    const mediaCheck = await query(
      'SELECT user_id FROM media_library WHERE id = ?',
      [id]
    );
    
    if (mediaCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    
    if (mediaCheck.rows[0].user_id !== session.user.id && session.user.role !== 'superuser') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Delete the media item
    await query('DELETE FROM media_library WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
