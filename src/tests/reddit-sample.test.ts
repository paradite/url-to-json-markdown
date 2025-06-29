import { urlToJsonMarkdown } from '../index.js';
import * as fs from 'fs';
import * as path from 'path';

// Mock fetch globally
global.fetch = jest.fn();

// Dummy options for mocked tests
const dummyOptions = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
};

// Load Reddit JSON fixture
const redditSampleData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'fixtures', 'reddit-sample.json'),
    'utf-8'
  )
);

describe('Reddit Sample Fixture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should parse Reddit post from sample fixture', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => redditSampleData,
    });

    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/',
      dummyOptions
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe(
      'Mid-project on Cursor.. easy to context switch to Claude?'
    );
    expect(result.content).toContain(
      '# Mid-project on Cursor.. easy to context switch to Claude?'
    );
    expect(result.content).toContain('Hi everyone,');
    expect(result.content).toContain('by *goForIt07*');
    expect(result.content).toContain('↑ 5/ ↓ 0');
  });

  test('should parse Reddit comment from sample fixture', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => redditSampleData,
    });

    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/comment/mye3h38/',
      dummyOptions
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe(
      'Branch it and give it a roll man. I wouldnt worry about the context one bit with 1,900 lines. You...'
    );
    expect(result.content).toContain(
      'Comment by Motor_System_6171 on "Mid-project on Cursor.. easy to context switch to Claude?"'
    );
    expect(result.content).toContain('Branch it and give it a roll man');
    expect(result.content).toContain('by *Motor_System_6171*');
    expect(result.content).toContain('↑ 3/ ↓ 0');
  });

  test('should parse Reddit post without credentials using fallback', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => redditSampleData,
    });

    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/'
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe(
      'Mid-project on Cursor.. easy to context switch to Claude?'
    );
    expect(result.content).toContain(
      '# Mid-project on Cursor.. easy to context switch to Claude?'
    );
    expect(result.content).toContain('Hi everyone,');
    expect(result.content).toContain('by *goForIt07*');
    expect(result.content).toContain('↑ 5/ ↓ 0');

    // Verify it used the public JSON API with browser user agent
    expect(fetch).toHaveBeenCalledWith(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test.json',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      }
    );
  });

  test('should handle rate limiting when using fallback without credentials', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/html' },
      json: async () => ({}),
    });

    await expect(
      urlToJsonMarkdown(
        'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/'
      )
    ).rejects.toThrow(
      'Reddit returned HTML instead of JSON. This may be due to rate limiting or CORS restrictions. Consider providing Reddit credentials for more reliable access.'
    );
  });

  test('should include comments when requested', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => redditSampleData,
    });

    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/',
      { ...dummyOptions, includeComments: true }
    );

    expect(result.type).toBe('reddit');
    expect(result.content).toContain('## Comments');
    expect(result.content).toContain('##### You can use both, and focus on CC');
    expect(result.content).toContain('├─ Thanks for the advice');
    expect(result.content).toContain('└────');
    expect(result.content).toContain('by *goForIt07*');
  });

  test('should not include comments when includeComments is false', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => redditSampleData,
    });

    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/',
      { ...dummyOptions, includeComments: false }
    );

    expect(result.type).toBe('reddit');
    expect(result.content).not.toContain('## Comments');
    expect(result.content).not.toContain('You can use both, and focus on CC');
  });

  test('should not include comments when option is not specified', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => redditSampleData,
    });

    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/',
      dummyOptions
    );

    expect(result.type).toBe('reddit');
    expect(result.content).not.toContain('## Comments');
    expect(result.content).not.toContain('You can use both, and focus on CC');
  });
});
