# url-to-json-markdown

A TypeScript library that fetches URLs and converts them to structured JSON and Markdown format.

Built by [16x Writer](https://writer.16x.engineer/) and [16x Eval](https://eval.16x.engineer/) team.

## Installation

```bash
npm install url-to-json-markdown
```

## Usage

```typescript
import { urlToJsonMarkdown } from "url-to-json-markdown";

// Reddit post
const post = await urlToJsonMarkdown(
  "https://www.reddit.com/r/example/comments/12345/title/"
);
console.log(post.title); // "Post Title"
console.log(post.content); // "# Post Title\n\nPost content...\n\nby _username_ (↑ 123) 12/25/2024"
console.log(post.type); // "reddit"

// Reddit comment
const comment = await urlToJsonMarkdown(
  "https://www.reddit.com/r/example/comments/12345/comment/abc123/"
);
console.log(comment.title); // "First line of comment..."
console.log(comment.content); // "# Comment by username\n\nComment text...\n\nby _username_ (↑ 45)"
console.log(comment.type); // "reddit"

// Generic web page
const webpage = await urlToJsonMarkdown("https://example.com/article");
console.log(webpage.title); // "Article Title"
console.log(webpage.content); // "# Article Title\n\nMain content as markdown..."
console.log(webpage.type); // "generic"
```

## API

### `urlToJsonMarkdown(url: string): Promise<UrlToJsonResult>`

```typescript
interface UrlToJsonResult {
  title: string;
  content: string;
  type: "reddit" | "generic";
}
```

## Supported URLs

- **Reddit**: Posts and comments from reddit.com
- **Generic**: Any website with automatic content extraction
