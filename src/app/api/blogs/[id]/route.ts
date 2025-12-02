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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single blog
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = getBlogsData();
    const blog = data.blogs.find(b => b.id === id || b.slug === id);
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

// PUT update blog
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json() as Partial<Blog>;
    const data = getBlogsData();
    
    const blogIndex = data.blogs.findIndex(b => b.id === id);
    if (blogIndex === -1) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    const existingBlog = data.blogs[blogIndex];
    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    // Calculate word count and reading time if content changed
    let wordCount = existingBlog.wordCount;
    let readingTime = existingBlog.readingTime;
    
    if (body.content) {
      const plainText = body.content.replace(/<[^>]*>/g, '');
      wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
      readingTime = Math.ceil(wordCount / 200);
    }
    
    const updatedBlog: Blog = {
      ...existingBlog,
      ...body,
      wordCount,
      readingTime,
      updatedAt: new Date().toISOString(),
    };
    
    data.blogs[blogIndex] = updatedBlog;
    saveBlogsData(data);
    
    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE blog
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = getBlogsData();
    
    const blogIndex = data.blogs.findIndex(b => b.id === id);
    if (blogIndex === -1) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    data.blogs.splice(blogIndex, 1);
    saveBlogsData(data);
    
    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
