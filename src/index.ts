export interface UrlToJsonResult {
  title: string;
  content: string;
}

export async function urlToJsonMarkdown(url: string): Promise<UrlToJsonResult> {
  if (!isRedditUrl(url)) {
    throw new Error('Only Reddit URLs are currently supported');
  }

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
      content: formatPostToMarkdown(post)
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to convert URL to JSON/Markdown: ${error}`);
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