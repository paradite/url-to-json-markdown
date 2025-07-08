#!/usr/bin/env node

import { urlToJsonMarkdown } from './index.js';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.error('Usage: url-to-json-markdown <url> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --client-id <id>      Reddit client ID (for authenticated requests)');
    console.error('  --client-secret <secret>  Reddit client secret (for authenticated requests)');
    console.error('  --include-comments    Include comments in the output');
    console.error('  --help                Show this help message');
    console.error('');
    console.error('Examples:');
    console.error('  url-to-json-markdown https://www.reddit.com/r/programming/comments/123/title/');
    console.error('  url-to-json-markdown https://example.com/article --include-comments');
    console.error('  url-to-json-markdown https://reddit.com/r/test/comments/123/ --client-id abc --client-secret xyz');
    process.exit(1);
  }

  const url = args[0];
  const options: any = {};

  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help') {
      console.log('Usage: url-to-json-markdown <url> [options]');
      console.log('');
      console.log('Options:');
      console.log('  --client-id <id>      Reddit client ID (for authenticated requests)');
      console.log('  --client-secret <secret>  Reddit client secret (for authenticated requests)');
      console.log('  --include-comments    Include comments in the output');
      console.log('  --help                Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  url-to-json-markdown https://www.reddit.com/r/programming/comments/123/title/');
      console.log('  url-to-json-markdown https://example.com/article --include-comments');
      console.log('  url-to-json-markdown https://reddit.com/r/test/comments/123/ --client-id abc --client-secret xyz');
      process.exit(0);
    } else if (arg === '--client-id') {
      if (i + 1 >= args.length) {
        console.error('Error: --client-id requires a value');
        process.exit(1);
      }
      options.clientId = args[++i];
    } else if (arg === '--client-secret') {
      if (i + 1 >= args.length) {
        console.error('Error: --client-secret requires a value');
        process.exit(1);
      }
      options.clientSecret = args[++i];
    } else if (arg === '--include-comments') {
      options.includeComments = true;
    } else {
      console.error(`Error: Unknown option ${arg}`);
      process.exit(1);
    }
  }

  try {
    const result = await urlToJsonMarkdown(url, options);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});