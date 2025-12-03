// Blog Types

export interface Blog {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  thumbnail: string | null;
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readingTime: number;
  likesCount: number;
}

export interface BlogFormData {
  title: string;
  subtitle: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  thumbnail: string | null;
  metaTitle: string;
  metaDescription: string;
}

export interface BlogComment {
  id: string;
  blogId: string;
  userName: string;
  userEmail?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface BlogLike {
  id: string;
  blogId: string;
  userFingerprint: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AdminSession {
  id: string;
  adminId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export const BLOG_CATEGORIES = [
  'Agriculture',
  'Technology',
  'Marketing',
  'Rural Development',
  'Farmer Stories',
  'Industry News',
  'Product Updates',
  'Case Studies',
  'Best Practices',
  'Other'
] as const;
