# url-to-json-markdown

[![NPM version](https://img.shields.io/npm/v/url-to-json-markdown)](https://www.npmjs.com/package/url-to-json-markdown)

A TypeScript library that fetches URLs and converts them to structured JSON and Markdown format.

Built by [16x Writer](https://writer.16x.engineer/) and [16x Eval](https://eval.16x.engineer/) team.

## Installation

```bash
npm install url-to-json-markdown
```

## Usage

```typescript
import { urlToJsonMarkdown } from 'url-to-json-markdown';

// Reddit post (using fallback without credentials)
const post = await urlToJsonMarkdown(
  'https://www.reddit.com/r/example/comments/12345/title/'
);
console.log(post.title); // "Post Title"
console.log(post.content); // "# Post Title\n\nPost content...\n\nby _username_ (↑ 123) 12/25/2024"
console.log(post.type); // "reddit"

// Reddit post with credentials (more reliable)
const postWithCreds = await urlToJsonMarkdown(
  'https://www.reddit.com/r/example/comments/12345/title/',
  {
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret',
  }
);

// Reddit post with comments included
const postWithComments = await urlToJsonMarkdown(
  'https://www.reddit.com/r/example/comments/12345/title/',
  {
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret',
    includeComments: true,
  }
);
// Will include "## Comments" section with tree-structured comments

// Reddit comment
const comment = await urlToJsonMarkdown(
  'https://www.reddit.com/r/example/comments/12345/comment/abc123/'
);
console.log(comment.title); // "First line of comment..."
console.log(comment.content); // "# Comment by username\n\nComment text...\n\nby _username_ (↑ 45)"
console.log(comment.type); // "reddit"

// Generic web page
const webpage = await urlToJsonMarkdown('https://example.com/article');
console.log(webpage.title); // "Article Title"
console.log(webpage.content); // "# Article Title\n\nMain content as markdown..."
console.log(webpage.type); // "generic"
```

## API

### `urlToJsonMarkdown(url: string, options?: RedditOptions): Promise<UrlToJsonResult>`

**Parameters:**

- `url` - The URL to fetch and convert
- `options` - Optional Reddit configuration

**Reddit Options:**

```typescript
interface RedditOptions {
  clientId?: string;
  clientSecret?: string;
  includeComments?: boolean;
}
```

- `clientId` & `clientSecret` - Reddit API credentials for more reliable access
- `includeComments` - Include comments in a tree structure (Reddit posts only)

**Return Type:**

```typescript
interface UrlToJsonResult {
  title: string;
  content: string;
  type: 'reddit' | 'generic';
}
```

## Reddit Access

For Reddit URLs, the library supports two modes:

1. **Fallback mode (no credentials)**: Uses browser user agent to access Reddit's public JSON API. May be subject to rate limiting.

2. **Authenticated mode (with credentials)**: Uses Reddit OAuth API for more reliable access. Requires Reddit app credentials.

To get Reddit credentials:

1. Go to https://www.reddit.com/prefs/apps
2. Create a new app (script type)
3. Use the client ID and secret

## Supported URLs

- **Reddit**: Posts and comments from reddit.com
- **Generic**: Any website with automatic content extraction
