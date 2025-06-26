import { urlToJsonMarkdown } from "../index.js";
import * as fs from 'fs';
import * as path from 'path';

// Mock fetch globally
global.fetch = jest.fn();

// Load real Reddit sample data
const sampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'sample.json'), 'utf-8')
);

describe("urlToJsonMarkdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw error for non-Reddit URLs", async () => {
    await expect(urlToJsonMarkdown("https://example.com")).rejects.toThrow(
      "Only Reddit URLs are currently supported"
    );
  });

  test("should successfully convert real Reddit post to JSON/Markdown", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => sampleData
    });

    const result = await urlToJsonMarkdown("https://www.reddit.com/r/ClaudeAI/comments/1le69jw/midproject_on_cursor_easy_to_context_switch_to/");
    
    expect(result.title).toBe("Mid-project on Cursor.. easy to context switch to Claude?");
    expect(result.content).toContain("# Mid-project on Cursor.. easy to context switch to Claude?");
    expect(result.content).toContain("Hi everyone,");
    expect(result.content).toContain("I'm spinning up a somewhat weighty project");
    expect(result.content).toContain("by *goForIt07*");
    expect(result.content).toContain("↑ 5/ ↓ 0");
    expect(result.content).toContain("[permalink](https://reddit.com/r/ClaudeAI/comments/1le69jw/midproject_on_cursor_easy_to_context_switch_to/)");
  });

  test("should handle Reddit post without selftext", async () => {
    const sampleDataNoSelftext = JSON.parse(JSON.stringify(sampleData));
    sampleDataNoSelftext[0].data.children[0].data.selftext = "";
    sampleDataNoSelftext[0].data.children[0].data.title = "Link Post Only";

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => sampleDataNoSelftext
    });

    const result = await urlToJsonMarkdown("https://www.reddit.com/r/test/comments/456/link_post");
    
    expect(result.title).toBe("Link Post Only");
    expect(result.content).toContain("# Link Post Only");
    expect(result.content).not.toContain("Hi everyone,");
  });

  test("should throw error when Reddit returns HTML", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/html' }
    });

    await expect(urlToJsonMarkdown("https://www.reddit.com/r/test/comments/123/example")).rejects.toThrow(
      "Reddit returned HTML instead of JSON"
    );
  });

  test("should throw error when fetch fails", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests"
    });

    await expect(urlToJsonMarkdown("https://www.reddit.com/r/test/comments/123/example")).rejects.toThrow(
      "Failed to fetch Reddit data: 429 Too Many Requests"
    );
  });

  test("should use Chrome browser headers", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => sampleData
    });

    await urlToJsonMarkdown("https://www.reddit.com/r/test/comments/123/example");
    
    expect(fetch).toHaveBeenCalledWith(
      "https://www.reddit.com/r/test/comments/123/example.json",
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Chrome'),
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        })
      })
    );
  });

  test("should accept both www.reddit.com and reddit.com URLs", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => sampleData
    });

    const urls = [
      "https://www.reddit.com/r/ClaudeAI/comments/1le69jw/example",
      "https://reddit.com/r/ClaudeAI/comments/1le69jw/example"
    ];

    for (const url of urls) {
      const result = await urlToJsonMarkdown(url);
      expect(result.title).toBe("Mid-project on Cursor.. easy to context switch to Claude?");
    }
  });

  test("should format dates correctly in markdown output", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => sampleData
    });

    const result = await urlToJsonMarkdown("https://www.reddit.com/r/ClaudeAI/comments/1le69jw/example");
    
    // Check that the created date is formatted correctly
    expect(result.content).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M/);
  });
});
