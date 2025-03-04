import { query, insert } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Get users - only accessible by superusers
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'superuser') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const result = await query(`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    return Response.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Create user - only accessible by superusers
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'superuser') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { name, email, password, role } = await request.json();
    
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return Response.json({ error: 'Email already in use' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const user = await insert('users', {
      name: name || null,
      email,
      password: hashedPassword,
      role: role || 'editor'
    });
    
    const { password: _, ...userWithoutPassword } = user;
    return Response.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
