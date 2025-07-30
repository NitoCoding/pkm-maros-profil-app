// Utility functions for handling HTML content from CKEditor

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify-like approach for cleaning HTML
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Basic sanitization - remove dangerous elements and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers like onclick, onload, etc
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, ''); // Remove embed tags
}

/**
 * Extract plain text from HTML content
 * Uses DOMParser-like approach for text extraction
 */
export function extractTextFromHTML(html: string): string {
  if (!html) return '';
  
  // Client-side: use DOMParser
  if (typeof window !== 'undefined' && window.DOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return doc.body.textContent || doc.body.innerText || '';
    } catch (error) {
      console.warn('DOMParser failed, falling back to regex:', error);
    }
  }
  
  // Fallback: regex-based text extraction
  return html
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
    .replace(/<\/p>/gi, '\n\n') // Convert </p> to double newlines
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Convert &nbsp; to spaces
    .replace(/&amp;/g, '&') // Convert &amp; to &
    .replace(/&lt;/g, '<') // Convert &lt; to <
    .replace(/&gt;/g, '>') // Convert &gt; to >
    .replace(/&quot;/g, '"') // Convert &quot; to "
    .replace(/&#39;/g, "'") // Convert &#39; to '
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0 && lastSpace > maxLength * 0.8) {
    return text.substring(0, lastSpace).trim() + '...';
  }
  
  return truncated.trim() + '...';
}

/**
 * Get preview text from HTML content (combines sanitize + extract + truncate)
 */
export function getHTMLPreview(html: string, maxLength: number = 150): string {
  if (!html) return '';
  
  const sanitized = sanitizeHTML(html);
  const plainText = extractTextFromHTML(sanitized);
  return truncateText(plainText, maxLength);
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate reading time (average 200 words per minute for Indonesian)
 */
export function estimateReadingTime(html: string): string {
  const plainText = extractTextFromHTML(html);
  const wordCount = countWords(plainText);
  const minutes = Math.ceil(wordCount / 200);
  return minutes === 1 ? '1 menit baca' : `${minutes} menit baca`;
}

/**
 * Prepare HTML for safe rendering in React
 * This should be used with dangerouslySetInnerHTML
 */
export function prepareHTMLForRender(html: string): string {
  if (!html) return '';
  
  return sanitizeHTML(html)
    .replace(/class=/g, 'className=') // Convert class to className for React
    .replace(/style="([^"]*)"/g, (match, styles) => {
      // Convert inline styles to React style object format if needed
      return match; // Keep as is for now, can be enhanced later
    });
} 