import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { ROLE_HIERARCHY } from '@/lib/roles';
import { checkPermission } from '@/lib/middleware/permissions';

// Get all users (superuser only)
export async function GET() {
  const permissionCheck = await checkPermission('manageUsers');
  
  if (!permissionCheck.allowed) {
    return Response.json({ error: permissionCheck.error }, { status: permissionCheck.status });
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

// Create a new user
export async function POST(request) {
  const permissionCheck = await checkPermission('manageUsers');
  
  if (!permissionCheck.allowed) {
    return Response.json({ error: permissionCheck.error }, { status: permissionCheck.status });
  }
  
  try {
    const { name, email, password, role } = await request.json();
    
    // Validate required fields
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Validate role
    if (!role || !ROLE_HIERARCHY.includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Check if email is already used
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return Response.json({ error: 'Email already in use' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id, name, email, role',
      [name || null, email, hashedPassword, role]
    );
    
    return Response.json({ user: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
