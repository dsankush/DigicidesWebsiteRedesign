"use client";

import { useState, useRef, useCallback, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BLOG_CATEGORIES } from '@/types/blog';
import type { Blog } from '@/types/blog';
import {
  Bold, Italic, List, Link as LinkIcon, Underline,
  AlignLeft, AlignCenter, AlignRight, Eye, Save,
  FileImage, Quote, Heading1, Heading2, Heading3,
  Undo, Redo, ListOrdered, Minus,
  FileText, Clock, Check, AlertCircle, X,
  Download, Edit3, ChevronLeft, Loader2
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlog({ params }: PageProps) {
  const { id } = use(params);
  
  // Form States
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${id}`);
        const data = await response.json() as { success?: boolean; blog?: Blog; error?: string };
        
        if (data.success && data.blog) {
          const blog = data.blog;
          setTitle(blog.title);
          setSubtitle(blog.subtitle);
          setContent(blog.content);
          setAuthor(blog.author);
          setCategory(blog.category);
          setTags(blog.tags.join(', '));
          setThumbnail(blog.thumbnail);
          setMetaTitle(blog.metaTitle);
          setMetaDescription(blog.metaDescription);
          setSlug(blog.slug);
          setStatus(blog.status);
          setHistory([blog.content]);
          
          // Set editor content after component mounts
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = blog.content;
            }
          }, 100);
        } else {
          setSaveMessage({ type: 'error', text: 'Blog not found' });
        }
      } catch {
        setSaveMessage({ type: 'error', text: 'Failed to fetch blog' });
      } finally {
        setIsLoading(false);
      }
    };
    
    void fetchBlog();
  }, [id]);

  // Calculate statistics
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = plainText.length;
  const readingTime = Math.ceil(wordCount / 200);

  // History Management
  const updateHistory = useCallback((value: string) => {
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(value);
    if (newHist.length > 50) newHist.shift();
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      const val = history[idx];
      if (val !== undefined) {
        setHistoryIndex(idx);
        setContent(val);
        if (editorRef.current) editorRef.current.innerHTML = val;
      }
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      const val = history[idx];
      if (val !== undefined) {
        setHistoryIndex(idx);
        setContent(val);
        if (editorRef.current) editorRef.current.innerHTML = val;
      }
    }
  }, [historyIndex, history]);

  // Format Text
  const formatText = useCallback((format: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    switch (format) {
      case 'bold': document.execCommand('bold'); break;
      case 'italic': document.execCommand('italic'); break;
      case 'underline': document.execCommand('underline'); break;
      case 'h1': document.execCommand('formatBlock', false, '<h1>'); break;
      case 'h2': document.execCommand('formatBlock', false, '<h2>'); break;
      case 'h3': document.execCommand('formatBlock', false, '<h3>'); break;
      case 'ul': document.execCommand('insertUnorderedList'); break;
      case 'ol': document.execCommand('insertOrderedList'); break;
      case 'quote': document.execCommand('formatBlock', false, '<blockquote>'); break;
      case 'alignLeft': document.execCommand('justifyLeft'); break;
      case 'alignCenter': document.execCommand('justifyCenter'); break;
      case 'alignRight': document.execCommand('justifyRight'); break;
      case 'hr': document.execCommand('insertHTML', false, '<hr class="my-4 border-gray-300">'); break;
      case 'link': {
        const url = prompt('Enter URL:');
        if (url) {
          const text = window.getSelection()?.toString() || prompt('Link text:') || url;
          const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline">${text}</a>`;
          document.execCommand('insertHTML', false, html);
        }
        break;
      }
      default: break;
    }

    setTimeout(() => {
      const updated = editor.innerHTML;
      setContent(updated);
      updateHistory(updated);
    }, 10);
  }, [updateHistory]);

  // Image Handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, forThumbnail = false) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          if (forThumbnail) {
            setThumbnail(ev.target.result);
          } else {
            insertImage(ev.target.result, file.name);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const insertImage = (url: string, alt: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const html = `
      <figure style="margin: 24px 0; text-align: center;">
        <img src="${url}" alt="${alt}" style="max-width:100%; border-radius:8px;" />
        <figcaption style="font-size:14px; color:#666; margin-top:8px;">${alt}</figcaption>
      </figure>
    `;

    document.execCommand('insertHTML', false, html);

    setTimeout(() => {
      const updated = editor.innerHTML;
      setContent(updated);
      updateHistory(updated);
    }, 10);
  };

  // Save Blog
  const saveBlog = useCallback(async (newStatus?: 'draft' | 'published') => {
    if (!title.trim()) {
      setSaveMessage({ type: 'error', text: 'Please enter a title' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          content,
          author,
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          thumbnail,
          metaTitle: metaTitle || title,
          metaDescription,
          slug,
          status: newStatus || status,
        }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (response.ok && data.success) {
        if (newStatus) setStatus(newStatus);
        setSaveMessage({ type: 'success', text: 'Blog updated successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update blog' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to update blog. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  }, [id, title, subtitle, content, author, category, tags, thumbnail, metaTitle, metaDescription, slug, status]);

  // Export as JSON
  const exportJSON = () => {
    const data = {
      title,
      subtitle,
      slug,
      content,
      author,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      thumbnail,
      metaTitle: metaTitle || title,
      metaDescription,
      wordCount,
      readingTime,
      updatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'blog'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        formatText('bold');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        formatText('italic');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        formatText('underline');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void saveBlog();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [formatText, undo, redo, saveBlog]);

  // Toolbar Button
  const ToolbarButton = ({ onClick, icon: Icon, title, disabled = false }: {
    onClick: () => void;
    icon: React.ElementType;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all ${
        disabled 
          ? 'opacity-40 cursor-not-allowed text-gray-400' 
          : 'hover:bg-primary/10 text-foreground hover:text-primary'
      }`}
      title={title}
      type="button"
    >
      <Icon size={18} />
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/services/digixblog/manage" className="text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft size={24} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">Edit Blog</h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Update your blog post</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="gap-2"
              >
                {isPreviewMode ? <Edit3 size={16} /> : <Eye size={16} />}
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              
              <Button
                variant="outline"
                onClick={exportJSON}
                className="gap-2"
              >
                <Download size={16} />
                Export
              </Button>
              
              <Button
                variant="outline"
                onClick={() => saveBlog('draft')}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Draft
              </Button>
              
              <Button
                onClick={() => saveBlog('published')}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {status === 'published' ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
          
          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {saveMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              {saveMessage.text}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {!isPreviewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Subtitle */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Enter your blog title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-3xl font-bold outline-none border-b-2 border-transparent focus:border-primary pb-2 transition-colors"
                />
                
                <input
                  type="text"
                  placeholder="Add a subtitle (optional)"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-lg text-muted-foreground outline-none"
                />
              </div>

              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-sm border p-4">
                <div className="flex flex-wrap items-center gap-1">
                  <ToolbarButton onClick={undo} icon={Undo} title="Undo (Ctrl+Z)" disabled={historyIndex <= 0} />
                  <ToolbarButton onClick={redo} icon={Redo} title="Redo (Ctrl+Y)" disabled={historyIndex >= history.length - 1} />
                  
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  
                  <ToolbarButton onClick={() => formatText('bold')} icon={Bold} title="Bold (Ctrl+B)" />
                  <ToolbarButton onClick={() => formatText('italic')} icon={Italic} title="Italic (Ctrl+I)" />
                  <ToolbarButton onClick={() => formatText('underline')} icon={Underline} title="Underline (Ctrl+U)" />
                  
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  
                  <ToolbarButton onClick={() => formatText('h1')} icon={Heading1} title="Heading 1" />
                  <ToolbarButton onClick={() => formatText('h2')} icon={Heading2} title="Heading 2" />
                  <ToolbarButton onClick={() => formatText('h3')} icon={Heading3} title="Heading 3" />
                  
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  
                  <ToolbarButton onClick={() => formatText('ul')} icon={List} title="Bullet List" />
                  <ToolbarButton onClick={() => formatText('ol')} icon={ListOrdered} title="Numbered List" />
                  <ToolbarButton onClick={() => formatText('quote')} icon={Quote} title="Quote" />
                  
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  
                  <ToolbarButton onClick={() => formatText('link')} icon={LinkIcon} title="Insert Link" />
                  <ToolbarButton onClick={() => formatText('hr')} icon={Minus} title="Horizontal Rule" />
                  
                  <label className="p-2 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors" title="Upload Image">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                      className="hidden"
                    />
                    <FileImage size={18} />
                  </label>
                  
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  
                  <ToolbarButton onClick={() => formatText('alignLeft')} icon={AlignLeft} title="Align Left" />
                  <ToolbarButton onClick={() => formatText('alignCenter')} icon={AlignCenter} title="Align Center" />
                  <ToolbarButton onClick={() => formatText('alignRight')} icon={AlignRight} title="Align Right" />
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={(e) => {
                    const updated = e.currentTarget.innerHTML;
                    setContent(updated);
                    updateHistory(updated);
                  }}
                  className="min-h-[400px] outline-none prose prose-lg max-w-none
                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5
                    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4
                    [&_p]:mb-4 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                    [&_li]:mb-2
                    [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4
                    [&_a]:text-primary [&_a]:underline
                    [&_img]:rounded-lg [&_img]:my-4
                  "
                  suppressContentEditableWarning
                />
              </div>

              {/* Stats */}
              <div className="bg-[#FEF4E8] rounded-2xl p-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <span className="font-medium">{wordCount} words</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{charCount} characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span className="font-medium">{readingTime} min read</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author & Category */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Post Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                    className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select category</option>
                    {BLOG_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="agriculture, marketing, india"
                    className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all"
                  />
                  {tags && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.split(',').map((tag, idx) => {
                        const t = tag.trim();
                        return t && (
                          <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            #{t}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Cover Image</h3>
                
                {thumbnail ? (
                  <div className="relative group">
                    <Image
                      src={thumbnail}
                      alt="Cover"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setThumbnail(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                    />
                    <FileImage size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                  </label>
                )}
              </div>

              {/* SEO Settings */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
                <h3 className="font-semibold text-foreground">SEO Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">URL Slug</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-gray-50">
                    <span className="text-muted-foreground text-sm">/blog/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || "Enter meta title"}
                    className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{metaTitle.length}/60 characters</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Write a compelling description for search engines..."
                    rows={3}
                    className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{metaDescription.length}/160 characters</p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-[#FEF4E8] rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/services/digixblog/manage" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <FileText size={16} />
                    Back to Blog List
                  </Link>
                  <Link href="/services/digixblog" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Edit3 size={16} />
                    Create New Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border p-8 md:p-12">
              {thumbnail && (
                <Image
                  src={thumbnail}
                  alt={title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-80 object-cover rounded-xl mb-8"
                />
              )}
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                {category && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {category}
                  </span>
                )}
                <span>{readingTime} min read</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {title || 'Untitled'}
              </h1>
              
              {subtitle && (
                <h2 className="text-xl md:text-2xl text-muted-foreground mb-6">
                  {subtitle}
                </h2>
              )}
              
              {author && (
                <div className="flex items-center gap-3 mb-8 pb-8 border-b">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    {author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{author}</p>
                    <p className="text-sm text-muted-foreground">Author</p>
                  </div>
                </div>
              )}
              
              <div
                className="prose prose-lg max-w-none
                  [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-8
                  [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6
                  [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4
                  [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground
                  [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                  [&_li]:mb-2
                  [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4
                  [&_a]:text-primary [&_a]:underline
                  [&_img]:rounded-lg [&_img]:my-4
                  [&_strong]:font-bold
                "
                dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">No content yet...</p>' }}
              />
              
              {tags && (
                <div className="mt-12 pt-6 border-t">
                  <p className="font-semibold text-foreground mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.split(',').map((tag, idx) => {
                      const t = tag.trim();
                      return t && (
                        <span key={idx} className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium">
                          #{t}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
