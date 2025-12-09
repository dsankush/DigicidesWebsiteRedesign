# DigiXBlog - Image Embedding Guide

## Overview of Changes

The blog editor's image embedding functionality has been fixed to properly insert images at the cursor position within blog content. Previously, images were not being inserted correctly when you wanted to place them in the middle of your blog content.

## What Was Fixed

### The Problem
When clicking the image upload button, the editor lost the cursor position (selection), causing images to be inserted at the wrong location or not at all.

### The Solution
1. **Selection Management**: Added proper save/restore selection functionality to track where the cursor is before opening dialogs
2. **Reliable HTML Insertion**: Replaced the deprecated `document.execCommand('insertHTML')` with a more reliable DOM-based insertion method
3. **Better Event Handling**: The file upload button now saves the cursor position on `mousedown` before the file dialog opens

## How to Use Image Embedding

### Method 1: Upload Image from File
1. Place your cursor **exactly where you want the image** in your blog content
2. Click the **File Image icon** (📷) in the toolbar
3. Select an image file from your computer
4. The image will be inserted at the cursor position with a caption

### Method 2: Insert Image from URL
1. Place your cursor where you want the image
2. Click the **Image icon** (🖼️) in the toolbar (next to the file upload button)
3. Enter the image URL when prompted
4. Enter a description (alt text) for the image
5. The image will be inserted at the cursor position

### Method 3: Drag and Drop (if needed for future implementation)
The current implementation focuses on toolbar-based insertion, but the selection management system can be extended for drag-and-drop functionality.

## Technical Details

### New Functions Added

#### `saveSelection()`
Saves the current cursor position/selection before any dialog or file picker opens.

```typescript
const saveSelection = useCallback((): void => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
  }
}, []);
```

#### `restoreSelection()`
Restores the previously saved cursor position.

```typescript
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
```

#### `insertHTMLAtCursor(html: string)`
Inserts HTML content at the cursor position using DOM manipulation instead of deprecated `execCommand`.

```typescript
const insertHTMLAtCursor = useCallback((html: string): void => {
  const editor = editorRef.current;
  if (!editor) return;
  
  // Restore the saved selection first
  restoreSelection();
  
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    // Create fragment and insert
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const fragment = document.createDocumentFragment();
    let lastNode: Node | null = null;
    while (tempDiv.firstChild) {
      lastNode = fragment.appendChild(tempDiv.firstChild);
    }
    range.insertNode(fragment);
    
    // Move cursor after inserted content
    if (lastNode) {
      const newRange = document.createRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }
}, [restoreSelection, updateHistory]);
```

### Updated Functions

The following functions were updated to use the new selection management:
- `insertImage()` - Uses `insertHTMLAtCursor()`
- `handleVideoEmbed()` - Now saves selection before prompt
- `insertTable()` - Now saves selection before prompts
- `insertCodeBlock()` - Now saves selection before prompts
- `insertLink()` - Now saves selection before prompt

## Image Format

Images are inserted with this HTML structure:

```html
<figure class="image-wrapper" style="margin: 24px 0; text-align: center;">
  <img src="[IMAGE_URL]" alt="[ALT_TEXT]" 
       style="max-width:100%; border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
  <figcaption style="font-size:14px; color:#6b7280; margin-top:8px; font-style:italic;">
    [ALT_TEXT]
  </figcaption>
</figure>
<p><br></p>
```

## Tips for Best Results

1. **Click to Position First**: Always click in the editor where you want the image before clicking the upload button
2. **Use Alt Text**: Provide descriptive alt text for accessibility and SEO
3. **Image Size**: Images automatically scale to max-width: 100%, so large images will resize to fit
4. **Preview Mode**: Use the Preview button to see how your images look in the final blog post

## Troubleshooting

### Image not appearing at cursor position
- Make sure you clicked in the editor area before clicking the image button
- Try clicking at the exact position again and retry

### Image not loading
- For URL-based images, ensure the URL is publicly accessible
- Check that the image URL is correct (including https://)

### File upload not working
- Ensure the file is a valid image format (jpg, png, gif, webp)
- Try a smaller file size if the image is very large

## Browser Compatibility

This implementation uses standard DOM APIs and should work in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
