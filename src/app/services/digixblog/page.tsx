"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import Image from 'next/image';
import { 
  Bold, Italic, List, Link, Video, Type, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Eye, Save, 
  Moon, Sun, Smile, FileImage, Quote, Heading1, Heading2, Heading3,
  Undo, Redo, Download, ListOrdered, Minus, Copy, Trash2,
  Sparkles, Table, Smartphone, Tablet, Monitor, Clipboard, Clock, 
  TrendingUp, FileText, Hash, ChevronDown, Terminal, Search,
  Code, BookOpen, Target, Brain, Layers,
  Edit3, Play, Pause, RotateCcw, Image as ImageIcon,
  Plus, X, Check, AlertCircle,
  Maximize2, Minimize2, Layout, FileCode,
  Bookmark, BarChart,
  Palette, Wand2, Volume2, VolumeX
} from 'lucide-react';

interface ComputedStyle {
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontFamily: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  icon: string;
}

interface WritingGoal {
  type: 'words' | 'time';
  target: number;
  current: number;
}

interface Version {
  id: string;
  timestamp: Date;
  content: string;
  title: string;
}

export default function ProfessionalBlogEditor() {
  // Core Content States
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');

  // Styling States
  const [fontSize] = useState(16);
  const [fontFamily] = useState('Inter');
  const [textColor] = useState('#1f2937');
  const [editorBgColor] = useState('#f9fafb');
  const [highlightColor] = useState('#fef08a');
  const [alignment, setAlignment] = useState<React.CSSProperties['textAlign']>('left');
  const [lineHeight] = useState(1.6);
  const [letterSpacing] = useState(0);

  // UI States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Feature States
  const [activeFormats, setActiveFormats] = useState(new Set<string>());
  const [copiedFormat, setCopiedFormat] = useState<ComputedStyle | null>(null);
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [versions, setVersions] = useState<Version[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Writing Goals
  const [writingGoal, setWritingGoal] = useState<WritingGoal>({
    type: 'words',
    target: 1000,
    current: 0
  });
  const [writingTime, setWritingTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // AI Features
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Templates Data
  const templates: Template[] = [
    {
      id: '1',
      name: 'Blog Post',
      description: 'Standard blog article structure',
      category: 'General',
      icon: '📝',
      content: '<h2>Introduction</h2><p>Start with a compelling opening...</p><h2>Main Content</h2><p>Develop your ideas here...</p><h2>Conclusion</h2><p>Wrap up with key takeaways...</p>'
    },
    {
      id: '2',
      name: 'How-To Guide',
      description: 'Step-by-step tutorial format',
      category: 'Tutorial',
      icon: '📚',
      content: '<h2>What You\'ll Learn</h2><p>Brief overview...</p><h2>Prerequisites</h2><ul><li>Item 1</li><li>Item 2</li></ul><h2>Step 1: Getting Started</h2><p>First step...</p><h2>Step 2: Next Steps</h2><p>Continue...</p>'
    },
    {
      id: '3',
      name: 'Product Review',
      description: 'Comprehensive product analysis',
      category: 'Review',
      icon: '⭐',
      content: '<h2>Overview</h2><p>Product introduction...</p><h2>Pros</h2><ul><li>Advantage 1</li></ul><h2>Cons</h2><ul><li>Disadvantage 1</li></ul><h2>Verdict</h2><p>Final thoughts...</p>'
    },
    {
      id: '4',
      name: 'Case Study',
      description: 'Detailed analysis format',
      category: 'Business',
      icon: '📊',
      content: '<h2>Background</h2><p>Context and situation...</p><h2>Challenge</h2><p>The problem...</p><h2>Solution</h2><p>How it was solved...</p><h2>Results</h2><p>Outcomes and metrics...</p>'
    },
    {
      id: '5',
      name: 'Listicle',
      description: 'Numbered list article',
      category: 'General',
      icon: '📋',
      content: '<h2>Introduction</h2><p>Brief intro to the list...</p><h2>1. First Item</h2><p>Description...</p><h2>2. Second Item</h2><p>Description...</p><h2>3. Third Item</h2><p>Description...</p>'
    },
    {
      id: '6',
      name: 'Interview',
      description: 'Q&A style content',
      category: 'Interview',
      icon: '🎤',
      content: '<h2>Meet [Name]</h2><p>Introduction to interviewee...</p><h3>Q: First question?</h3><p>A: Answer...</p><h3>Q: Second question?</h3><p>A: Answer...</p>'
    }
  ];

  const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💪', '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💃', '🕺', '👯', '🧘', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎮', '🎰', '🎳'];

  // History Management
  const updateHistory = useCallback((value: string): void => {
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(value);
    if (newHist.length > 50) newHist.shift();
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  }, [history, historyIndex]);

  // Sound Effects
  const playSound = useCallback((type: string): void => {
    if (!soundEnabled) return;
    // In a real implementation, you would play actual sound files
    console.log(`Playing ${type} sound`);
  }, [soundEnabled]);

  // Version Management
  const saveVersion = useCallback((): void => {
    const version: Version = {
      id: Date.now().toString(),
      timestamp: new Date(),
      content,
      title
    };
    setVersions(prev => [version, ...prev].slice(0, 10));
    playSound('save');
  }, [content, title, playSound]);

  // Save Draft function
  const saveDraft = useCallback((auto = false): void => {
    const draft = {
      title, subtitle, content, metaTitle, metaDescription, category,
      tags: tags.split(',').map(t => t.trim()),
      slug, thumbnail, author,
      styling: { fontSize, fontFamily, textColor, editorBgColor, alignment, lineHeight, letterSpacing },
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('blogDraft', JSON.stringify(draft));
    setLastSaved(new Date());
    
    if (!auto) {
      saveVersion();
      playSound('save');
    }
  }, [title, subtitle, content, metaTitle, metaDescription, category, tags, slug, thumbnail, author, fontSize, fontFamily, textColor, editorBgColor, alignment, lineHeight, letterSpacing, saveVersion, playSound]);

  const undo = useCallback((): void => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      const val = history[idx];
      if (val !== undefined) {
        setHistoryIndex(idx);
        setContent(val);
        if (editorRef.current) editorRef.current.innerHTML = val;
        playSound('undo');
      }
    }
  }, [historyIndex, history, playSound]);

  const redo = useCallback((): void => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      const val = history[idx];
      if (val !== undefined) {
        setHistoryIndex(idx);
        setContent(val);
        if (editorRef.current) editorRef.current.innerHTML = val;
        playSound('redo');
      }
    }
  }, [historyIndex, history, playSound]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const timer = setTimeout(() => {
      if (content || title) {
        saveDraft(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [content, title, autoSaveEnabled, saveDraft]);

  // Auto-generate slug
  useEffect(() => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generated);
  }, [title]);

  // Update editor content
  useEffect(() => {
    if (!isPreviewMode && editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, [isPreviewMode, content]);

  // Writing timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setWritingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Update writing goal
  useEffect(() => {
    const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
    setWritingGoal(prev => ({ ...prev, current: prev.type === 'words' ? words : writingTime }));
  }, [content, writingTime]);

  // Statistics
  const wordCount = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.replace(/<[^>]*>/g, '').length;
  const readingTime = Math.ceil(wordCount / 200);
  const paragraphCount = (content.match(/<p>/g) ?? []).length;
  const headingCount = (content.match(/<h[1-6]>/g) ?? []).length;

  // Readability Score (simplified Flesch Reading Ease)
  const sentences = content.replace(/<[^>]*>/g, '').split(/[.!?]+/).filter(Boolean).length;
  const syllables = Math.round(wordCount * 1.5); // Simplified
  const readabilityScore = sentences > 0 
    ? Math.round(206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount))
    : 0;

  const getReadabilityLevel = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: 'Very Easy', color: 'text-green-600' };
    if (score >= 80) return { label: 'Easy', color: 'text-green-500' };
    if (score >= 70) return { label: 'Fairly Easy', color: 'text-blue-500' };
    if (score >= 60) return { label: 'Standard', color: 'text-yellow-500' };
    if (score >= 50) return { label: 'Fairly Difficult', color: 'text-orange-500' };
    return { label: 'Difficult', color: 'text-red-500' };
  };

  // Update editor content
  useEffect(() => {
    if (!isPreviewMode && editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, [isPreviewMode, content]);

  // Update Active Formats
  const updateActiveFormats = useCallback((): void => {
    const f = new Set<string>();
    if (document.queryCommandState('bold')) f.add('bold');
    if (document.queryCommandState('italic')) f.add('italic');
    if (document.queryCommandState('underline')) f.add('underline');
    if (document.queryCommandState('insertUnorderedList')) f.add('ul');
    if (document.queryCommandState('insertOrderedList')) f.add('ol');
    setActiveFormats(f);
  }, []);

  // Save and Restore Selection for Image Insertion
  const saveSelection = useCallback((): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback((): boolean => {
    const editor = editorRef.current;
    if (!editor) return false;

    editor.focus();

    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
        return true;
      }
    }
    return false;
  }, []);

  // Insert HTML at cursor position with fallback
  const insertHTMLAtCursor = useCallback((html: string): void => {
    const editor = editorRef.current;
    if (!editor) return;

    // Restore the saved selection first
    restoreSelection();

    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Create a document fragment to hold the nodes
      const fragment = document.createDocumentFragment();
      let lastNode: Node | null = null;
      
      while (tempDiv.firstChild) {
        lastNode = fragment.appendChild(tempDiv.firstChild);
      }
      
      range.insertNode(fragment);
      
      // Move cursor to after the inserted content
      if (lastNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Fallback: append to end of editor
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      while (tempDiv.firstChild) {
        editor.appendChild(tempDiv.firstChild);
      }
    }

    // Update content state
    setTimeout(() => {
      const updated = editor.innerHTML;
      setContent(updated);
      updateHistory(updated);
    }, 10);
  }, [restoreSelection, updateHistory]);

  // Insert Code Block
  const insertCodeBlock = useCallback((): void => {
    saveSelection();
    const code = prompt('Enter code:');
    if (!code) return;
    
    const lang = prompt('Programming language (e.g., javascript, python):', 'javascript') ?? 'javascript';
    
    const html = `
      <pre style="background:#1e293b; color:#e2e8f0; padding:20px; border-radius:12px; overflow-x:auto; margin:20px 0;">
        <code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
      </pre>
      <p><br></p>
    `;

    insertHTMLAtCursor(html);
  }, [saveSelection, insertHTMLAtCursor]);

  // Insert Link
  const insertLink = useCallback((): void => {
    // Get selected text before prompt
    const selectedText = window.getSelection()?.toString() ?? '';
    saveSelection();
    
    const url = prompt('Enter URL:');
    if (url) {
      const text = selectedText || prompt('Link text:') || url;
      const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6; text-decoration:underline;">${text}</a>`;
      insertHTMLAtCursor(html);
    }
  }, [saveSelection, insertHTMLAtCursor]);

  // Format Text
  const formatText = useCallback((format: string, value?: string): void => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    switch (format) {
      case 'bold': document.execCommand('bold'); break;
      case 'italic': document.execCommand('italic'); break;
      case 'underline': document.execCommand('underline'); break;
      case 'strikethrough': document.execCommand('strikeThrough'); break;
      case 'h1': document.execCommand('formatBlock', false, '<h1>'); break;
      case 'h2': document.execCommand('formatBlock', false, '<h2>'); break;
      case 'h3': document.execCommand('formatBlock', false, '<h3>'); break;
      case 'p': document.execCommand('formatBlock', false, '<p>'); break;
      case 'ul': document.execCommand('insertUnorderedList'); break;
      case 'ol': document.execCommand('insertOrderedList'); break;
      case 'quote': document.execCommand('formatBlock', false, '<blockquote>'); break;
      case 'code': insertCodeBlock(); break;
      case 'color': document.execCommand('foreColor', false, value ?? textColor); break;
      case 'highlight': document.execCommand('backColor', false, value ?? highlightColor); break;
      case 'link': insertLink(); break;
      case 'hr': document.execCommand('insertHTML', false, '<hr>'); break;
      case 'alignLeft': document.execCommand('justifyLeft'); setAlignment('left'); break;
      case 'alignCenter': document.execCommand('justifyCenter'); setAlignment('center'); break;
      case 'alignRight': document.execCommand('justifyRight'); setAlignment('right'); break;
      case 'alignJustify': document.execCommand('justifyFull'); setAlignment('justify'); break;
      default: break;
    }

    setTimeout(() => {
      const updated = editor.innerHTML;
      setContent(updated);
      updateHistory(updated);
      playSound('type');
    }, 10);
  }, [textColor, highlightColor, insertCodeBlock, insertLink, updateHistory, playSound]);

  // Copy/Paste Format
  const copyFormat = (): void => {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const el = sel.getRangeAt(0).commonAncestorContainer.parentElement;
    if (!el) return;

    const style = window.getComputedStyle(el);
    setCopiedFormat({
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecoration: style.textDecoration,
      color: style.color,
      backgroundColor: style.backgroundColor,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
    });
    playSound('copy');
  };

  const pasteFormat = (): void => {
    if (!copiedFormat) return;
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;

    const range = sel.getRangeAt(0);
    const span = document.createElement('span');

    const styleString = Object.entries(copiedFormat)
      .map(([k, v]) => {
        const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${v}`;
      })
      .join('; ');
    
    span.style.cssText = styleString;
    range.surroundContents(span);

    setTimeout(() => {
      if (editorRef.current) {
        const updated = editorRef.current.innerHTML;
        setContent(updated);
        updateHistory(updated);
      }
    }, 10);
    playSound('paste');
  };

  // Image Handling
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          insertImage(ev.target.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const insertImage = useCallback((url: string, alt: string): void => {
    const html = `
      <figure class="image-wrapper" style="margin: 24px 0; text-align: center;">
        <img src="${url}" alt="${alt}" style="max-width:100%; border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
        <figcaption style="font-size:14px; color:#6b7280; margin-top:8px; font-style:italic;">${alt}</figcaption>
      </figure><p><br></p>
    `;

    insertHTMLAtCursor(html);
    playSound('image');
  }, [insertHTMLAtCursor, playSound]);

  // Handle image upload button click - save selection before opening file dialog
  const handleImageButtonClick = useCallback((): void => {
    saveSelection();
  }, [saveSelection]);

  // Insert image from URL
  const handleImageFromURL = useCallback((): void => {
    saveSelection();
    const url = prompt('Enter image URL:');
    if (!url) return;
    
    const alt = prompt('Enter image description (alt text):', 'Image') ?? 'Image';
    insertImage(url, alt);
  }, [saveSelection, insertImage]);

  // Video Embed
  const handleVideoEmbed = useCallback((): void => {
    saveSelection();
    const url = prompt('Enter YouTube or direct video URL:');
    if (!url) return;

    let embedHtml = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const idMatch = url.includes('youtu.be')
        ? /youtu\.be\/([^?]+)/.exec(url)
        : /v=([^&]+)/.exec(url);
      
      const id = idMatch?.[1];

      if (id) {
        embedHtml = `
          <div class="video-wrapper" contenteditable="false" 
            style="margin:24px 0; position:relative; padding-bottom:56.25%; height:0; border-radius:12px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <iframe src="https://www.youtube.com/embed/${id}" 
              style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen>
            </iframe>
          </div><p><br></p>
        `;
      }
    } else {
      embedHtml = `
        <div style="margin:24px 0;">
          <video src="${url}" controls 
            style="width:100%; border-radius:12px; max-height:500px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"></video>
        </div><p><br></p>
      `;
    }

    if (embedHtml) {
      insertHTMLAtCursor(embedHtml);
    }
  }, [saveSelection, insertHTMLAtCursor]);

  // Table Insertion
  const insertTable = useCallback((): void => {
    saveSelection();
    const rows = prompt('Number of rows?', '3');
    const cols = prompt('Number of columns?', '3');
    if (!rows || !cols) return;

    const r = parseInt(rows, 10);
    const c = parseInt(cols, 10);
    if (Number.isNaN(r) || Number.isNaN(c)) return;

    let html = '<table style="border-collapse:collapse; width:100%; margin:20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius:8px; overflow:hidden;"><tbody>';

    for (let i = 0; i < r; i++) {
      html += '<tr>';
      for (let j = 0; j < c; j++) {
        const bgColor = i === 0 ? '#f3f4f6' : '#ffffff';
        const fontWeight = i === 0 ? 'bold' : 'normal';
        html += `<td style="border:1px solid #e5e7eb; padding:12px; background:${bgColor}; font-weight:${fontWeight};">&nbsp;</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';

    insertHTMLAtCursor(html);
  }, [saveSelection, insertHTMLAtCursor]);

  // AI Assistant
  const handleAIAssist = async (action: string): Promise<void> => {
    setAiLoading(true);
    playSound('ai-start');
    
    // Simulate AI processing
    setTimeout(() => {
      let suggestion = '';
      
      switch (action) {
        case 'improve':
          suggestion = 'Consider adding more descriptive language and examples to strengthen your points.';
          break;
        case 'shorten':
          suggestion = 'You can condense paragraphs 2-3 by removing redundant phrases.';
          break;
        case 'expand':
          suggestion = 'Add supporting evidence and real-world examples to elaborate on your main ideas.';
          break;
        case 'tone':
          suggestion = 'Consider adjusting the tone to be more conversational and engaging for better reader connection.';
          break;
        default:
          suggestion = 'AI analysis complete. Your content looks good!';
      }
      
      setAiSuggestions(prev => [...prev, suggestion]);
      setAiLoading(false);
      playSound('ai-complete');
    }, 2000);
  };

  // Template Loading
  const loadTemplate = (template: Template): void => {
    setContent(template.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.content;
    }
    updateHistory(template.content);
    setShowTemplates(false);
    playSound('template');
  };

  const restoreVersion = (version: Version): void => {
    setContent(version.content);
    setTitle(version.title);
    if (editorRef.current) {
      editorRef.current.innerHTML = version.content;
    }
    updateHistory(version.content);
    setShowVersions(false);
    playSound('restore');
  };

  // Export Functions
  const exportHTML = (): void => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${metaTitle || title}</title>
  <meta name="description" content="${metaDescription}" />
  <meta name="author" content="${author}" />
  <meta name="keywords" content="${tags}" />
  <style>
    body {
      font-family: ${fontFamily}, sans-serif;
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      letter-spacing: ${letterSpacing}px;
      color: ${textColor};
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    img { max-width: 100%; height: auto; border-radius: 12px; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
    blockquote { 
      border-left: 4px solid #3b82f6; 
      padding-left: 20px; 
      margin: 20px 0;
      font-style: italic;
      color: #6b7280;
    }
  </style>
</head>
<body>
  ${thumbnail ? `<img src="${thumbnail}" alt="${title}" style="width:100%; margin-bottom:30px;" />` : ''}
  <h1>${title}</h1>
  ${subtitle ? `<h2 style="color:#6b7280; font-weight:normal;">${subtitle}</h2>` : ''}
  ${author ? `<p style="color:#6b7280;"><em>By ${author}</em> | ${category ? `<span>${category}</span> | ` : ''}${readingTime} min read</p>` : ''}
  <hr style="border:none; border-top:1px solid #e5e7eb; margin:30px 0;" />
  ${content}
  ${tags ? `<div style="margin-top:40px; padding-top:20px; border-top:1px solid #e5e7eb;">
    <strong>Tags:</strong> ${tags.split(',').map(t => `<span style="background:#e0e7ff; padding:4px 12px; border-radius:20px; margin:0 5px;">${t.trim()}</span>`).join('')}
  </div>` : ''}
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || "blog"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    playSound('export');
  };

  const exportMarkdown = (): void => {
    let md = `---
title: "${title}"
subtitle: "${subtitle}"
author: "${author}"
category: "${category}"
tags: [${tags.split(',').map(t => `"${t.trim()}"`).join(', ')}]
date: ${new Date().toISOString().split('T')[0]}
reading_time: ${readingTime} min
---

# ${title}

${subtitle ? `*${subtitle}*\n` : ''}
${author ? `**By ${author}**\n` : ''}
---

`;

    const contentMD = content
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<[^>]+>/g, '');

    md += contentMD;

    if (tags) {
      md += `\n\n---\n\n**Tags:** ${tags.split(',').map(t => `#${t.trim()}`).join(' ')}`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || "blog"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    playSound('export');
  };

  const exportJSON = (): void => {
    const data = {
      metadata: {
        title,
        subtitle,
        author,
        category,
        slug,
        metaTitle,
        metaDescription,
        tags: tags.split(',').map(t => t.trim()),
        thumbnail,
        createdAt: new Date().toISOString(),
        wordCount,
        readingTime
      },
      content: {
        html: content,
        plain: content.replace(/<[^>]*>/g, '')
      },
      styling: {
        fontSize,
        fontFamily,
        textColor,
        alignment,
        lineHeight,
        letterSpacing
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || "blog"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSound('export');
  };

  // Clear Content
  const clearContent = (): void => {
    if (confirm("Clear all content? This cannot be undone.")) {
      setContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setHistory(['']);
      setHistoryIndex(0);
      playSound('clear');
    }
  };

  // Generate Outline
  const generateOutline = (): { level: number; text: string }[] => {
    const headingRegex = /<h([1-6])>(.*?)<\/h\1>/g;
    const headings: { level: number; text: string }[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1] ?? '1', 10),
        text: match[2] ?? ''
      });
    }
    
    return headings;
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
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
        saveDraft(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewMode(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [formatText, undo, redo, saveDraft]);

  // Toolbar Button Component
  interface ToolbarButtonProps {
    onClick: () => void;
    icon: React.ElementType;
    title: string;
    active?: boolean;
    disabled?: boolean;
  }

  const ToolbarButton = ({
    onClick, icon: Icon, title, active = false, disabled = false
  }: ToolbarButtonProps): JSX.Element => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all ${
        disabled ? 'opacity-40 cursor-not-allowed' :
        active ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' :
        isDarkMode ? 'hover:bg-gray-700 text-gray-300 hover:scale-105' : 
        'hover:bg-gray-200 text-gray-700 hover:scale-105'
      }`}
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  const getPreviewWidth = (): string =>
    previewDevice === 'mobile' ? '375px' :
    previewDevice === 'tablet' ? '768px' : '100%';

  const goalProgress = (writingGoal.current / writingGoal.target) * 100;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'} transition-all duration-500`}>
      
      {/* HEADER */}
      {!isFocusMode && (
        <header className={`${isDarkMode ? 'bg-gray-950/95 backdrop-blur-lg border-b border-gray-800' : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'} shadow-xl sticky top-0 z-50`}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            
            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
                <Sparkles className="text-white" size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BlogCraft Pro ✨
                </h1>
                {lastSaved && autoSaveEnabled && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Check size={12} className="text-green-500" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex items-center gap-2">
              {/* Focus Mode */}
              <button
                onClick={() => setIsFocusMode(true)}
                className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 transition-colors"
                title="Focus Mode (Ctrl+F)"
              >
                <Maximize2 size={18} />
              </button>

              {/* Templates */}
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                title="Templates"
              >
                <Layout size={18} />
              </button>

              {/* AI Assistant */}
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
                title="AI Assistant"
              >
                <Brain size={18} />
              </button>

              {/* Versions */}
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 transition-colors"
                title="Version History"
              >
                <Clock size={18} />
              </button>

              {/* Analytics */}
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 transition-colors"
                title="Analytics"
              >
                <BarChart size={18} />
              </button>

              {/* Shortcuts */}
              <button
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Keyboard Shortcuts"
              >
                <Terminal size={18} />
              </button>

              {/* Preview */}
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  isPreviewMode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isPreviewMode ? <><Edit3 size={16} className="inline mr-1" />Edit</> : <><Eye size={16} className="inline mr-1" />Preview</>}
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  playSound('toggle');
                }}
                className="p-2 rounded-lg bg-gray-800 text-yellow-400 hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Toggle Sound"
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              {/* Save */}
              <button
                onClick={() => saveDraft(false)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                <Save size={18} className="inline mr-1" />
                Save
              </button>

              {/* Export Dropdown */}
              <div className="relative group">
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg flex items-center gap-2 font-semibold hover:shadow-lg transition-all">
                  <Download size={18} /> Export <ChevronDown size={16} />
                </button>

                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl hidden group-hover:block min-w-[200px] overflow-hidden border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={exportHTML}
                    className="block px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 w-full transition-colors"
                  >
                    <FileCode size={16} className="inline mr-2 text-orange-500" />
                    <strong>Export HTML</strong>
                    <p className="text-xs text-gray-500">Web-ready format</p>
                  </button>

                  <button
                    onClick={exportMarkdown}
                    className="block px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700 w-full transition-colors"
                  >
                    <FileText size={16} className="inline mr-2 text-purple-500" />
                    <strong>Export Markdown</strong>
                    <p className="text-xs text-gray-500">Plain text format</p>
                  </button>

                  <button
                    onClick={exportJSON}
                    className="block px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700 w-full transition-colors"
                  >
                    <Code size={16} className="inline mr-2 text-green-500" />
                    <strong>Export JSON</strong>
                    <p className="text-xs text-gray-500">Structured data</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WRITING GOAL PROGRESS */}
          {!isPreviewMode && (
            <div className="max-w-7xl mx-auto px-4 pb-3">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Target size={16} className="text-purple-600" />
                    Writing Goal: {writingGoal.current} / {writingGoal.target} {writingGoal.type}
                  </span>
                  <span className="text-sm font-bold text-purple-600">{Math.min(100, Math.round(goalProgress))}%</span>
                </div>
                <div className="w-full bg-white dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, goalProgress)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </header>
      )}

      {/* FOCUS MODE HEADER */}
      {isFocusMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setIsFocusMode(false)}
            className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <Minimize2 size={18} className="inline mr-2" />
            Exit Focus Mode
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className={`${isFocusMode ? 'max-w-4xl' : 'max-w-7xl'} mx-auto p-4 md:p-6 transition-all`}>
        
        <div className={`grid ${isFocusMode ? 'grid-cols-1' : showOutline ? 'grid-cols-[250px_1fr]' : 'grid-cols-1'} gap-6`}>
          
          {/* OUTLINE SIDEBAR */}
          {showOutline && !isFocusMode && !isPreviewMode && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-4 sticky top-24 h-fit`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-500" />
                  Outline
                </h3>
                <button onClick={() => setShowOutline(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                {generateOutline().map((heading, idx) => (
                  <div 
                    key={idx}
                    className={`text-sm p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors`}
                    style={{ paddingLeft: `${heading.level * 12}px` }}
                  >
                    {heading.text}
                  </div>
                ))}
                {generateOutline().length === 0 && (
                  <p className="text-sm text-gray-400 italic">No headings yet</p>
                )}
              </div>
            </div>
          )}

          {/* MAIN EDITOR */}
          <div className="space-y-6">
            
            {/* EDITOR SECTION */}
            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-white/50 backdrop-blur-xl'} rounded-3xl shadow-2xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>

              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isPreviewMode ? (
                    <><Eye size={24} className="text-green-500" /> Preview</>
                  ) : (
                    <><Edit3 size={24} className="text-blue-500" /> Editor</>
                  )}
                </h2>

                {isPreviewMode && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-2 rounded-lg transition-all ${
                        previewDevice === 'mobile'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Smartphone size={18} />
                    </button>

                    <button
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-2 rounded-lg transition-all ${
                        previewDevice === 'tablet'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Tablet size={18} />
                    </button>

                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-2 rounded-lg transition-all ${
                        previewDevice === 'desktop'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Monitor size={18} />
                    </button>
                  </div>
                )}

                {!isPreviewMode && !isFocusMode && (
                  <button
                    onClick={() => setShowOutline(!showOutline)}
                    className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors text-sm font-semibold"
                  >
                    <BookOpen size={16} className="inline mr-1" />
                    {showOutline ? 'Hide' : 'Show'} Outline
                  </button>
                )}
              </div>

              {!isPreviewMode && (
                <>
                  {/* TITLE */}
                  <input
                    type="text"
                    placeholder="✨ Enter your captivating title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full text-4xl font-bold mb-3 p-4 rounded-xl outline-none transition-all focus:ring-4 ${
                      isDarkMode 
                        ? 'bg-gray-900/50 text-white focus:ring-purple-500/50' 
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 text-gray-900 focus:ring-purple-300'
                    }`}
                  />

                  {/* SUBTITLE */}
                  <input
                    type="text"
                    placeholder="Add an engaging subtitle..."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className={`w-full text-xl mb-4 p-4 rounded-xl outline-none transition-all focus:ring-4 ${
                      isDarkMode 
                        ? 'bg-gray-900/50 text-white focus:ring-blue-500/50' 
                        : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-gray-900 focus:ring-blue-300'
                    }`}
                  />

                  {/* METADATA ROW */}
                  {!isFocusMode && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="font-bold mb-2 block text-purple-600 dark:text-purple-400 flex items-center gap-2">
                          <Type size={16} /> Author
                        </label>
                        <input
                          type="text"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="Your name"
                          className={`w-full p-3 rounded-xl outline-none transition-all focus:ring-2 ${
                            isDarkMode 
                              ? 'bg-gray-900/50 text-white focus:ring-purple-500' 
                              : 'bg-purple-50 text-gray-900 focus:ring-purple-400'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="font-bold mb-2 block text-pink-600 dark:text-pink-400 flex items-center gap-2">
                          <Bookmark size={16} /> Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`w-full p-3 rounded-xl outline-none transition-all focus:ring-2 ${
                            isDarkMode 
                              ? 'bg-gray-900/50 text-white focus:ring-pink-500' 
                              : 'bg-pink-50 text-gray-900 focus:ring-pink-400'
                          }`}
                        >
                          <option value="">Select category</option>
                          <option value="Technology">Technology</option>
                          <option value="Business">Business</option>
                          <option value="Lifestyle">Lifestyle</option>
                          <option value="Travel">Travel</option>
                          <option value="Food">Food</option>
                          <option value="Health">Health</option>
                          <option value="Education">Education</option>
                          <option value="Entertainment">Entertainment</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold mb-2 block text-blue-600 dark:text-blue-400 flex items-center gap-2">
                          <ImageIcon size={16} /> Cover Image
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            id="thumb"
                            onChange={(e) => {
                              handleImageUpload(e);
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (typeof ev.target?.result === 'string') {
                                    setThumbnail(ev.target.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />

                          <label
                            htmlFor="thumb"
                            className="px-4 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-xl cursor-pointer font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <FileImage size={18} />
                            Upload
                          </label>

                          {thumbnail && (
                            <div className="relative group">
                              <Image
                                src={thumbnail}
                                alt="cover"
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-xl object-cover shadow-lg ring-2 ring-blue-500"
                              />
                              <button
                                onClick={() => setThumbnail(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOOLBAR */}
                  {!isFocusMode && (
                    <div className={`flex flex-wrap items-center gap-1 p-3 rounded-xl mb-4 overflow-auto ${
                      isDarkMode ? 'bg-gray-900/50' : 'bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100'
                    }`}>
                      <ToolbarButton onClick={undo} icon={Undo} title="Undo (Ctrl+Z)" disabled={historyIndex <= 0} />
                      <ToolbarButton onClick={redo} icon={Redo} title="Redo (Ctrl+Y)" disabled={historyIndex >= history.length - 1} />
                      
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <ToolbarButton onClick={() => formatText('bold')} icon={Bold} title="Bold (Ctrl+B)" active={activeFormats.has('bold')} />
                      <ToolbarButton onClick={() => formatText('italic')} icon={Italic} title="Italic (Ctrl+I)" active={activeFormats.has('italic')} />
                      <ToolbarButton onClick={() => formatText('underline')} icon={Underline} title="Underline (Ctrl+U)" active={activeFormats.has('underline')} />

                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <ToolbarButton onClick={() => formatText('h1')} icon={Heading1} title="Heading 1" />
                      <ToolbarButton onClick={() => formatText('h2')} icon={Heading2} title="Heading 2" />
                      <ToolbarButton onClick={() => formatText('h3')} icon={Heading3} title="Heading 3" />

                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <ToolbarButton onClick={() => formatText('ul')} icon={List} title="Bullet List" active={activeFormats.has('ul')} />
                      <ToolbarButton onClick={() => formatText('ol')} icon={ListOrdered} title="Numbered List" active={activeFormats.has('ol')} />

                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <ToolbarButton onClick={() => formatText('quote')} icon={Quote} title="Quote" />
                      <ToolbarButton onClick={() => formatText('code')} icon={Code} title="Code Block" />
                      <ToolbarButton onClick={() => formatText('link')} icon={Link} title="Insert Link" />

                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <ToolbarButton onClick={insertTable} icon={Table} title="Insert Table" />
                      <ToolbarButton onClick={() => formatText('hr')} icon={Minus} title="Horizontal Rule" />

                      <div className="relative">
                        <ToolbarButton onClick={() => setShowEmojiPicker(!showEmojiPicker)} icon={Smile} title="Insert Emoji" />
                        
                        {showEmojiPicker && (
                          <div className="absolute top-12 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 z-50 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-sm">Pick an Emoji</span>
                              <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-8 gap-2 max-h-64 overflow-auto">
                              {emojis.map((emoji, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    document.execCommand('insertText', false, emoji);
                                    setShowEmojiPicker(false);
                                    setTimeout(() => {
                                      if (editorRef.current) {
                                        const updated = editorRef.current.innerHTML;
                                        setContent(updated);
                                        updateHistory(updated);
                                      }
                                    }, 10);
                                  }}
                                  className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-2 transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <ToolbarButton onClick={() => formatText('alignLeft')} icon={AlignLeft} title="Align Left" />
                      <ToolbarButton onClick={() => formatText('alignCenter')} icon={AlignCenter} title="Align Center" />
                      <ToolbarButton onClick={() => formatText('alignRight')} icon={AlignRight} title="Align Right" />
                      <ToolbarButton onClick={() => formatText('alignJustify')} icon={AlignJustify} title="Align Justify" />

                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <label 
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors" 
                        title="Upload Image from File"
                        onMouseDown={handleImageButtonClick}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <FileImage size={18} />
                      </label>

                      <ToolbarButton onClick={handleImageFromURL} icon={ImageIcon} title="Insert Image from URL" />
                      <ToolbarButton onClick={handleVideoEmbed} icon={Video} title="Embed Video" />

                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <ToolbarButton onClick={copyFormat} icon={Copy} title="Copy Style" />
                      <ToolbarButton onClick={pasteFormat} icon={Clipboard} title="Paste Style" disabled={!copiedFormat} />
                      
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                      <ToolbarButton onClick={clearContent} icon={Trash2} title="Clear All" />
                    </div>
                  )}

                  {/* CONTENT EDITOR */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => {
                      const updated = e.currentTarget.innerHTML;
                      setContent(updated);
                      updateHistory(updated);
                      if (!isTimerRunning) setIsTimerRunning(true);
                    }}
                    onMouseUp={updateActiveFormats}
                    onKeyUp={updateActiveFormats}
                    className={`w-full min-h-96 p-6 rounded-xl shadow-inner outline-none focus:ring-4 transition-all ${
                      isDarkMode 
                        ? 'focus:ring-purple-500/50' 
                        : 'focus:ring-purple-300'
                    }`}
                    style={{
                      backgroundColor: editorBgColor,
                      color: textColor,
                      fontSize: `${fontSize}px`,
                      fontFamily: fontFamily,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      textAlign: alignment,
                    }}
                    suppressContentEditableWarning
                  >
                    {!content && (
                      <p className="text-gray-400 italic pointer-events-none">
                        Start writing your masterpiece… ✍️
                      </p>
                    )}
                  </div>

                  {/* STATS BAR */}
                  <div className={`flex flex-wrap justify-between mt-4 p-4 rounded-xl gap-4 ${
                    isDarkMode ? 'bg-gray-900/50' : 'bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50'
                  }`}>
                    <div className="flex items-center gap-6 text-sm flex-wrap">
                      <span className="flex items-center gap-2 font-semibold">
                        <FileText size={16} className="text-blue-500" /> 
                        <strong>{wordCount}</strong> words
                      </span>

                      <span className="flex items-center gap-2 font-semibold">
                        <Hash size={16} className="text-purple-500" /> 
                        <strong>{charCount}</strong> chars
                      </span>

                      <span className="flex items-center gap-2 font-semibold">
                        <Clock size={16} className="text-pink-500" /> 
                        <strong>{readingTime}</strong> min read
                      </span>

                      <span className="flex items-center gap-2 font-semibold">
                        <Layers size={16} className="text-green-500" /> 
                        <strong>{paragraphCount}</strong> paragraphs
                      </span>

                      {!isFocusMode && (
                        <span className="flex items-center gap-2 font-semibold">
                          <BookOpen size={16} className="text-orange-500" /> 
                          <strong>{headingCount}</strong> headings
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-indigo-500" />
                        <span className="text-sm font-semibold">
                          {Math.floor(writingTime / 60)}:{(writingTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 transition-colors"
                      >
                        {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                      </button>

                      <button
                        onClick={() => setWritingTime(0)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 transition-colors"
                        title="Reset Timer"
                      >
                        <RotateCcw size={16} />
                      </button>

                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        readabilityScore >= 70 ? 'bg-green-100 dark:bg-green-900' :
                        readabilityScore >= 50 ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-red-100 dark:bg-red-900'
                      }`}>
                        <TrendingUp size={16} className={getReadabilityLevel(readabilityScore).color} />
                        <span className={`text-sm font-bold ${getReadabilityLevel(readabilityScore).color}`}>
                          {getReadabilityLevel(readabilityScore).label}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PREVIEW MODE */}
              {isPreviewMode && (
                <div className="flex justify-center mt-6">
                  <div
                    className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-8 rounded-2xl shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    style={{ width: getPreviewWidth(), maxWidth: '100%' }}
                  >
                    {thumbnail && (
                      <Image 
                        src={thumbnail} 
                        alt={title} 
                        width={800}
                        height={400}
                        className="w-full h-72 object-cover rounded-xl mb-6 shadow-lg" 
                      />
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      {category && <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full font-semibold">{category}</span>}
                      <span>•</span>
                      <span>{readingTime} min read</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>

                    <h1 className="text-5xl font-bold mb-4 leading-tight">{title || 'Untitled'}</h1>
                    {subtitle && <h2 className="text-2xl text-gray-500 mb-6 font-light">{subtitle}</h2>}
                    
                    {author && (
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{author}</p>
                          <p className="text-sm text-gray-500">Author</p>
                        </div>
                      </div>
                    )}

                    <div
                      className="prose dark:prose-invert max-w-none"
                      style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                        letterSpacing: `${letterSpacing}px`,
                        textAlign: alignment,
                      }}
                      dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">No content yet...</p>' }}
                    />

                    {tags && (
                      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="font-bold mb-3 flex items-center gap-2">
                          <Hash size={18} className="text-blue-500" /> Tags
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {tags.split(',').map((tag, idx) => {
                            const t = tag.trim();
                            return (
                              t && (
                                <span
                                  key={idx}
                                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold"
                                >
                                  #{t}
                                </span>
                              )
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* SEO & METADATA */}
            {!isPreviewMode && !isFocusMode && (
              <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-white/50 backdrop-blur-xl'} p-6 rounded-3xl shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Search size={22} className="text-blue-500" /> SEO & Metadata
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-blue-600 dark:text-blue-400 mb-2 block">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title || "Enter meta title"}
                      className={`w-full p-3 rounded-xl outline-none focus:ring-2 transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900/50 text-white focus:ring-blue-500' 
                          : 'bg-blue-50 text-gray-900 focus:ring-blue-400'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {metaTitle.length}/60 characters
                      {metaTitle.length > 60 && <span className="text-red-500 ml-2">Too long!</span>}
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-purple-600 dark:text-purple-400 mb-2 block">Slug (URL)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className={`w-full p-3 rounded-xl outline-none focus:ring-2 transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900/50 text-white focus:ring-purple-500' 
                          : 'bg-purple-50 text-gray-900 focus:ring-purple-400'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      yoursite.com/{slug || 'your-post-slug'}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="font-bold text-pink-600 dark:text-pink-400 mb-2 block">Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Write a compelling description for search engines..."
                      className={`w-full p-3 rounded-xl h-24 resize-none outline-none focus:ring-2 transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900/50 text-white focus:ring-pink-500' 
                          : 'bg-pink-50 text-gray-900 focus:ring-pink-400'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {metaDescription.length}/160 characters
                      {metaDescription.length > 160 && <span className="text-red-500 ml-2">Too long!</span>}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="font-bold text-green-600 dark:text-green-400 mb-2 block">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tech, blog, tutorial, ai"
                      className={`w-full p-3 rounded-xl outline-none focus:ring-2 transition-all ${
                        isDarkMode 
                          ? 'bg-gray-900/50 text-white focus:ring-green-500' 
                          : 'bg-green-50 text-gray-900 focus:ring-green-400'
                      }`}
                    />

                    <div className="flex gap-2 mt-3 flex-wrap">
                      {tags.split(',').map((tag, idx) => {
                        const t = tag.trim();
                        return (
                          t && (
                            <span
                              key={idx}
                              className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold shadow-lg"
                            >
                              #{t}
                            </span>
                          )
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MODALS */}

      {/* TEMPLATES MODAL */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto`}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Layout size={24} /> Choose a Template
                </h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => loadTemplate(template)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100'
                    }`}
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h4 className="text-xl font-bold mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                    <span className="inline-block px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                      {template.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI ASSISTANT MODAL */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto`}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Brain size={24} /> AI Writing Assistant
                </h3>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Get AI-powered suggestions to improve your content
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAIAssist('improve')}
                  disabled={aiLoading}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Wand2 size={20} className="inline mr-2" />
                  Improve Writing
                </button>

                <button
                  onClick={() => handleAIAssist('shorten')}
                  disabled={aiLoading}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Minus size={20} className="inline mr-2" />
                  Make Shorter
                </button>

                <button
                  onClick={() => handleAIAssist('expand')}
                  disabled={aiLoading}
                  className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Plus size={20} className="inline mr-2" />
                  Expand Content
                </button>

                <button
                  onClick={() => handleAIAssist('tone')}
                  disabled={aiLoading}
                  className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Palette size={20} className="inline mr-2" />
                  Adjust Tone
                </button>
              </div>

              {aiLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                </div>
              )}

              {aiSuggestions.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="font-bold text-lg">AI Suggestions:</h4>
                  {aiSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles size={20} className="text-purple-500 flex-shrink-0 mt-1" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto`}>
            <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Clock size={24} /> Version History
                </h3>
                <button
                  onClick={() => setShowVersions(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {versions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clock size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No saved versions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map(version => (
                    <div
                      key={version.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => restoreVersion(version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{version.title || 'Untitled'}</h4>
                        <span className="text-xs text-gray-500">
                          {version.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {version.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                      <button className="mt-2 text-sm text-blue-500 hover:text-blue-600 font-semibold">
                        Restore this version →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS MODAL */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-auto`}>
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart size={24} /> Content Analytics
                </h3>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* STATS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-blue-100 dark:bg-blue-900">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{wordCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
                </div>

                <div className="text-center p-4 rounded-xl bg-purple-100 dark:bg-purple-900">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{readingTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Min Read</p>
                </div>

                <div className="text-center p-4 rounded-xl bg-green-100 dark:bg-green-900">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{paragraphCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paragraphs</p>
                </div>

                <div className="text-center p-4 rounded-xl bg-orange-100 dark:bg-orange-900">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{headingCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Headings</p>
                </div>
              </div>

              {/* READABILITY */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  Readability Score
                </h4>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-4">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          readabilityScore >= 70 ? 'bg-green-500' :
                          readabilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, readabilityScore))}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getReadabilityLevel(readabilityScore).color}`}>
                      {readabilityScore}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getReadabilityLevel(readabilityScore).label}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Higher scores indicate easier reading. Aim for 60-70 for general audiences.
                </p>
              </div>

              {/* SEO CHECKLIST */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-50 to-teal-50'}`}>
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Search size={20} className="text-green-500" />
                  SEO Checklist
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {title.length > 0 ? 
                      <Check size={20} className="text-green-500" /> : 
                      <AlertCircle size={20} className="text-red-500" />
                    }
                    <span>Title added</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {metaDescription.length >= 50 && metaDescription.length <= 160 ? 
                      <Check size={20} className="text-green-500" /> : 
                      <AlertCircle size={20} className="text-orange-500" />
                    }
                    <span>Meta description (50-160 chars)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {headingCount > 0 ? 
                      <Check size={20} className="text-green-500" /> : 
                      <AlertCircle size={20} className="text-red-500" />
                    }
                    <span>Headings used</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {wordCount >= 300 ? 
                      <Check size={20} className="text-green-500" /> : 
                      <AlertCircle size={20} className="text-orange-500" />
                    }
                    <span>Minimum 300 words</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {tags.split(',').filter(t => t.trim()).length > 0 ? 
                      <Check size={20} className="text-green-500" /> : 
                      <AlertCircle size={20} className="text-red-500" />
                    }
                    <span>Tags added</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {thumbnail ? 
                      <Check size={20} className="text-green-500" /> : 
                      <AlertCircle size={20} className="text-orange-500" />
                    }
                    <span>Featured image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto`}>
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Terminal size={24} /> Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {[
                { keys: ['Ctrl', 'B'], action: 'Bold text' },
                { keys: ['Ctrl', 'I'], action: 'Italic text' },
                { keys: ['Ctrl', 'U'], action: 'Underline text' },
                { keys: ['Ctrl', 'Z'], action: 'Undo' },
                { keys: ['Ctrl', 'Y'], action: 'Redo' },
                { keys: ['Ctrl', 'S'], action: 'Save draft' },
                { keys: ['Ctrl', 'P'], action: 'Toggle preview' },
                { keys: ['Ctrl', 'F'], action: 'Focus mode' },
              ].map((shortcut, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-50 to-blue-50'
                  }`}
                >
                  <span className="font-semibold">{shortcut.action}</span>
                  <div className="flex gap-2">
                    {shortcut.keys.map((key, kidx) => (
                      <span
                        key={kidx}
                        className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg font-mono text-sm shadow"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCROLL TO TOP BUTTON */}
      {!isFocusMode && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
          title="Scroll to top"
        >
          <Sparkles size={26} />
        </button>
      )}
    </div>
  );
}