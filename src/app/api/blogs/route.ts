import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Blog } from '@/types/blog';

const BLOGS_FILE_PATH = path.join(process.cwd(), 'data', 'blogs', 'blogs.json');

interface BlogsData {
  blogs: Blog[];
}

function getBlogsData(): BlogsData {
  try {
    const data = fs.readFileSync(BLOGS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as BlogsData;
  } catch {
    return { blogs: [] };
  }
}

function saveBlogsData(data: BlogsData): void {
  const dir = path.dirname(BLOGS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(BLOGS_FILE_PATH, JSON.stringify(data, null, 2));
}

// GET all blogs
export async function GET() {
  try {
    const data = getBlogsData();
    return NextResponse.json({ success: true, blogs: data.blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST create new blog
export async function POST(req: Request) {
  try {
    const body = await req.json() as Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readingTime'>;
    
    const data = getBlogsData();
    
    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check for duplicate slug
    const existingBlog = data.blogs.find(b => b.slug === slug);
    if (existingBlog) {
      return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 400 });
    }
    
    // Calculate word count and reading time
    const plainText = body.content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    const newBlog: Blog = {
      ...body,
      id: `blog-${Date.now()}`,
      slug,
      wordCount,
      readingTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.blogs.unshift(newBlog);
    saveBlogsData(data);
    
    return NextResponse.json({ success: true, blog: newBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
