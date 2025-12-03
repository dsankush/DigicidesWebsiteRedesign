import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Blog } from '@/types/blog';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Database row type
interface DbBlog {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  thumbnail: string | null;
  meta_title: string;
  meta_description: string;
  status: 'draft' | 'published';
  word_count: number;
  reading_time: number;
  created_at: string;
  updated_at: string;
}

// Initialize Supabase client with service role for server-side operations
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Map database row to Blog type
function mapDbToBlog(row: DbBlog): Blog {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    slug: row.slug,
    content: row.content,
    author: row.author,
    category: row.category,
    tags: row.tags || [],
    thumbnail: row.thumbnail,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    status: row.status,
    wordCount: row.word_count,
    readingTime: row.reading_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET all blogs
export async function GET() {
  try {
    const supabase = getSupabase();
    
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }

    // Map database fields to frontend format
    const mappedBlogs = (blogs as DbBlog[] || []).map(mapDbToBlog);

    return NextResponse.json({ success: true, blogs: mappedBlogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST create new blog
export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<Blog>;
    const supabase = getSupabase();
    
    // Generate slug from title if not provided
    const title = body.title ?? '';
    const slug = body.slug ?? title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check for duplicate slug
    const { data: existingBlog } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingBlog) {
      return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 400 });
    }
    
    // Calculate word count and reading time
    const content = body.content ?? '';
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    // Insert into Supabase
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: newBlog, error } = await supabase
      .from('blogs')
      .insert([{
        title,
        subtitle: body.subtitle ?? '',
        slug,
        content,
        author: body.author ?? '',
        category: body.category ?? '',
        tags: body.tags ?? [],
        thumbnail: body.thumbnail ?? null,
        meta_title: body.metaTitle ?? title,
        meta_description: body.metaDescription ?? '',
        status: body.status ?? 'draft',
        word_count: wordCount,
        reading_time: readingTime,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }

    // Map response
    const mappedBlog = mapDbToBlog(newBlog as DbBlog);

    return NextResponse.json({ success: true, blog: mappedBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
