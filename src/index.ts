import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';

export interface UrlToJsonResult {
  title: string;
  content: string;
  type: 'reddit' | 'generic';
}

export interface RedditCredentials {
  clientId: string;
  clientSecret: string;
}

export async function urlToJsonMarkdown(url: string, redditCredentials?: RedditCredentials): Promise<UrlToJsonResult> {
  if (isRedditUrl(url)) {
    if (!redditCredentials) {
      throw new Error('Reddit credentials are required for Reddit URLs. Please provide clientId and clientSecret.');
    }
    return await parseRedditUrl(url, redditCredentials);
  } else {
    return await parseGenericUrl(url);
  }

}

async function getRedditToken(credentials: RedditCredentials): Promise<string> {
  const auth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get Reddit token: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as any;
  return data.access_token;
}

async function parseRedditUrl(url: string, credentials: RedditCredentials): Promise<UrlToJsonResult> {
  try {
    // Get OAuth token
    const token = await getRedditToken(credentials);
    
    // Convert reddit.com URL to oauth.reddit.com API URL
    const oauthUrl = convertToOAuthUrl(url);
    
    const response = await fetch(oauthUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'web:url-to-json-markdown:v1.0.0 (by /u/paradite)',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    const post = data[0].data.children[0].data;
    
    // Check if this is a comment URL
    const commentId = extractCommentId(url);
    if (commentId && data.length > 1) {
      const comment = findCommentById(data[1], commentId);
      if (comment) {
        const commentTitle = extractCommentTitle(comment.body);
        return {
          title: commentTitle,
          content: formatCommentToMarkdown(comment),
          type: 'reddit'
        };
      }
    }
    
    return {
      title: post.title,
      content: formatPostToMarkdown(post),
      type: 'reddit'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to convert URL to JSON/Markdown: ${error}`);
  }
}

async function parseGenericUrl(url: string): Promise<UrlToJsonResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract title
    const title = document.querySelector('title')?.textContent?.trim() || 
                 document.querySelector('h1')?.textContent?.trim() || 
                 'Untitled';
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, nav, footer, header, aside');
    scripts.forEach(element => element.remove());
    
    // Get main content (try to find article, main, or content div)
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content', 
      '.entry-content',
      '.article-content',
      'body'
    ];
    
    let contentElement = null;
    for (const selector of contentSelectors) {
      contentElement = document.querySelector(selector);
      if (contentElement && contentElement.textContent?.trim()) {
        break;
      }
    }
    
    if (!contentElement) {
      contentElement = document.body;
    }
    
    // Convert to markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced'
    });
    
    const markdown = turndownService.turndown(contentElement.innerHTML);
    
    return {
      title,
      content: markdown,
      type: 'generic'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to parse generic URL: ${error}`);
  }
}

function convertToOAuthUrl(url: string): string {
  // Convert www.reddit.com/r/subreddit/comments/id/title.json to oauth.reddit.com/r/subreddit/comments/id/title.json
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  // Add .json if not present
  const jsonPath = path.endsWith('.json') ? path : `${path}.json`;
  
  return `https://oauth.reddit.com${jsonPath}`;
}

function isRedditUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.reddit.com' || urlObj.hostname === 'reddit.com';
  } catch {
    return false;
  }
}

function extractCommentId(url: string): string | null {
  const match = url.match(/\/comment\/([a-zA-Z0-9]+)\/?/);
  return match ? match[1] : null;
}

function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'") // Replace left and right single quotes
    .replace(/[\u201C\u201D]/g, '"') // Replace left and right double quotes
    .replace(/[\u2013\u2014]/g, '-') // Replace en-dash and em-dash with regular dash
    .replace(/\u2026/g, '...'); // Replace ellipsis character with three dots
}

function extractCommentTitle(commentBody: string): string {
  if (!commentBody) {
    return 'Untitled Comment';
  }
  
  // Get the first line of the comment body and normalize quotes
  const firstLine = normalizeQuotes(commentBody.split('\n')[0].trim());
  
  // If the first line is empty or too short, return a default title
  if (!firstLine || firstLine.length < 3) {
    return 'Untitled Comment';
  }
  
  // Limit title length to 100 characters
  if (firstLine.length > 100) {
    return firstLine.substring(0, 97) + '...';
  }
  
  return firstLine;
}

function findCommentById(commentsListing: any, commentId: string): any {
  if (!commentsListing?.data?.children) {
    return null;
  }
  
  for (const child of commentsListing.data.children) {
    if (child.kind === 't1' && child.data.id === commentId) {
      return child.data;
    }
    
    // Recursively search in replies
    if (child.data.replies && typeof child.data.replies === 'object') {
      const found = findCommentById(child.data.replies, commentId);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}

function formatCommentToMarkdown(comment: any): string {
  let markdown = `# Comment by ${comment.author}\n\n`;
  
  if (comment.body) {
    markdown += `${normalizeQuotes(comment.body)}\n\n`;
  }
  
  markdown += `[permalink](https://reddit.com${comment.permalink})\n\n`;
  
  const createdDate = new Date(comment.created_utc * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  markdown += `by *${comment.author}* (↑ ${comment.ups}/ ↓ ${comment.downs}) ${createdDate}`;
  
  return markdown;
}

function formatPostToMarkdown(post: any): string {
  let markdown = `# ${normalizeQuotes(post.title)}\n\n`;
  
  if (post.selftext) {
    markdown += `${normalizeQuotes(post.selftext)}\n\n`;
  }
  
  markdown += `[permalink](https://reddit.com${post.permalink})\n\n`;
  
  const createdDate = new Date(post.created_utc * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  markdown += `by *${post.author}* (↑ ${post.ups}/ ↓ ${post.downs}) ${createdDate}`;
  
  return markdown;
}