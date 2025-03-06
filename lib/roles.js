/**
 * Role definitions for the CMS
 * 
 * The CMS uses a role-based access control system with the following roles:
 * 
 * - superuser: Full administrative access to all features
 * - publisher: Can publish approved content and manage published articles
 * - editor: Can review, approve or reject submitted content
 * - writer: Can create articles and submit them for review
 */

// Role hierarchy (from highest to lowest)
export const ROLE_HIERARCHY = ['superuser', 'publisher', 'editor', 'writer'];

// Role descriptions for UI display
export const ROLE_DESCRIPTIONS = {
  superuser: 'Complete administrative access to all features and content',
  publisher: 'Can publish approved content and manage the publishing workflow',
  editor: 'Can review, approve or reject submitted content',
  writer: 'Can create articles and submit them for review'
};

// Permission check functions
export const hasPermission = {
  // Content management
  manageAllArticles: (role) => role === 'superuser',
  publishArticles: (role) => ['superuser', 'publisher'].includes(role),
  reviewArticles: (role) => ['superuser', 'editor', 'publisher'].includes(role),
  createArticles: () => true, // All roles can create articles

  // User management
  manageUsers: (role) => role === 'superuser',
  
  // System settings
  manageSettings: (role) => role === 'superuser',
  
  // Analytics
  viewAnalytics: (role) => ['superuser', 'publisher'].includes(role),
  
  // Check if user can manage a specific article
  manageArticle: (userRole, userId, article) => {
    // Superusers can manage all articles
    if (userRole === 'superuser') return true;
    
    // Other roles can only manage their own articles
    return article.author_id === userId;
  }
};

// Generate UI elements based on roles
export const getAvailableRolesForSelect = (currentUserRole) => {
  // Determine which roles a user can assign based on their role
  if (currentUserRole === 'superuser') {
    return ROLE_HIERARCHY;
  }
  
  // Other users can't assign roles
  return [];
};
