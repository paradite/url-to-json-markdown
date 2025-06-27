import { urlToJsonMarkdown } from "../index.js";
import * as fs from "fs";
import * as path from "path";

// Mock fetch globally
global.fetch = jest.fn();

// Load real Reddit sample data
const sampleData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sample.json"), "utf-8")
);

describe("urlToJsonMarkdown - Sample Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw error for non-Reddit URLs", async () => {
    await expect(urlToJsonMarkdown("https://example.com")).rejects.toThrow(
      "Only Reddit URLs are currently supported"
    );
  });

  test("should successfully convert Reddit post with sample data", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => sampleData,
    });

    const result = await urlToJsonMarkdown(
      "https://www.reddit.com/r/ClaudeAI/comments/1le69jw/test/"
    );

    expect(result.title).toBe(
      "Mid-project on Cursor.. easy to context switch to Claude?"
    );
    expect(result.content).toContain(
      "# Mid-project on Cursor.. easy to context switch to Claude?"
    );
    expect(result.content).toContain("Hi everyone,");
    expect(result.content).toContain("by *goForIt07*");
  });
});
