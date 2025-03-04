import React from 'react';

export const metadata = {
  title: 'API Documentation - APUDSI News CMS',
  description: 'Documentation for the public APUDSI News API',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200 bg-[#191970] text-white">
            <h1 className="text-3xl font-bold">APUDSI News API Documentation</h1>
            <p className="mt-2 text-white/80">
              Use this API to integrate APUDSI news articles into your applications
            </p>
          </div>
          
          <div className="px-6 py-8">
            <h2 className="text-xl font-semibold text-[#191970] mb-4">Overview</h2>
            <p className="mb-6 text-gray-700">
              The APUDSI News API provides access to published news articles. 
              All endpoints are publicly accessible and rate-limited to {' '}
              <span className="font-semibold">60 requests per minute</span> per IP address.
            </p>
            
            <h2 className="text-xl font-semibold text-[#191970] mb-4 mt-10">Endpoints</h2>
            
            <div className="space-y-10">
              {/* List Articles Endpoint */}
              <div className="border rounded-md overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center">
                  <span className="font-mono text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">GET</span>
                  <span className="font-mono text-gray-800">/api/public/articles</span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#191970] mb-2">List Articles</h3>
                  <p className="text-gray-700 mb-4">Returns a paginated list of published news articles.</p>
                  
                  <h4 className="font-semibold text-gray-700 mt-4 mb-2">Query Parameters</h4>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li><code className="font-mono text-sm bg-gray-100 px-1">page</code> - Page number (default: 1)</li>
                    <li><code className="font-mono text-sm bg-gray-100 px-1">limit</code> - Items per page, max 50 (default: 10)</li>
                    <li><code className="font-mono text-sm bg-gray-100 px-1">search</code> - Search term to filter articles</li>
                  </ul>
                  
                  <h4 className="font-semibold text-gray-700 mt-4 mb-2">Response Format</h4>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
                    {`{
  "articles": [
    {
      "id": 1,
      "title": "Example Article",
      "excerpt": "This is a preview of the article content...",
      "image_path": "/uploads/image.jpg",
      "created_at": "2023-06-15T10:30:00.000Z",
      "updated_at": "2023-06-15T10:30:00.000Z",
      "author_name": "John Doe"
    },
    // More articles...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}`}
                  </pre>
                </div>
              </div>
              
              {/* Get Single Article Endpoint */}
              <div className="border rounded-md overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center">
                  <span className="font-mono text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">GET</span>
                  <span className="font-mono text-gray-800">/api/public/articles/{'{id}'}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#191970] mb-2">Get Single Article</h3>
                  <p className="text-gray-700 mb-4">Returns details of a specific published article.</p>
                  
                  <h4 className="font-semibold text-gray-700 mt-4 mb-2">Path Parameters</h4>
                  <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                    <li><code className="font-mono text-sm bg-gray-100 px-1">id</code> - Article ID (numeric)</li>
                  </ul>
                  
                  <h4 className="font-semibold text-gray-700 mt-4 mb-2">Response Format</h4>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
                    {`{
  "article": {
    "id": 1,
    "title": "Example Article",
    "content": "<p>Full article content with HTML formatting...</p>",
    "image_path": "/uploads/image.jpg",
    "created_at": "2023-06-15T10:30:00.000Z",
    "updated_at": "2023-06-15T10:30:00.000Z",
    "author_name": "John Doe"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-[#191970] mb-4 mt-10">Error Handling</h2>
            <p className="mb-4 text-gray-700">
              When an error occurs, the API will return an error response with an appropriate HTTP status code.
            </p>
            
            <pre className="bg-gray-800 text-red-400 p-4 rounded-md overflow-auto text-sm">
              {`{
  "error": "Error message describing what went wrong"
}`}
            </pre>
            
            <h3 className="text-lg font-semibold text-[#191970] mb-2 mt-6">Common Error Codes</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>400</strong> - Bad request, such as invalid parameters</li>
              <li><strong>404</strong> - Resource not found</li>
              <li><strong>429</strong> - Too many requests (rate limit exceeded)</li>
              <li><strong>500</strong> - Server error</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-[#191970] mb-4 mt-10">Usage Example</h2>
            <p className="mb-4 text-gray-700">Example of how to fetch articles using JavaScript:</p>
            
            <pre className="bg-gray-800 text-yellow-400 p-4 rounded-md overflow-auto text-sm">
              {`// Fetch list of articles
fetch('https://your-domain.com/api/public/articles?page=1&limit=10')
  .then(response => response.json())
  .then(data => {
    console.log(data.articles);
    console.log(data.pagination);
  })
  .catch(error => console.error('Error:', error));

// Fetch a specific article
fetch('https://your-domain.com/api/public/articles/1')
  .then(response => response.json())
  .then(data => {
    console.log(data.article);
  })
  .catch(error => console.error('Error:', error));`}
            </pre>
            
            <div className="mt-12 p-4 bg-[#191970]/10 rounded-md">
              <h3 className="font-semibold text-[#191970]">Need more help?</h3>
              <p className="text-gray-700">
                For additional assistance or to report issues with the API, please contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
