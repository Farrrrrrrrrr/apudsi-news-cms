import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { query } from './db.js';

// Permission checking utility
export const can = (user, action, resource) => {
  // If no user or role, deny access
  if (!user || !user.role) return false;

  const permissions = {
    superadmin: {
      // Superadmins can do anything
      manage: ['all'],
      create: ['article', 'user'],
      read: ['article', 'user', 'stats'],
      update: ['article', 'user', 'settings'],
      delete: ['article', 'user']
    },
    writer: {
      create: ['article'],
      read: ['article', 'limited_stats'],
      update: ['own_article'],
      delete: [] // Writers cannot delete articles
    },
    publisher: {
      create: [], // Publishers cannot create articles
      read: ['article', 'pending_article', 'publisher_stats'],
      update: ['article_status'],
      delete: [] // Publishers cannot delete articles
    }
  };

  // Check if role has the permission
  const rolePermissions = permissions[user.role] || {};
  
  // Special case for superadmin
  if (user.role === 'superadmin' && rolePermissions.manage?.includes('all')) {
    return true;
  }

  // Special case for own resources
  if (action.startsWith('own_') && resource.authorId === user.id) {
    return true;
  }
  
  return rolePermissions[action]?.includes(resource) || false;
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await query(
            'SELECT * FROM users WHERE email = ?',
            [credentials.email]
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-at-least-32-chars',
  debug: process.env.NODE_ENV === 'development',
};
