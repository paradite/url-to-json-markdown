import { urlToJsonMarkdown } from "../index.js";

describe("Reddit Real URL", () => {
  test("should work with real ClaudeAI Reddit post", async () => {
    const result = await urlToJsonMarkdown("https://www.reddit.com/r/ClaudeAI/comments/1le69jw/midproject_on_cursor_easy_to_context_switch_to/");
    
    expect(result.type).toBe("reddit");
    expect(result.title).toBe("Mid-project on Cursor.. easy to context switch to Claude?");
    expect(result.content).toContain("Hi everyone,");
    expect(result.content).toContain("by *goForIt07*");
  }, 10000);
});