import { query } from './db';

// Cache permissions for 5 minutes to reduce database queries
const permissionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get permissions for a role from the database or cache
export async function getRolePermissions(role) {
  const cacheKey = `role-permissions-${role}`;
  const cachedPermissions = permissionsCache.get(cacheKey);
  
  if (cachedPermissions && cachedPermissions.expiry > Date.now()) {
    return cachedPermissions.permissions;
  }
  
  try {
    const result = await query(
      'SELECT permission FROM role_permissions WHERE role = ?',
      [role]
    );
    
    const permissions = result.rows.map(row => row.permission);
    
    // Cache the result
    permissionsCache.set(cacheKey, {
      permissions,
      expiry: Date.now() + CACHE_TTL
    });
    
    return permissions;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}

// Check if a user has permission to perform an action
export async function hasPermission(user, permission) {
  if (!user || !permission) return false;
  
  // Superuser always has all permissions
  if (user.role === 'superuser') return true;
  
  const permissions = await getRolePermissions(user.role);
  return permissions.includes(permission);
}

// Check if a user has permission to edit an article
export async function canEditArticle(user, article) {
  if (!user || !article) return false;
  
  // Superuser can edit any article
  if (user.role === 'superuser') return true;
  
  // Check if user is the author
  const isAuthor = article.author_id === user.id;
  
  if (isAuthor) {
    // Authors can edit their own articles if they have the permission
    return await hasPermission(user, 'edit_own_article');
  } else {
    // Non-authors need edit_any_article permission
    return await hasPermission(user, 'edit_any_article');
  }
}

// Middleware for checking permissions in API routes
export function withPermission(permission) {
  return async (req, res, next) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const hasRequiredPermission = await hasPermission(session.user, permission);
    
    if (!hasRequiredPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    return next();
  };
}

// Role-based authorization hook for client components
export function usePermission(permission) {
  const { data: session } = useSession();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkPermission = async () => {
      if (!session?.user) {
        setHasPermission(false);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/permissions?permission=${permission}`);
        const data = await response.json();
        setHasPermission(data.hasPermission);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkPermission();
  }, [session, permission]);
  
  return { hasPermission, loading };
}
