import Link from 'next/link';

export const metadata = {
  title: 'API Documentation - APUDSI News',
  description: 'Documentation for the APUDSI News API',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <header className="bg-[#191970] text-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold">APUDSI News API</h1>
            </Link>
          </div>
          <nav>
            <Link href="/" className="text-white hover:text-white/80">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose max-w-none">
          <h1>API Documentation</h1>
          <p className="lead">
            This documentation will help you integrate with the APUDSI News API to access published news articles.
          </p>

          <section className="my-8">
            <h2>Authentication</h2>
            <p>
              Currently, the public API endpoints don't require authentication. However, this may change in the future.
            </p>
          </section>

          <section className="my-8">
            <h2>Base URL</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
              {`${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/api/public`}
            </pre>
          </section>

          <section className="my-8">
            <h2>Endpoints</h2>
            
            <h3 className="mt-6">Get Articles</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
              GET /api/public/articles
            </pre>
            <p>Retrieves a list of published articles.</p>
            
            <h4>Query Parameters</h4>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">page</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">integer</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Page number (default: 1)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">limit</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">integer</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Number of articles per page (default: 10, max: 50)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">search</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">string</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Search query for article title or content</td>
                </tr>
              </tbody>
            </table>
            
            <h4 className="mt-4">Response</h4>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
{`{
  "articles": [
    {
      "id": 1,
      "title": "Sample Article",
      "content": "Content of the article...",
      "image_path": "/uploads/sample-image.jpg",
      "author_name": "John Doe",
      "created_at": "2023-05-15T10:30:00Z",
      "updated_at": "2023-05-15T10:30:00Z"
    },
    // More articles...
  ],
  "pagination": {
    "total": 100,
    "pages": 10,
    "page": 1,
    "limit": 10
  }
}`}
            </pre>
            
            <h3 className="mt-8">Get Article by ID</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
              GET /api/public/articles/{'{id}'}
            </pre>
            <p>Retrieves a specific published article by its ID.</p>
            
            <h4>Response</h4>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
{`{
  "article": {
    "id": 1,
    "title": "Sample Article",
    "content": "Content of the article...",
    "image_path": "/uploads/sample-image.jpg",
    "author_name": "John Doe",
    "created_at": "2023-05-15T10:30:00Z",
    "updated_at": "2023-05-15T10:30:00Z"
  }
}`}
            </pre>
          </section>

          <section className="my-8">
            <h2>Error Handling</h2>
            <p>
              The API uses standard HTTP status codes to indicate the success or failure of requests. 
              In case of an error, the response will contain an error message.
            </p>
            
            <h4>Example Error Response</h4>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
{`{
  "error": "Article not found"
}`}
            </pre>
            
            <h4>Common Status Codes</h4>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Code</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">200</td>
                  <td className="px-6 py-4 text-sm text-gray-500">OK - The request was successful</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">400</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Bad Request - The request was invalid</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">404</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Not Found - The requested resource was not found</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">500</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Internal Server Error - Something went wrong on the server</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="my-8">
            <h2>Example Usage</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
{`// JavaScript fetch example
fetch('${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/api/public/articles')
  .then(response => response.json())
  .then(data => {
    console.log(data.articles);
  })
  .catch(error => console.error('Error:', error));`}
            </pre>
            
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm mt-4">
{`// Python requests example
import requests

response = requests.get('${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/api/public/articles')
data = response.json()
articles = data['articles']
print(articles)`}
            </pre>
          </section>
        </div>
      </main>

      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="text-gray-500">
            © {new Date().getFullYear()} APUDSI News API
          </div>
          <div className="flex space-x-6">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <Link href="/login" className="text-gray-500 hover:text-gray-700">
              CMS Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
