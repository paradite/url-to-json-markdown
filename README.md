# url-to-json-markdown

A TypeScript library that fetches URLs and converts them to structured JSON and Markdown format.

## Features

- ✅ **Reddit Support**: Parse posts and comments with full metadata
- ✅ **Generic Web Page Support**: Extract content from any website
- ✅ **Intelligent Content Extraction**: Automatically finds main content on web pages
- ✅ **Clean Markdown Output**: Formatted content with proper headers and links
- ✅ **TypeScript Support**: Full type definitions and IntelliSense
- ✅ **Dual Format Support**: ESM and CommonJS compatibility
- ✅ **Comment Parsing**: Extract specific Reddit comments from comment URLs
- ✅ **Metadata Extraction**: Includes author, timestamps, vote counts, and permalinks
- ✅ **Text Normalization**: Converts smart quotes and special characters to standard equivalents

## Installation

```bash
npm install url-to-json-markdown
```

## Usage

### Basic Usage

```typescript
import { urlToJsonMarkdown } from "url-to-json-markdown";

// Reddit post
const redditPost = await urlToJsonMarkdown(
  "https://www.reddit.com/r/example/comments/12345/title/"
);
console.log(redditPost.title); // Post title
console.log(redditPost.content); // Formatted markdown with metadata
console.log(redditPost.type); // 'reddit'

// Reddit comment
const redditComment = await urlToJsonMarkdown(
  "https://www.reddit.com/r/example/comments/12345/comment/abc123/"
);
console.log(redditComment.title); // First line of the comment (up to 100 chars)
console.log(redditComment.content); // Comment content as markdown
console.log(redditComment.type); // 'reddit'

// Generic web page
const webpage = await urlToJsonMarkdown("https://example.com/article");
console.log(webpage.title); // Page title
console.log(webpage.content); // Main content converted to markdown
console.log(webpage.type); // 'generic'
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
  title: string; // The content title
  content: string; // Formatted markdown content
  type: "reddit" | "generic"; // Source type for conditional handling
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

by _username_ (↑ upvotes/ ↓ downvotes) MM/DD/YYYY, HH:MM:SS AM/PM
```

### Reddit Comments

```markdown
# Comment by username

This is the first line of the comment.
Rest of the comment content here...

[permalink](https://reddit.com/r/subreddit/comments/.../comment_id/)

by _username_ (↑ upvotes/ ↓ downvotes) MM/DD/YYYY, HH:MM:SS AM/PM
```

**Note**: For Reddit comments, the `title` field in the result contains the first line of the comment text (up to 100 characters, with "..." added if truncated). If the first line is too short or empty, "Untitled Comment" is used. The markdown content still shows "Comment by username" as the header. Smart quotes and special characters are normalized to their standard equivalents (e.g., curly quotes → straight quotes).

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
const post = await urlToJsonMarkdown(
  "https://www.reddit.com/r/ClaudeAI/comments/1le69jw/midproject_on_cursor_easy_to_context_switch_to/"
);
console.log(post.type); // 'reddit'
console.log(post.title); // 'Mid-project on Cursor.. easy to context switch to Claude?'

// Reddit comment
const comment = await urlToJsonMarkdown(
  "https://www.reddit.com/r/LLMDevs/comments/1l6usee/comment/mwsl58w/"
);
console.log(comment.type); // 'reddit'
console.log(comment.title); // 'I've tried a handful of evaluation tools, and here's what I've learned from using them:'
```

### Generic Website

```typescript
const webpage = await urlToJsonMarkdown("https://paradite.github.io/");
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
