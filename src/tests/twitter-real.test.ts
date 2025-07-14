import { urlToJsonMarkdown } from '../index.js';

describe('Twitter Real URL', () => {
  test('should work with X/Twitter URL', async () => {
    const result = await urlToJsonMarkdown(
      'https://x.com/paradite_/status/1925638145195876511'
    );

    expect(result.type).toBe('twitter');
    expect(result.title).toBe('Tweet by Zhu Liang');
    expect(result.content).toContain('Claude Opus 4');
    expect(result.content).toContain('Author: Zhu Liang');
    expect(result.content).toContain(
      'URL: https://x.com/paradite_/status/1925638145195876511'
    );
  }, 10000);
});
