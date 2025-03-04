import { query, getById } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Get single user
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'superuser') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const result = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// Update user
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'superuser') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const { name, email, password, role } = await request.json();
    
    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (userCheck.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if email is already in use by another user
    if (email) {
      const emailCheck = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.rows.length > 0) {
        return Response.json({ error: 'Email already in use' }, { status: 400 });
      }
    }
    
    // Update with or without password
    if (password) {
      // If password provided, hash and update it
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        `UPDATE users 
         SET name = ?, email = ?, password = ?, role = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name || null, email, hashedPassword, role, id]
      );
    } else {
      // If no password, update other fields only
      await query(
        `UPDATE users 
         SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name || null, email, role, id]
      );
    }
    
    // Fetch updated user
    const user = await getById('users', id);
    const { password: _, ...userWithoutPassword } = user;
    
    return Response.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// Delete user
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'superuser') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    // Don't allow deleting yourself
    if (session.user.id === parseInt(id)) {
      return Response.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }
    
    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (userCheck.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Delete user
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
