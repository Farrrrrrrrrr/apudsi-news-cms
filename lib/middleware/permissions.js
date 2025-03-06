import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/roles';
import { query } from '@/lib/db';

/**
 * Check if the current session has a specific permission
 */
export async function checkPermission(permission, params = {}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { 
      allowed: false, 
      status: 401, 
      error: 'Unauthorized' 
    };
  }
  
  const { role, id } = session.user;
  
  // Handle permission with article ownership check
  if (permission === 'manageArticle' && params.articleId) {
    try {
      const result = await query('SELECT * FROM articles WHERE id = ?', [params.articleId]);
      if (result.rows.length === 0) {
        return { allowed: false, status: 404, error: 'Article not found' };
      }
      
      const article = result.rows[0];
      const allowed = hasPermission.manageArticle(role, id, article);
      
      return {
        allowed,
        status: allowed ? 200 : 403,
        error: allowed ? null : 'You do not have permission to manage this article',
        article
      };
    } catch (error) {
      console.error('Error checking article permission:', error);
      return { allowed: false, status: 500, error: 'Server error' };
    }
  }
  
  // Handle general permissions
  if (typeof hasPermission[permission] === 'function') {
    const allowed = hasPermission[permission](role);
    return {
      allowed,
      status: allowed ? 200 : 403,
      error: allowed ? null : `You do not have the ${permission} permission`
    };
  }
  
  // Unknown permission
  return {
    allowed: false,
    status: 400,
    error: `Unknown permission: ${permission}`
  };
}

/**
 * Check if current user has the required roles
 */
export async function checkRoles(allowedRoles) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { 
      allowed: false, 
      status: 401, 
      error: 'Unauthorized' 
    };
  }
  
  const { role } = session.user;
  
  const allowed = allowedRoles.includes(role);
  return {
    allowed,
    status: allowed ? 200 : 403,
    error: allowed ? null : 'You do not have the required role for this action'
  };
}
