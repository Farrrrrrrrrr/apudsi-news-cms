import Link from 'next/link';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    const result = await query(
      `SELECT title FROM articles 
       WHERE id = ? AND status = 'published'`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return {
        title: 'Article Not Found',
      };
    }
    
    return {
      title: `${result.rows[0].title} - APUDSI News`,
      description: `Read the full article: ${result.rows[0].title}`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Article - APUDSI News',
    };
  }
}

export default async function ArticlePage({ params }) {
  const { id } = params;
  
  try {
    const result = await query(
      `SELECT a.*, u.name as author_name
       FROM articles a
       JOIN users u ON a.author_id = u.id
       WHERE a.id = ? AND a.status = 'published'`,
      [id]
    );
    
    if (result.rows.length === 0) {
      notFound();
    }
    
    const article = result.rows[0];
    
    // Format date for display
    const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Get related articles
    const relatedArticles = await query(
      `SELECT id, title, image_path 
       FROM articles 
       WHERE status = 'published' 
       AND id != ? 
       ORDER BY created_at DESC 
       LIMIT 3`,
      [id]
    );
    
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-[#191970] text-white">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link href="/" className="text-white hover:text-white/90 font-bold text-xl">
                APUDSI News
              </Link>
              <span className="mx-3 text-white/30">|</span>
              <Link href="/" className="text-white/80 hover:text-white">
                Home
              </Link>
            </div>
          </div>
        </header>
        
        <main className="flex-grow">
          <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-[#191970] sm:text-4xl mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center text-gray-600 mb-8">
              <span className="mr-4">By {article.author_name}</span>
              <span>Published on {formattedDate}</span>
            </div>
            
            {article.image_path && (
              <div className="mb-8">
                <img
                  src={article.image_path}
                  alt={article.title}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}
            
            <div 
              className="prose prose-lg max-w-none prose-headings:text-[#191970] prose-a:text-[#880808]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
          
          {/* Related Articles */}
          {relatedArticles.rows.length > 0 && (
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-[#191970] mb-6">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedArticles.rows.map(article => (
                  <Link key={article.id} href={`/articles/${article.id}`} className="block group">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow group-hover:shadow-lg">
                      {article.image_path && (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={article.image_path}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-[#191970] group-hover:text-[#880808]">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
        
        <footer className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="text-gray-500">
              © {new Date().getFullYear()} APUDSI News
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
  } catch (error) {
    console.error('Error loading article:', error);
    notFound();
  }
}
