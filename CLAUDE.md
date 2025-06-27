# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library that fetches URLs and converts them to structured JSON and Markdown format. It supports Reddit posts/comments and generic web pages with intelligent content extraction.

### Core Architecture

- **Single entry point**: `src/index.ts` contains the main `urlToJsonMarkdown()` function
- **URL routing**: The library detects Reddit URLs vs generic URLs and routes to appropriate parsers
- **Reddit parser**: Uses Reddit's JSON API (`.json` suffix) to extract post/comment data
- **Generic parser**: Uses JSDOM + Turndown to convert HTML to markdown
- **Type safety**: Full TypeScript support with exported interfaces

### Key Components

- `parseRedditUrl()`: Handles Reddit posts and comments via JSON API
- `parseGenericUrl()`: Handles generic web pages with content extraction
- `formatPostToMarkdown()` / `formatCommentToMarkdown()`: Format Reddit data to markdown
- Content selectors: Intelligent main content detection for generic pages

## Development Commands

```bash
# Build the library (ESM + CJS)
npm run build

# Compile (alias for build)
npm run compile  

# Run all tests
npm test

# Run tests with minimal output (CI mode)
npm test:ci

# Install dependencies
npm install
```

## Testing

- **Framework**: Jest with ts-jest for TypeScript support
- **Configuration**: ESM support enabled in `jest.config.ts`
- **Test files**: Located in `src/tests/` with fixtures for sample data
- **Test types**: 
  - Sample tests (using fixture data)
  - Real URL tests (hitting actual Reddit/web endpoints)
- **Test patterns**: `*.test.ts` files are automatically discovered

## Build System

- **Bundler**: tsup for dual ESM/CJS output
- **Output**: `dist/` directory with `.js`, `.cjs`, and `.d.ts` files
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Module support**: Both ESM and CommonJS exports configured

## Dependencies

### Runtime Dependencies
- **jsdom**: HTML parsing and DOM manipulation for generic URLs
- **turndown**: HTML to Markdown conversion

### Development Dependencies  
- **TypeScript**: Language and type checking
- **Jest**: Testing framework with ts-jest integration
- **tsup**: Build tool for library packaging

## URL Support Patterns

### Reddit URLs
- Posts: `https://www.reddit.com/r/subreddit/comments/id/title/`
- Comments: `https://www.reddit.com/r/subreddit/comments/id/comment/comment_id/`
- Uses `.json` API suffix for data extraction

### Generic Web Pages
- Attempts content extraction from semantic HTML elements
- Selectors tried in order: `article`, `main`, `[role="main"]`, `.content`, `.post-content`, `.entry-content`, `.article-content`, `body`
- Automatically removes scripts, styles, navigation elements

## Error Handling Patterns

- Network failures and HTTP errors are propagated with descriptive messages  
- Reddit rate limiting detection (HTML response instead of JSON)
- Parsing errors for malformed data
- Type-safe error handling with proper Error instances