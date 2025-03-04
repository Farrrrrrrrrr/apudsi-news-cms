import Link from 'next/link';
import { query } from '../lib/db.js';

export const metadata = {
  title: 'APUDSI News - Home',
  description: 'Welcome to APUDSI News Portal',
};

export default async function HomePage() {
  // Fetch latest published articles
  // Use a safer query that checks if the column exists first
  let articles = [];
  
  try {
    // First try with image_path column
    const articlesResult = await query(`
      SELECT a.id, a.title, a.image_path, SUBSTRING(a.content, 1, 200) AS excerpt, 
             a.created_at, u.name as author_name
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    articles = articlesResult.rows.map(article => ({
      ...article,
      // Strip HTML tags from excerpt
      excerpt: article.excerpt.replace(/<[^>]*>/g, '').trim() + '...',
    }));
  } catch (error) {
    console.error('Error fetching articles, trying fallback query:', error);
    
    // Fallback query without image_path column
    try {
      const fallbackResult = await query(`
        SELECT a.id, a.title, SUBSTRING(a.content, 1, 200) AS excerpt, 
               a.created_at, u.name as author_name
        FROM articles a 
        JOIN users u ON a.author_id = u.id 
        WHERE a.status = 'published'
        ORDER BY a.created_at DESC
        LIMIT 5
      `);
      
      articles = fallbackResult.rows.map(article => ({
        ...article,
        image_path: null,
        excerpt: article.excerpt.replace(/<[^>]*>/g, '').trim() + '...',
      }));
    } catch (fallbackError) {
      console.error('Fallback query failed:', fallbackError);
    }
  }

  return (
    <div>
      <header className="bg-[#191970] text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-center">
            APUDSI News Portal
          </h1>
          <p className="mt-4 text-xl text-center max-w-3xl mx-auto">
            A demonstration of the NextJS CMS with a public API for accessing news articles
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/api/public/docs"
              className="inline-block bg-[#880808] rounded-md py-3 px-8 font-medium text-white hover:bg-[#880808]/90"
            >
              API Documentation
            </Link>
            <Link
              href="/login"
              className="ml-4 inline-block bg-white/20 rounded-md py-3 px-8 font-medium text-white hover:bg-white/30"
            >
              CMS Login
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-3xl font-bold text-[#191970] mb-6">Latest Articles</h2>
          
          {articles.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {article.image_path && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={article.image_path}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-[#191970] mb-2">{article.title}</h3>
                    <div className="text-sm text-gray-500 mb-4">
                      By {article.author_name} • {new Date(article.created_at).toLocaleDateString()}
                    </div>
                    <p className="text-gray-700 mb-4">{article.excerpt}</p>
                    <Link
                      href={`/articles/${article.id}`}
                      className="text-[#880808] hover:text-[#880808]/80 font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">No articles published yet.</p>
            </div>
          )}
        </section>
        
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-[#191970] mb-6">Accessing the API</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="mb-4">
              You can access our news articles programmatically using our public API. Here's a quick example:
            </p>
            
            <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-auto text-sm">
              {`// Fetch the latest published articles
fetch('${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/api/public/articles')
  .then(response => response.json())
  .then(data => {
    // Process the articles data
    console.log(data.articles);
  });`}
            </pre>
            
            <div className="mt-6">
              <Link
                href="/api/public/docs"
                className="inline-flex items-center text-[#191970] hover:text-[#191970]/80 font-medium"
              >
                See full API documentation
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="text-gray-500">
            © {new Date().getFullYear()} APUDSI News CMS
          </div>
          <div>
            <Link href="/login" className="text-gray-500 hover:text-gray-700">
              CMS Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
