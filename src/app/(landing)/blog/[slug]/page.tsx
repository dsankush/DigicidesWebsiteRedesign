"use client";

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Blog, BlogComment } from '@/types/blog';
import { 
  fetchBlog, fetchBlogs, checkLikeStatus, toggleLike, 
  fetchComments, submitComment, generateFingerprint 
} from '@/lib/blog-storage';
import { 
  Clock, Calendar, Tag, ArrowLeft, Share2, ChevronRight, 
  FileText, Loader2, Heart, MessageSquare, Send, CheckCircle
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Like state
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [fingerprint, setFingerprint] = useState('');
  
  // Comment state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentMessage, setCommentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Generate fingerprint on mount
  useEffect(() => {
    const fp = generateFingerprint();
    setFingerprint(fp);
  }, []);

  // Load blog
  useEffect(() => {
    const loadBlog = async () => {
      setIsLoading(true);
      
      try {
        const foundBlog = await fetchBlog(slug);
        
        if (foundBlog && foundBlog.status === 'published') {
          setBlog(foundBlog);
          setLikesCount(foundBlog.likesCount || 0);
          
          // Load related blogs
          const allBlogs = await fetchBlogs('published');
          const related = allBlogs
            .filter(b => 
              b.id !== foundBlog.id && 
              (b.category === foundBlog.category || 
               b.tags.some(tag => foundBlog.tags.includes(tag)))
            )
            .slice(0, 3);
          setRelatedBlogs(related);
          
          // Load comments
          const blogComments = await fetchComments(foundBlog.id);
          setComments(blogComments);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading blog:', error);
        setNotFound(true);
      }
      
      setIsLoading(false);
    };

    void loadBlog();
  }, [slug]);

  // Check like status
  useEffect(() => {
    if (blog && fingerprint) {
      void checkLikeStatus(blog.id, fingerprint).then(({ hasLiked, likesCount }) => {
        setHasLiked(hasLiked);
        setLikesCount(likesCount);
      });
    }
  }, [blog, fingerprint]);

  // Handle like
  const handleLike = async () => {
    if (!blog || !fingerprint || isLiking) return;
    
    setIsLiking(true);
    const result = await toggleLike(blog.id, fingerprint);
    setHasLiked(result.hasLiked);
    setLikesCount(result.likesCount);
    setIsLiking(false);
  };

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blog || isSubmitting) return;
    
    if (!commentName.trim() || !commentContent.trim()) {
      setCommentMessage({ type: 'error', text: 'Name and comment are required' });
      return;
    }
    
    setIsSubmitting(true);
    setCommentMessage(null);
    
    const result = await submitComment(
      blog.id, 
      commentName.trim(), 
      commentContent.trim(),
      commentEmail.trim() || undefined
    );
    
    if (result.success) {
      setCommentMessage({ type: 'success', text: result.message });
      setCommentName('');
      setCommentEmail('');
      setCommentContent('');
    } else {
      setCommentMessage({ type: 'error', text: result.message });
    }
    
    setIsSubmitting(false);
  };

  // Share
  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.subtitle || blog.title,
          url: window.location.href,
        });
      } catch {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Blog Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you&apos;re looking for doesn&apos;t exist or has been unpublished.
          </p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-4xl px-4 pt-28">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRight size={14} />
          <span className="text-foreground truncate max-w-[200px]">{blog.title}</span>
        </nav>
      </div>

      {/* Header */}
      <header className="container mx-auto max-w-4xl px-4 pb-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 flex-wrap">
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
          <p className="text-xl text-muted-foreground mb-6">{blog.subtitle}</p>
        )}

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
            <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover" priority />
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
            [&_video]:rounded-xl [&_video]:my-8 [&_video]:max-w-full
            [&_iframe]:rounded-xl [&_iframe]:my-8
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
              <span key={idx} className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Like & Share Section */}
      <div className="container mx-auto max-w-4xl px-4 pb-12">
        <div className="flex items-center justify-between py-6 border-t border-b bg-gray-50 rounded-2xl px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => void handleLike()}
              disabled={isLiking}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                hasLiked 
                  ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
              <span>{likesCount}</span>
              <span className="hidden sm:inline">{hasLiked ? 'Liked' : 'Like'}</span>
            </button>
            
            <span className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare size={20} />
              {comments.length} comments
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>

            <Button variant="outline" className="gap-2" onClick={() => void handleShare()}>
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="container mx-auto max-w-4xl px-4 pb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <MessageSquare size={24} />
          Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4">Leave a Comment</h3>
          
          {commentMessage && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              commentMessage.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {commentMessage.type === 'success' ? <CheckCircle size={18} /> : <MessageSquare size={18} />}
              {commentMessage.text}
            </div>
          )}
          
          <form onSubmit={(e) => void handleCommentSubmit(e)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Comment *
              </label>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write your comment here..."
                required
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {commentContent.length}/1000 characters
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Your comment will be visible after approval.
              </p>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit
              </Button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        )}
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
            <Button size="lg">Contact Us</Button>
          </Link>
        </div>
      </section>
    </article>
  );
}
