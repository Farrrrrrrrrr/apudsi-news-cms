import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT = 60; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const ipRequestCounts = new Map();

// Rate limiting middleware
function rateLimit(ip) {
  // Initialize or get current request count
  const now = Date.now();
  let requestData = ipRequestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  // Reset count if the window has passed
  if (now > requestData.resetTime) {
    requestData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  // Increment request count
  requestData.count += 1;
  ipRequestCounts.set(ip, requestData);
  
  // Check if limit is exceeded
  if (requestData.count > RATE_LIMIT) {
    return false;
  }
  return true;
}

export async function GET(request) {
  // Get client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
  
  // Apply rate limiting
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  try {
    // Parse search parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Validate parameters
    const validatedLimit = Math.min(Math.max(1, limit), 50); // Between 1 and 50
    const validatedPage = Math.max(1, page); // At least 1
    const offset = (validatedPage - 1) * validatedLimit;
    
    // Build search condition
    const searchCondition = search
      ? `AND (a.title LIKE ? OR a.content LIKE ?)`
      : '';
    const searchParams = search
      ? [`%${search}%`, `%${search}%`]
      : [];
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published' ${searchCondition}
    `;
    
    const countResult = await query(countQuery, searchParams);
    const total = countResult.rows[0].total;
    
    // Fetch articles with author name
    const articlesQuery = `
      SELECT 
        a.id, 
        a.title, 
        a.image_path, 
        SUBSTRING(a.content, 1, 200) AS excerpt,
        a.created_at, 
        a.updated_at,
        u.name AS author_name
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published' ${searchCondition}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const articlesResult = await query(
      articlesQuery,
      [...searchParams, validatedLimit, offset]
    );
    
    // Process articles to ensure HTML is stripped from excerpt
    const articles = articlesResult.rows.map(article => ({
      ...article,
      // Strip HTML tags from excerpt
      excerpt: article.excerpt.replace(/<[^>]*>/g, '').trim() + '...',
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / validatedLimit);
    const hasNextPage = validatedPage < totalPages;
    const hasPrevPage = validatedPage > 1;
    
    return NextResponse.json({
      articles,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      }
    });
  } catch (error) {
    console.error('Error fetching public articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
