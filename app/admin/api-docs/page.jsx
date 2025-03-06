import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';

export const metadata = {
  title: 'API Documentation - APUDSI News CMS',
  description: 'API documentation for APUDSI News CMS',
};

export default async function ApiDocsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  // Only superadmin can access this page
  if (session.user.role !== 'superadmin') {
    redirect('/admin');
  }
  
  // Get the base URL for examples
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yourdomain.com';

  return (
    <AdminLayout user={session.user}>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#191970]">API Documentation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Available endpoints and usage instructions for the APUDSI News API
          </p>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Introduction</h2>
          <p className="mb-6">
            The APUDSI News API provides programmatic access to articles and related data.
            This documentation describes the available endpoints and how to use them.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h3 className="font-semibold mb-2">Base URL</h3>
            <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm">
              {baseUrl}/api
            </code>
            
            <h3 className="font-semibold mt-4 mb-2">Authentication</h3>
            <p className="text-sm text-gray-700">
              API requests must include an API key in the Authorization header:
            </p>
            <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm mt-2">
              {`Authorization: Bearer YOUR_API_KEY`}
            </pre>
          </div>
          
          {/* Article Endpoints */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Article Endpoints</h2>
            
            {/* Get Articles */}
            <div className="mb-6 border-b pb-6">
              <div className="flex items-center mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono mr-2">GET</span>
                <h3 className="text-lg font-semibold">/api/articles</h3>
              </div>
              
              <p className="mb-4 text-gray-700">Returns a list of published articles.</p>
              
              <h4 className="font-semibold text-sm uppercase text-gray-500 mb-2">Parameters</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-2 text-sm">limit</td>
                      <td className="px-4 py-2 text-sm">Integer</td>
                      <td className="px-4 py-2 text-sm">Maximum number of articles to return (default: 10)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm">offset</td>
                      <td className="px-4 py-2 text-sm">Integer</td>
                      <td className="px-4 py-2 text-sm">Number of articles to skip (for pagination)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm">category</td>
                      <td className="px-4 py-2 text-sm">String</td>
                      <td className="px-4 py-2 text-sm">Filter by category (optional)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h4 className="font-semibold text-sm uppercase text-gray-500 mt-4 mb-2">Example Request</h4>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm">
{`curl -X GET "${baseUrl}/api/articles?limit=5&offset=0" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </pre>
              
              <h4 className="font-semibold text-sm uppercase text-gray-500 mt-4 mb-2">Example Response</h4>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-auto">
{`{
  "articles": [
    {
      "id": 1,
      "title": "Example Article Title",
      "excerpt": "This is a short excerpt from the article...",
      "author_name": "John Doe",
      "created_at": "2023-05-20T15:30:00Z",
      "image_path": "/uploads/example-image.jpg"
    },
    // More articles...
  ],
  "pagination": {
    "total": 42,
    "limit": 5,
    "offset": 0,
    "totalPages": 9
  }
}`}
              </pre>
            </div>
            
            {/* Get Single Article */}
            <div className="mb-6 border-b pb-6">
              <div className="flex items-center mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono mr-2">GET</span>
                <h3 className="text-lg font-semibold">/api/articles/:id</h3>
              </div>
              
              <p className="mb-4 text-gray-700">Returns a single article by ID.</p>
              
              <h4 className="font-semibold text-sm uppercase text-gray-500 mb-2">Parameters</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-2 text-sm">id</td>
                      <td className="px-4 py-2 text-sm">Integer</td>
                      <td className="px-4 py-2 text-sm">Article ID</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h4 className="font-semibold text-sm uppercase text-gray-500 mt-4 mb-2">Example Request</h4>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm">
{`curl -X GET "${baseUrl}/api/articles/1" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </pre>
              
              <h4 className="font-semibold text-sm uppercase text-gray-500 mt-4 mb-2">Example Response</h4>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-auto">
{`{
  "article": {
    "id": 1,
    "title": "Example Article Title",
    "content": "<p>Full HTML content of the article...</p>",
    "author_name": "John Doe",
    "created_at": "2023-05-20T15:30:00Z",
    "image_path": "/uploads/example-image.jpg"
  }
}`}
              </pre>
            </div>
          </div>
          
          {/* API Keys */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Managing API Keys</h2>
            
            <p className="mb-4 text-gray-700">
              API keys can be generated and managed through the admin interface.
              Only superadmins can create and revoke API keys.
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Keep your API keys secure. Do not share them in publicly accessible areas or client-side code.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rate Limiting */}
          <div>
            <h2 className="text-xl font-bold mb-4">Rate Limiting</h2>
            
            <p className="mb-4 text-gray-700">
              To ensure fair usage and system stability, API requests are subject to rate limiting:
            </p>
            
            <ul className="list-disc list-inside mb-4 text-gray-700">
              <li className="mb-2">100 requests per minute per API key</li>
              <li className="mb-2">1,000 requests per hour per API key</li>
              <li className="mb-2">10,000 requests per day per API key</li>
            </ul>
            
            <p className="text-gray-700">
              If you exceed these limits, you'll receive a <code className="bg-gray-100 px-1 py-0.5 rounded">429 Too Many Requests</code> response.
              The response will include a <code className="bg-gray-100 px-1 py-0.5 rounded">Retry-After</code> header indicating when you can resume making requests.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
