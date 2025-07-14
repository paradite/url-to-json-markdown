import { urlToJsonMarkdown } from '../index';

describe('X.ai URL with Archive Fallback', () => {
  it('should work with x.ai URL using archive fallback', async () => {
    const result = await urlToJsonMarkdown('https://x.ai/news/grok-4', {
      enableArchiveFallback: true
    });

    // Assert basic structure
    expect(result).toBeDefined();
    expect(result.type).toBe('generic');
    expect(result.title).toBeDefined();
    expect(result.content).toBeDefined();

    // Assert title indicates archived content
    expect(result.title).toMatch(/\[Archived\]/);
    expect(result.title).toMatch(/Grok.*4/i);

    // Assert content contains expected information about Grok 4
    expect(result.content).toMatch(/Grok.*4/i);
    expect(result.content).toMatch(/intelligent.*model/i);
    expect(result.content.length).toBeGreaterThan(1000);

    // Assert content is in markdown format
    expect(result.content).toMatch(/^#/m); // Contains headers
    expect(result.content).toMatch(/\[.*\]\(.*\)/); // Contains links
  }, 30000); // 30 second timeout for network request
});