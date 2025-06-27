# url-to-json-markdown

A TypeScript library that fetches URLs and converts them to structured JSON and Markdown format. Supports Reddit posts/comments and generic web pages with intelligent content extraction.

## Features

- ✅ **Reddit Support**: Parse posts and comments with full metadata
- ✅ **Generic Web Page Support**: Extract content from any website
- ✅ **Intelligent Content Extraction**: Automatically finds main content on web pages
- ✅ **Clean Markdown Output**: Formatted content with proper headers and links
- ✅ **TypeScript Support**: Full type definitions and IntelliSense
- ✅ **Dual Format Support**: ESM and CommonJS compatibility
- ✅ **Comment Parsing**: Extract specific Reddit comments from comment URLs
- ✅ **Metadata Extraction**: Includes author, timestamps, vote counts, and permalinks

## Installation

```bash
npm install url-to-json-markdown
```

## Usage

### Basic Usage

```typescript
import { urlToJsonMarkdown } from 'url-to-json-markdown';

// Reddit post
const redditPost = await urlToJsonMarkdown('https://www.reddit.com/r/example/comments/12345/title/');
console.log(redditPost.title);   // Post title
console.log(redditPost.content); // Formatted markdown with metadata
console.log(redditPost.type);    // 'reddit'

// Reddit comment
const redditComment = await urlToJsonMarkdown('https://www.reddit.com/r/example/comments/12345/comment/abc123/');
console.log(redditComment.title);   // Original post title
console.log(redditComment.content); // Comment content as markdown
console.log(redditComment.type);    // 'reddit'

// Generic web page
const webpage = await urlToJsonMarkdown('https://example.com/article');
console.log(webpage.title);   // Page title
console.log(webpage.content); // Main content converted to markdown
console.log(webpage.type);    // 'generic'
```

## API

### `urlToJsonMarkdown(url: string): Promise<UrlToJsonResult>`

Fetches a URL and converts it to structured JSON and Markdown.

**Parameters:**
- `url` - A supported URL

**Returns:**
- `Promise<UrlToJsonResult>` - Object containing title and markdown content

**Interface:**
```typescript
interface UrlToJsonResult {
  title: string;                    // The content title
  content: string;                  // Formatted markdown content
  type: 'reddit' | 'generic';      // Source type for conditional handling
}
```

## Supported URLs

### Reddit URLs
- **Posts**: `https://www.reddit.com/r/subreddit/comments/id/title/`
- **Comments**: `https://www.reddit.com/r/subreddit/comments/id/comment/comment_id/`
- **Domains**: `reddit.com` and `www.reddit.com`

### Generic Web Pages
- **Any website**: The library intelligently extracts main content from HTML pages
- **Content selectors**: Automatically tries `article`, `main`, `[role="main"]`, `.content`, `.post-content`, `.entry-content`, `.article-content` elements
- **Cleanup**: Removes navigation, scripts, styles, and other non-content elements

## Output Format

### Reddit Posts
```markdown
# Post Title

Post content here...

[permalink](https://reddit.com/r/subreddit/comments/...)

by *username* (↑ upvotes/ ↓ downvotes) MM/DD/YYYY, HH:MM:SS AM/PM
```

### Reddit Comments
```markdown
# Comment by username

Comment content here...

[permalink](https://reddit.com/r/subreddit/comments/.../comment_id/)

by *username* (↑ upvotes/ ↓ downvotes) MM/DD/YYYY, HH:MM:SS AM/PM
```

### Generic Web Pages
```markdown
# Page Title

Main content converted to markdown...
```

## Error Handling

The library throws errors for:
- Network failures when fetching URLs
- Rate limiting or CORS restrictions (especially for Reddit)
- Invalid or malformed responses
- Parsing errors for malformed HTML/JSON

## Examples

### Real Reddit URLs
```typescript
// Reddit post
const post = await urlToJsonMarkdown('https://www.reddit.com/r/ClaudeAI/comments/1le69jw/midproject_on_cursor_easy_to_context_switch_to/');
console.log(post.type); // 'reddit'
console.log(post.title); // 'Mid-project on Cursor.. easy to context switch to Claude?'

// Reddit comment
const comment = await urlToJsonMarkdown('https://www.reddit.com/r/LLMDevs/comments/1l6usee/comment/mwsl58w/');
console.log(comment.type); // 'reddit'
console.log(comment.title); // 'What is your favorite eval tech stack for an LLM system'
```

### Generic Website
```typescript
const webpage = await urlToJsonMarkdown('https://paradite.github.io/');
console.log(webpage.type); // 'generic'
console.log(webpage.title); // 'Zhu Liang'
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test
```
