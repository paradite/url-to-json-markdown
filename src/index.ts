import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';

export interface UrlToJsonResult {
  title: string;
  content: string;
  type: 'reddit' | 'generic';
}

export async function urlToJsonMarkdown(url: string): Promise<UrlToJsonResult> {
  if (isRedditUrl(url)) {
    return await parseRedditUrl(url);
  } else {
    return await parseGenericUrl(url);
  }

}

async function parseRedditUrl(url: string): Promise<UrlToJsonResult> {
  const jsonUrl = `${url}.json`;
  
  try {
    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit data: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Reddit returned HTML instead of JSON. This may be due to rate limiting or CORS restrictions. Consider using a server-side implementation or Reddit API with authentication.');
    }
    
    const data = await response.json() as any;
    const post = data[0].data.children[0].data;
    
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

function isRedditUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.reddit.com' || urlObj.hostname === 'reddit.com';
  } catch {
    return false;
  }
}

function formatPostToMarkdown(post: any): string {
  let markdown = `# ${post.title}\n\n`;
  
  if (post.selftext) {
    markdown += `${post.selftext}\n\n`;
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