import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import RelatedArticles from '@/components/RelatedArticles';

export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    const result = await query(
      `SELECT title FROM articles WHERE id = ? AND status = 'published'`,
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
    // Get article details
    const result = await query(
      `SELECT a.*, u.name as author_name, u.email as author_email
       FROM articles a
       JOIN users u ON a.author_id = u.id
       WHERE a.id = ? AND a.status = 'published'`,
      [id]
    );
    
    // If article not found or not published, show 404
    if (result.rows.length === 0) {
      notFound();
    }
    
    const article = result.rows[0];
    
    // Format dates
    const publishedDate = new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Get related articles (same author or similar topics)
    const relatedArticlesQuery = await query(
      `SELECT id, title, image_path, SUBSTRING(content, 1, 150) AS excerpt, created_at
       FROM articles 
       WHERE status = 'published' 
         AND id != ? 
         AND author_id = ?
       ORDER BY created_at DESC 
       LIMIT 3`,
      [id, article.author_id]
    );
    
    const relatedArticles = relatedArticlesQuery.rows.map(article => ({
      ...article,
      excerpt: article.excerpt.replace(/<[^>]*>/g, '').trim() + '...',
    }));

    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-[#191970] text-white">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">APUDSI News</Link>
              <div className="flex items-center space-x-6">
                <Link href="/" className="text-white hover:text-gray-200">Home</Link>
                <Link href="/categories" className="text-white hover:text-gray-200">Categories</Link>
                <Link href="/about" className="text-white hover:text-gray-200">About</Link>
                <Link href="/login" className="text-white hover:text-gray-200">Login</Link>
              </div>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow bg-gray-50">
          <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-white my-8 shadow-sm rounded-lg">
            <div className="prose lg:prose-lg max-w-none">
              <h1 className="text-3xl font-bold text-[#191970] sm:text-4xl mb-2">
                {article.title}
              </h1>
              
              <div className="flex items-center text-gray-500 mb-6">
                <span className="mr-3">By {article.author_name}</span>
                <span>•</span>
                <span className="mx-3">{publishedDate}</span>
              </div>
              
              {article.image_path && (
                <div className="my-6 relative h-96 w-full">
                  <img 
                    src={article.image_path} 
                    alt={article.title}
                    className="object-cover w-full h-full rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {/* Article content */}
              <div 
                className="mt-6" 
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
            
            {/* Author info */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-[#191970] flex items-center justify-center text-white font-bold text-xl">
                  {article.author_name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">{article.author_name}</h3>
                  <p className="text-sm text-gray-500">Staff Writer</p>
                </div>
              </div>
            </div>
          </article>
          
          {/* Related articles section */}
          {relatedArticles.length > 0 && (
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-[#191970] mb-6">More from {article.author_name}</h2>
              <RelatedArticles articles={relatedArticles} />
            </div>
          )}
        </main>
        
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">APUDSI News</h3>
                <p className="text-gray-300">
                  Your trusted source for the latest news and information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                  <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                  <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-white">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10
