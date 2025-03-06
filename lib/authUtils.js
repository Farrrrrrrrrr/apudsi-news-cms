import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

/**
 * Get authenticated user from JWT token in cookies
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function getAuthUser() {
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
    console.error('Invalid JWT token:', error);
    return null;
  }
}

/**
 * Check if user has permission for a specific action on a resource
 * @param {Object} user - User object
 * @param {string} action - Action to check (create, read, update, delete, manage)
 * @param {string} resource - Resource to check against
 * @returns {boolean} True if user has permission, false otherwise
 */
export function can(user, action, resource) {
  // If no user or role, deny access
  if (!user || !user.role) return false;

  const permissions = {
    superuser: {
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
    },
    editor: {
      create: [],
      read: ['article', 'editor_stats'],
      update: ['article_review'],
      delete: [] 
    }
  };

  // Check if role has the permission
  const rolePermissions = permissions[user.role] || {};
  
  // Special case for superadmin
  if (user.role === 'superuser' && rolePermissions.manage?.includes('all')) {
    return true;
  }

  // Special case for own resources
  if (action.startsWith('own_') && resource.authorId === user.id) {
    return true;
  }
  
  return rolePermissions[action]?.includes(resource) || false;
}
