import { getServerSession } from 'next-auth/next';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Get single media item
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM media WHERE id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }
    
    return Response.json({ media: result.rows[0] });
  } catch (error) {
    console.error('Error fetching media:', error);
    return Response.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// Delete media item
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    // Get media file info
    const mediaResult = await query(
      'SELECT filepath, user_id FROM media WHERE id = ?', 
      [id]
    );
    
    if (mediaResult.rows.length === 0) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }
    
    const mediaFile = mediaResult.rows[0];
    
    // Only allow the owner or superadmin to delete
    if (mediaFile.user_id !== session.user.id && session.user.role !== 'superadmin') {
      return Response.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Delete from database
    await query('DELETE FROM media WHERE id = ?', [id]);
    
    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', mediaFile.filepath);
      await unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue even if file deletion fails (might be already deleted)
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return Response.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}

// Update media metadata
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const { alt_text } = await request.json();
    
    // Check ownership
    const mediaResult = await query(
      'SELECT user_id FROM media WHERE id = ?', 
      [id]
    );
    
    if (mediaResult.rows.length === 0) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }
    
    const mediaFile = mediaResult.rows[0];
    
    // Only allow the owner or superadmin to update
    if (mediaFile.user_id !== session.user.id && session.user.role !== 'superadmin') {
      return Response.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Update metadata
    await query(
      'UPDATE media SET alt_text = ? WHERE id = ?',
      [alt_text, id]
    );
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating media:', error);
    return Response.json({ error: 'Failed to update media' }, { status: 500 });
  }
}
