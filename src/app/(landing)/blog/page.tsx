"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Blog } from '@/types/blog';
import { Clock, User, Tag, Calendar, ArrowRight, FileText, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'digicides_blogs';

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load blogs from localStorage and API
  useEffect(() => {
    const loadBlogs = async () => {
      setIsLoading(true);
      
      // First, get from localStorage
      let localBlogs: Blog[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { blogs: Blog[] };
          localBlogs = parsed.blogs || [];
        }
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }

      // Try to fetch from API to get any server-side blogs
      try {
        const response = await fetch('/api/blogs');
        const data = await response.json() as { success?: boolean; blogs?: Blog[] };
        
        if (data.success && data.blogs) {
          // Merge: keep localStorage blogs but add any API-only blogs
          const localIds = new Set(localBlogs.map(b => b.id));
          const apiOnlyBlogs = data.blogs.filter(b => !localIds.has(b.id));
          
          // If localStorage is empty, use API blogs
          if (localBlogs.length === 0) {
            localBlogs = data.blogs;
          } else {
            // Add API-only blogs to local
            localBlogs = [...localBlogs, ...apiOnlyBlogs];
          }
          
          // Save merged result back to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ blogs: localBlogs }));
        }
      } catch (e) {
        console.log('API fetch failed, using localStorage only:', e);
      }

      // Filter to only published blogs and sort by date
      const publishedBlogs = localBlogs
        .filter(blog => blog.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setBlogs(publishedBlogs);
      setIsLoading(false);
    };

    void loadBlogs();
  }, []);

  // Get unique categories
  const categories = [...new Set(blogs.map(blog => blog.category).filter(Boolean))];

  // Filter blogs by category
  const filteredBlogs = selectedCategory === 'all' 
    ? blogs 
    : blogs.filter(b => b.category === selectedCategory);

  const featuredBlog = filteredBlogs[0];
  const otherBlogs = filteredBlogs.slice(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 pt-32 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Blog
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, strategies, and stories about agriculture marketing, 
            farmer engagement, and rural development in India.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-primary/10 text-foreground'
              }`}
            >
              All Posts ({blogs.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-primary/10 text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </section>

      {filteredBlogs.length === 0 ? (
        /* Empty State */
        <section className="container mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <FileText size={64} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              No blog posts yet
            </h2>
            <p className="text-muted-foreground mb-8">
              {selectedCategory !== 'all' 
                ? `No posts in "${selectedCategory}" category.`
                : "We're working on some great content. Check back soon!"}
            </p>
            {selectedCategory !== 'all' ? (
              <Button onClick={() => setSelectedCategory('all')}>
                View All Posts
              </Button>
            ) : (
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Featured Blog */}
          {featuredBlog && (
            <section className="container mx-auto max-w-6xl px-4 mb-16">
              <Link href={`/blog/${featuredBlog.slug}`}>
                <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 md:h-96">
                      {featuredBlog.thumbnail ? (
                        <Image
                          src={featuredBlog.thumbnail}
                          alt={featuredBlog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <FileText size={64} className="text-primary/30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                        {featuredBlog.category && (
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                            {featuredBlog.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {featuredBlog.readingTime} min read
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {featuredBlog.title}
                      </h2>

                      {featuredBlog.subtitle && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {featuredBlog.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        {featuredBlog.author && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {featuredBlog.author}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(featuredBlog.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                        Read Article
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Other Blogs Grid */}
          {otherBlogs.length > 0 && (
            <section className="container mx-auto max-w-6xl px-4 pb-20">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                More Articles
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherBlogs.map((blog) => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`}>
                    <article className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        {blog.thumbnail ? (
                          <Image
                            src={blog.thumbnail}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <FileText size={40} className="text-primary/30" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          {blog.category && (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                              {blog.category}
                            </span>
                          )}
                          <span>{blog.readingTime} min read</span>
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {blog.title}
                        </h3>

                        {blog.subtitle && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                            {blog.subtitle}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t">
                          <div className="flex items-center gap-2">
                            {blog.author && (
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {blog.author}
                              </span>
                            )}
                          </div>
                          <span>
                            {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>

                        {/* Tags */}
                        {blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {blog.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1"
                              >
                                <Tag size={10} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="bg-[#FEF4E8] py-16">
            <div className="container mx-auto max-w-4xl px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Want to Learn More About Agri Marketing?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Connect with our team to discuss how we can help your agri brand 
                reach and engage farmers across rural India.
              </p>
              <Link href="/#contact-us">
                <Button size="lg" className="text-lg px-8">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
