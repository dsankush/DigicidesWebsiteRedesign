import type { Blog } from '@/types/blog';

const STORAGE_KEY = 'digicides_blogs';
const INITIALIZED_KEY = 'digicides_blogs_initialized';

// Get blogs from localStorage
export function getLocalBlogs(): Blog[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as { blogs: Blog[] };
      return parsed.blogs || [];
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return [];
}

// Save blogs to localStorage
export function saveLocalBlogs(blogs: Blog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ blogs }));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

// Check if localStorage has been initialized with API data
export function isInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(INITIALIZED_KEY) === 'true';
}

// Mark as initialized
export function markInitialized(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INITIALIZED_KEY, 'true');
}

// Initialize localStorage with API data (only once)
export async function initializeFromApi(): Promise<Blog[]> {
  if (typeof window === 'undefined') return [];
  
  // If already initialized, just return local blogs
  if (isInitialized()) {
    return getLocalBlogs();
  }
  
  // Try to fetch from API
  try {
    const response = await fetch('/api/blogs');
    const data = await response.json() as { success?: boolean; blogs?: Blog[] };
    
    if (data.success && data.blogs && data.blogs.length > 0) {
      // Save API blogs to localStorage
      saveLocalBlogs(data.blogs);
      markInitialized();
      return data.blogs;
    }
  } catch (e) {
    console.log('Failed to fetch from API:', e);
  }
  
  // Mark as initialized even if API fails
  markInitialized();
  return getLocalBlogs();
}

// Add a new blog
export function addLocalBlog(blog: Blog): Blog {
  const blogs = getLocalBlogs();
  blogs.unshift(blog);
  saveLocalBlogs(blogs);
  return blog;
}

// Update a blog
export function updateLocalBlog(id: string, updates: Partial<Blog>): Blog | null {
  const blogs = getLocalBlogs();
  const index = blogs.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  const existingBlog = blogs[index];
  if (!existingBlog) return null;
  
  const updatedBlog: Blog = {
    ...existingBlog,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  blogs[index] = updatedBlog;
  saveLocalBlogs(blogs);
  return updatedBlog;
}

// Delete a blog
export function deleteLocalBlog(id: string): boolean {
  const blogs = getLocalBlogs();
  const index = blogs.findIndex(b => b.id === id);
  if (index === -1) return false;
  
  blogs.splice(index, 1);
  saveLocalBlogs(blogs);
  return true;
}

// Get a single blog by id or slug
export function getLocalBlog(idOrSlug: string): Blog | null {
  const blogs = getLocalBlogs();
  return blogs.find(b => b.id === idOrSlug || b.slug === idOrSlug) || null;
}

// This is deprecated - use initializeFromApi instead
export function syncWithApiBlogs(_apiBlogs: Blog[]): Blog[] {
  // Now just returns what's in localStorage, doesn't sync
  return getLocalBlogs();
}

// Generate unique ID
export function generateBlogId(): string {
  return `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Calculate reading stats
export function calculateReadingStats(content: string): { wordCount: number; readingTime: number } {
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  return { wordCount, readingTime };
}

// Clear all data (for testing)
export function clearAllBlogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(INITIALIZED_KEY);
}
