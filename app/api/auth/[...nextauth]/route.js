import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '../../../../lib/db.js';
import { SignJWT, jwtVerify } from 'jose';

// Create a simple manual auth handler for credentials
// This replaces the NextAuth implementation with a custom one since we're having import issues

// Configuration constants
const SECRET = process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-at-least-32-chars';
const COOKIE_NAME = 'auth-token';

// Helper to encode the secret key
const secretKey = new TextEncoder().encode(SECRET);

// POST handler for login
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
    
    // Create JWT token using jose
    const token = await new SignJWT({ 
      sub: user.id.toString(), 
      name: user.name, 
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secretKey);
    
    // Create response
    const response = Response.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
    // Set cookie using headers
    const cookieValue = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
    response.headers.set('Set-Cookie', cookieValue);
    
    return response;
    
  } catch (error) {
    console.error('Authentication error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// GET handler for session
export async function GET(request) {
  try {
    // Get cookies from request headers
    const cookies = request.headers.get('cookie') || '';
    const cookieMap = Object.fromEntries(
      cookies.split(';').map(cookie => {
        const [key, value] = cookie.trim().split('=');
        return [key, value];
      })
    );
    
    const token = cookieMap[COOKIE_NAME];
    
    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Verify token
    try {
      const { payload } = await jwtVerify(token, secretKey);
      
      // Return user data
      return Response.json({
        user: {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role
        }
      });
    } catch (jwtError) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Session verification error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
