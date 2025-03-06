import Link from 'next/link';

export default function ArticlesTable({ articles, userRole }) {
  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge color based on status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get workflow status badge color
  const getWorkflowBadge = (status) => {
    switch(status) {
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      default:
        return ''; // No badge for draft
    }
  };
  
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No articles found
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {(userRole === 'editor' || userRole === 'publisher' || userRole === 'superuser') && (
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Workflow
              </th>
            )}
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-[#191970]">
                  <Link href={`/admin/articles/${article.id}`} className="hover:underline">
                    {article.title}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-500">{article.author_name}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(article.status)}`}>
                  {article.status}
                </span>
              </td>
              {(userRole === 'editor' || userRole === 'publisher' || userRole === 'superuser') && (
                <td className="px-4 py-3 whitespace-nowrap">
                  {article.workflow_status && article.workflow_status !== 'draft' && (
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkflowBadge(article.workflow_status)}`}>
                      {article.workflow_status.replace('_', ' ')}
                    </span>
                  )}
                </td>
              )}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(article.updated_at)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/admin/articles/${article.id}`} className="text-[#191970] hover:text-[#191970]/80 mr-2">
                  View
                </Link>
                {(userRole === 'superuser' || 
                  (article.author_id === userRole.id && article.status === 'draft')) && (
                  <Link href={`/admin/articles/${article.id}/edit`} className="text-[#191970] hover:text-[#191970]/80">
                    Edit
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
