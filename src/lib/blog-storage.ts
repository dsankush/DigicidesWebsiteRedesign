// Blog Storage - Uses API routes which are backed by Supabase

import type { Blog, BlogComment } from '@/types/blog';

// API response types
interface ApiResponse {
  success?: boolean;
  blogs?: Blog[];
  blog?: Blog;
  comments?: BlogComment[];
  comment?: BlogComment;
  error?: string;
  message?: string;
}

interface LikeResponse {
  success?: boolean;
  hasLiked?: boolean;
  likesCount?: number;
  action?: 'liked' | 'unliked';
  error?: string;
}

// ============================================
// BLOG OPERATIONS
// ============================================

export async function fetchBlogs(status?: 'published' | 'draft'): Promise<Blog[]> {
  try {
    const url = status ? `/api/blogs?status=${status}` : '/api/blogs';
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json() as ApiResponse;
    if (data.success && data.blogs) {
      return data.blogs;
    }
    return [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function fetchBlog(idOrSlug: string): Promise<Blog | null> {
  try {
    const response = await fetch(`/api/blogs/${idOrSlug}`, { cache: 'no-store' });
    const data = await response.json() as ApiResponse;
    if (data.success && data.blog) {
      return data.blog;
    }
    return null;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

export async function createBlog(blog: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readingTime' | 'likesCount'>): Promise<Blog | null> {
  try {
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blog),
    });
    const data = await response.json() as ApiResponse;
    if (data.success && data.blog) {
      return data.blog;
    }
    console.error('Create blog error:', data.error);
    return null;
  } catch (error) {
    console.error('Error creating blog:', error);
    return null;
  }
}

export async function updateBlog(id: string, updates: Partial<Blog>): Promise<Blog | null> {
  try {
    const response = await fetch(`/api/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json() as ApiResponse;
    if (data.success && data.blog) {
      return data.blog;
    }
    console.error('Update blog error:', data.error);
    return null;
  } catch (error) {
    console.error('Error updating blog:', error);
    return null;
  }
}

export async function deleteBlog(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/blogs/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json() as ApiResponse;
    return data.success === true;
  } catch (error) {
    console.error('Error deleting blog:', error);
    return false;
  }
}

// ============================================
// LIKE OPERATIONS
// ============================================

export async function checkLikeStatus(blogId: string, fingerprint: string): Promise<{ hasLiked: boolean; likesCount: number }> {
  try {
    const response = await fetch(`/api/blogs/${blogId}/like?fingerprint=${fingerprint}`, { cache: 'no-store' });
    const data = await response.json() as LikeResponse;
    return {
      hasLiked: data.hasLiked ?? false,
      likesCount: data.likesCount ?? 0,
    };
  } catch (error) {
    console.error('Error checking like status:', error);
    return { hasLiked: false, likesCount: 0 };
  }
}

export async function toggleLike(blogId: string, fingerprint: string): Promise<{ hasLiked: boolean; likesCount: number }> {
  try {
    const response = await fetch(`/api/blogs/${blogId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint }),
    });
    const data = await response.json() as LikeResponse;
    return {
      hasLiked: data.hasLiked ?? false,
      likesCount: data.likesCount ?? 0,
    };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { hasLiked: false, likesCount: 0 };
  }
}

// ============================================
// COMMENT OPERATIONS
// ============================================

export async function fetchComments(blogId: string, isAdmin = false): Promise<BlogComment[]> {
  try {
    const url = isAdmin ? `/api/blogs/${blogId}/comments?admin=true` : `/api/blogs/${blogId}/comments`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json() as ApiResponse;
    if (data.success && data.comments) {
      return data.comments;
    }
    return [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function submitComment(blogId: string, userName: string, content: string, userEmail?: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/blogs/${blogId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, userEmail, content }),
    });
    const data = await response.json() as ApiResponse;
    return {
      success: data.success ?? false,
      message: data.message ?? data.error ?? 'Unknown error',
    };
  } catch (error) {
    console.error('Error submitting comment:', error);
    return { success: false, message: 'Failed to submit comment' };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function calculateReadingStats(content: string): { wordCount: number; readingTime: number } {
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  return { wordCount, readingTime };
}

// Generate a simple browser fingerprint
export function generateFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  
  const canvasData = canvas.toDataURL();
  const screenData = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  
  const data = `${canvasData}|${screenData}|${timeZone}|${language}|${platform}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}
