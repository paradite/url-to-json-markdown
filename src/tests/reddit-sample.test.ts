import { urlToJsonMarkdown } from "../index.js";
import * as fs from "fs";
import * as path from "path";

// Mock fetch globally
global.fetch = jest.fn();

// Dummy credentials for mocked tests
const dummyCredentials = {
  clientId: "test_client_id",
  clientSecret: "test_client_secret"
};

// Load Reddit JSON fixture
const redditSampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures", "reddit-sample.json"), "utf-8")
);

describe("Reddit Sample Fixture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should parse Reddit post from sample fixture", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => redditSampleData,
    });

    const result = await urlToJsonMarkdown(
      "https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/",
      dummyCredentials
    );

    expect(result.type).toBe("reddit");
    expect(result.title).toBe("Mid-project on Cursor.. easy to context switch to Claude?");
    expect(result.content).toContain("# Mid-project on Cursor.. easy to context switch to Claude?");
    expect(result.content).toContain("Hi everyone,");
    expect(result.content).toContain("by *goForIt07*");
    expect(result.content).toContain("↑ 5/ ↓ 0");
  });

  test("should parse Reddit comment from sample fixture", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => redditSampleData,
    });

    const result = await urlToJsonMarkdown(
      "https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/comment/mye3h38/",
      dummyCredentials
    );

    expect(result.type).toBe("reddit");
    expect(result.title).toBe("Branch it and give it a roll man. I wouldnt worry about the context one bit with 1,900 lines. You...");
    expect(result.content).toContain("Comment by Motor_System_6171");
    expect(result.content).toContain("Branch it and give it a roll man");
    expect(result.content).toContain("by *Motor_System_6171*");
    expect(result.content).toContain("↑ 3/ ↓ 0");
  });
});