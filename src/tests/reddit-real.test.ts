import { urlToJsonMarkdown } from '../index.js';

const redditCredentials = {
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
};

describe('Reddit Real URL', () => {
  test('should work with Reddit post', async () => {
    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/midproject_on_cursor_easy_to_context_switch_to/',
      redditCredentials
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe(
      'Mid-project on Cursor.. easy to context switch to Claude?'
    );
    expect(result.content).toContain('Hi everyone,');
    expect(result.content).toContain('by *goForIt07*');
  }, 10000);

  test('should work with Reddit comment URL', async () => {
    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/LLMDevs/comments/1l6usee/comment/mwsl58w/',
      redditCredentials
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe(
      "I've tried a handful of evaluation tools, and here's what I've learned from using them:"
    );
    expect(result.content).toContain('handful of evaluation tools');
    expect(result.content).toContain(
      'Comment by UnitApprehensive5150 on "What is your favorite eval tech stack for an LLM system"'
    );
    expect(result.content).toContain('by *UnitApprehensive5150*');
    expect(result.content).toContain('OpenAI Eval (Auto-Judge)');
    expect(result.content).toContain('permalink');
  }, 10000);

  test('should work with LLMDevs Reddit main post', async () => {
    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/LLMDevs/comments/1l6usee/what_is_your_favorite_eval_tech_stack_for_an_llm/',
      redditCredentials
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe(
      'What is your favorite eval tech stack for an LLM system'
    );
    expect(result.content).toContain(
      'I am not yet satisfied with any tool for eval'
    );
    expect(result.content).toContain('by *ephemeral404*');
    expect(result.content).toContain('openai eval with auto judge');
    expect(result.content).toContain('permalink');
  }, 10000);

  test('should work with Reddit post using fallback without credentials', async () => {
    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ClaudeAI/comments/1le69jw/midproject_on_cursor_easy_to_context_switch_to/'
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe(
      'Mid-project on Cursor.. easy to context switch to Claude?'
    );
    expect(result.content).toContain('Hi everyone,');
    expect(result.content).toContain('by *goForIt07*');
  }, 15000); // Longer timeout as fallback may be slower or hit rate limits

  test('should work with Reddit comment URL and include child comments', async () => {
    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ChatGPTCoding/comments/1la1ftd/comment/mxhh9tz/',
      { ...redditCredentials, includeComments: true }
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe(
      "4 is better than 3.7 critically due to the fact that it doesn't typically go above and beyond wha..."
    );
    expect(result.content).toContain('Comment by');
    expect(result.content).toContain('4 is better than 3.7 critically');
    expect(result.content).toContain('permalink');

    // Assert that replies are included
    expect(result.content).toContain('## Replies');
    // Should have tree structure for replies
    expect(result.content).toContain('├─');
    // Assert specific replies that should be present
    expect(result.content).toContain('turning down of the overeagerness');
    expect(result.content).toContain('StuntMan_Mike_');
    expect(result.content).toContain('yep. 4 is better');
    expect(result.content).toContain('ohmypaka');
  }, 10000);

  test('should work with Reddit post and include all comments', async () => {
    const result = await urlToJsonMarkdown(
      'https://www.reddit.com/r/ChatGPTCoding/comments/1la1ftd/claude_sonnet_37_vs_40/',
      { ...redditCredentials, includeComments: true }
    );

    expect(result.type).toBe('reddit');
    expect(result.title).toBe('Claude Sonnet 3.7 vs 4.0');
    expect(result.content).toContain('# Claude Sonnet 3.7 vs 4.0');
    expect(result.content).toContain('permalink');

    // Assert that comments are included
    expect(result.content).toContain('## Comments');
    // Should have tree structure for comments
    expect(result.content).toContain('├─');
    expect(result.content).toContain('##### ');
    // Assert some specific comments that should be present
    expect(result.content).toContain('4 is better than 3.7 critically');
    expect(result.content).toContain('turning down of the overeagerness');
    expect(result.content).toContain('yep. 4 is better');
    // Should contain multiple comment authors
    expect(result.content).toContain('StuntMan_Mike_');
    expect(result.content).toContain('ohmypaka');
  }, 15000);
});
