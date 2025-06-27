# url-to-json-markdown

A TypeScript library that fetches URLs and converts them to structured JSON and Markdown format.

## Features

- ✅ Fetch web content and convert to structured data
- ✅ Generate clean Markdown output with formatted content
- ✅ TypeScript support with full type definitions
- ✅ ESM and CommonJS compatibility

## Installation

```bash
npm install url-to-json-markdown
```

## Usage

```typescript
import { urlToJsonMarkdown } from 'url-to-json-markdown';

const result = await urlToJsonMarkdown('https://www.reddit.com/r/example/comments/12345/title/');

console.log(result.title);   // Content title
console.log(result.content); // Formatted markdown content
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
  title: string;    // The content title
  content: string;  // Formatted markdown content
}
```

## Supported URLs

**Currently supports Reddit URLs only** (more platforms coming soon):
- `https://www.reddit.com/r/subreddit/comments/...`
- `https://reddit.com/r/subreddit/comments/...`

## Error Handling

The library throws errors for:
- Unsupported URLs (currently non-Reddit URLs)
- Network failures
- Rate limiting or CORS restrictions
- Invalid responses from the target platform

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test
```
