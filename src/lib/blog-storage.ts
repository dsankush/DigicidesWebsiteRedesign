import type { Blog } from '@/types/blog';

const STORAGE_KEY = 'digicides_blogs';

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

// Sync local blogs with API data
export function syncWithApiBlogs(apiBlogs: Blog[]): Blog[] {
  const localBlogs = getLocalBlogs();
  
  // Merge: API blogs take precedence, but keep local-only blogs
  const apiIds = new Set(apiBlogs.map(b => b.id));
  const localOnlyBlogs = localBlogs.filter(b => !apiIds.has(b.id));
  
  const mergedBlogs = [...apiBlogs, ...localOnlyBlogs];
  saveLocalBlogs(mergedBlogs);
  return mergedBlogs;
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
