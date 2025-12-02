import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Blog } from '@/types/blog';
import fs from 'fs';
import path from 'path';
import { Clock, Calendar, Tag, ArrowLeft, Share2, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

interface BlogsData {
  blogs: Blog[];
}

function getAllBlogs(): Blog[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'blogs', 'blogs.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data) as BlogsData;
    return parsed.blogs;
  } catch {
    return [];
  }
}

function getBlogBySlug(slug: string): Blog | undefined {
  const blogs = getAllBlogs();
  return blogs.find(blog => blog.slug === slug && blog.status === 'published');
}

function getRelatedBlogs(currentBlog: Blog): Blog[] {
  const blogs = getAllBlogs();
  return blogs
    .filter(blog => 
      blog.id !== currentBlog.id && 
      blog.status === 'published' &&
      (blog.category === currentBlog.category || 
       blog.tags.some(tag => currentBlog.tags.includes(tag)))
    )
    .slice(0, 3);
}

// Generate static params for all published blogs
export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs
    .filter(blog => blog.status === 'published')
    .map(blog => ({
      slug: blog.slug,
    }));
}

// Generate metadata for each blog
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);
  
  if (!blog) {
    return {
      title: 'Blog Not Found | Digicides',
    };
  }

  return {
    title: `${blog.metaTitle || blog.title} | Digicides Blog`,
    description: blog.metaDescription || blog.subtitle || `Read ${blog.title} on Digicides Blog`,
    keywords: blog.tags.join(', '),
    authors: blog.author ? [{ name: blog.author }] : undefined,
    alternates: {
      canonical: `https://www.digicides.com/blog/${blog.slug}`,
    },
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.subtitle,
      url: `https://www.digicides.com/blog/${blog.slug}`,
      siteName: 'Digicides',
      locale: 'en_IN',
      type: 'article',
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: blog.author ? [blog.author] : undefined,
      images: blog.thumbnail ? [{ url: blog.thumbnail }] : undefined,
    },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = getRelatedBlogs(blog);

  // Schema.org structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.metaDescription || blog.subtitle,
    author: {
      '@type': 'Person',
      name: blog.author || 'Digicides Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Digicides',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.digicides.com/Logo.png',
      },
    },
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    image: blog.thumbnail || 'https://www.digicides.com/Logo.png',
    url: `https://www.digicides.com/blog/${blog.slug}`,
    keywords: blog.tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto max-w-4xl px-4 pt-28">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <ChevronRight size={14} />
            <span className="text-foreground truncate max-w-[200px]">
              {blog.title}
            </span>
          </nav>
        </div>

        {/* Header */}
        <header className="container mx-auto max-w-4xl px-4 pb-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            {blog.category && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {blog.category}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {blog.readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {blog.title}
          </h1>

          {blog.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">
              {blog.subtitle}
            </p>
          )}

          {/* Author */}
          {blog.author && (
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                {blog.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{blog.author}</p>
                <p className="text-sm text-muted-foreground">Author</p>
              </div>
            </div>
          )}
        </header>

        {/* Featured Image */}
        {blog.thumbnail && (
          <div className="container mx-auto max-w-5xl px-4 mb-12">
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={blog.thumbnail}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto max-w-4xl px-4 pb-12">
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-foreground prose-li:mb-2
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-6
              prose-img:rounded-xl prose-img:shadow-md prose-img:my-8
              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto
            "
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="container mx-auto max-w-4xl px-4 pb-12">
            <div className="flex items-center gap-3 flex-wrap pt-6 border-t">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Tag size={18} />
                Tags:
              </span>
              {blog.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share & Navigation */}
        <div className="container mx-auto max-w-4xl px-4 pb-12">
          <div className="flex items-center justify-between py-6 border-t border-b">
            <Link href="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft size={16} />
                Back to Blog
              </Button>
            </Link>

            <Button variant="outline" className="gap-2">
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="bg-[#FEF4E8] py-16">
            <div className="container mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Related Articles
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <Link key={relatedBlog.id} href={`/blog/${relatedBlog.slug}`}>
                    <article className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden h-full">
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        {relatedBlog.thumbnail ? (
                          <Image
                            src={relatedBlog.thumbnail}
                            alt={relatedBlog.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          {relatedBlog.category && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                              {relatedBlog.category}
                            </span>
                          )}
                          <span>{relatedBlog.readingTime} min</span>
                        </div>

                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {relatedBlog.title}
                        </h3>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Want to Discuss Agri Marketing Strategies?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our team is ready to help your brand connect with farmers across India.
            </p>
            <Link href="/#contact-us">
              <Button size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
