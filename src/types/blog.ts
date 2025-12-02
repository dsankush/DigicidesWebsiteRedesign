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
