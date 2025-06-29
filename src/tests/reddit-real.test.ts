import { urlToJsonMarkdown } from "../index.js";

const redditCredentials = {
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!
};

describe("Reddit Real URL", () => {
  test("should work with Reddit post", async () => {
    const result = await urlToJsonMarkdown(
      "https://www.reddit.com/r/ClaudeAI/comments/1le69jw/midproject_on_cursor_easy_to_context_switch_to/",
      redditCredentials
    );

    expect(result.type).toBe("reddit");
    expect(result.title).toBe(
      "Mid-project on Cursor.. easy to context switch to Claude?"
    );
    expect(result.content).toContain("Hi everyone,");
    expect(result.content).toContain("by *goForIt07*");
  }, 10000);

  test("should work with Reddit comment URL", async () => {
    const result = await urlToJsonMarkdown(
      "https://www.reddit.com/r/LLMDevs/comments/1l6usee/comment/mwsl58w/",
      redditCredentials
    );

    expect(result.type).toBe("reddit");
    expect(result.title).toBe("I've tried a handful of evaluation tools, and here's what I've learned from using them:");
    expect(result.content).toContain("handful of evaluation tools");
    expect(result.content).toContain("Comment by UnitApprehensive5150");
    expect(result.content).toContain("by *UnitApprehensive5150*");
    expect(result.content).toContain("OpenAI Eval (Auto-Judge)");
    expect(result.content).toContain("permalink");
  }, 10000);

  test("should work with LLMDevs Reddit main post", async () => {
    const result = await urlToJsonMarkdown(
      "https://www.reddit.com/r/LLMDevs/comments/1l6usee/what_is_your_favorite_eval_tech_stack_for_an_llm/",
      redditCredentials
    );

    expect(result.type).toBe("reddit");
    expect(result.title).toBe("What is your favorite eval tech stack for an LLM system");
    expect(result.content).toContain("I am not yet satisfied with any tool for eval");
    expect(result.content).toContain("by *ephemeral404*");
    expect(result.content).toContain("openai eval with auto judge");
    expect(result.content).toContain("permalink");
  }, 10000);
});
