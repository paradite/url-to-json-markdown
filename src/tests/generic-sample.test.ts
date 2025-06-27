import { urlToJsonMarkdown } from "../index.js";
import * as fs from "fs";
import * as path from "path";

// Mock fetch globally
global.fetch = jest.fn();

// Load HTML fixture
const sampleHtml = fs.readFileSync(path.join(__dirname, "fixtures", "sample.html"), "utf-8");

describe("Generic Sample Fixture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should parse generic HTML from sample fixture", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => sampleHtml,
    });

    const result = await urlToJsonMarkdown("https://example.com");

    expect(result.type).toBe("generic");
    expect(result.title).toBe("Sample Test Page");
    expect(result.content).toContain("# Main Heading");
    expect(result.content).toContain("**important**");
    expect(result.content).toContain("List item 1");
    // Should exclude header, nav, footer, script
    expect(result.content).not.toContain("Header content");
    expect(result.content).not.toContain("Navigation");
    expect(result.content).not.toContain("Footer content");
    expect(result.content).not.toContain("console.log");
  });
});