import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure route is not cached

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
      { status: 429, headers: { 'Retry-After': '60' }
    );
  }
  
  try {
    // Parse URL params
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50); // Max 50 items per page
    const search = url.searchParams.get('search');
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build search condition
    let searchCondition = '';
    let searchParams = [];
    
    if (search) {
      searchCondition = 'AND (a.title LIKE ? OR a.content LIKE ?)';
      searchParams = [`%${search}%`, `%${search}%`];
    }
    
    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM articles a 
      WHERE a.status = 'published' ${searchCondition}
    `, searchParams);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Get articles
    const articlesResult = await query(`
      SELECT a.id, a.title, a.image_path, 
             SUBSTRING(a.content, 1, 200) as excerpt, 
             a.created_at, a.updated_at, 
             u.name as author_name 
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      WHERE a.status = 'published' ${searchCondition}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [...searchParams, limit, offset]);
    
    // Process articles for API response
    const articles = articlesResult.rows.map(article => ({
      ...article,
      // Clean excerpt by removing HTML tags
      excerpt: article.excerpt.replace(/<[^>]*>/g, '').trim() + '...'
    }));
    
    return NextResponse.json({
      articles,
      pagination: {
        total,
        pages: totalPages,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching public articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
