import { urlToJsonMarkdown } from "../index.js";

describe("Generic Real URL", () => {
  test("should work with real website", async () => {
    const result = await urlToJsonMarkdown("https://paradite.github.io/");
    
    expect(result.type).toBe("generic");
    expect(result.title).toBe("Zhu Liang");
    expect(result.content).toContain("Hi, I am Zhu Liang");
  }, 10000);

  test("should work with Cursor blog URL", async () => {
    const result = await urlToJsonMarkdown("https://cursor.com/blog/june-2025-pricing");
    
    expect(result.type).toBe("generic");
    expect(result.title).toBe("Clarifying Our Pricing | Cursor - The AI Code Editor");
    expect(result.content).toContain("$20 of frontier model usage per month at API pricing");
  }, 10000);

});