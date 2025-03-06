import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { query } from '../../../../lib/db.js';
import { SignJWT } from 'jose';

// Handle login requests
export async function POST(request) {
  try {
    // Parse JSON body
    const body = await request.json();
    const { email, password } = body || {};
    
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Find user
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Secret key for JWT
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-at-least-32-chars'
    );
    
    // Create JWT token
    const token = await new SignJWT({ 
      sub: user.id.toString(), 
      name: user.name, 
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);
    
    // Create response
    const responseData = { 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    
    // Create response object
    const response = Response.json(responseData);
    
    // Set cookie using cookies() API
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
