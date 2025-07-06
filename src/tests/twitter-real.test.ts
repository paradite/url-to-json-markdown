import { urlToJsonMarkdown } from "../index.js";

describe("Twitter Real URL", () => {
  test("should work with X/Twitter URL", async () => {
    const result = await urlToJsonMarkdown("https://x.com/aidan_mclau/status/1941540160434495649");
    
    expect(result.type).toBe("twitter");
    expect(result.title).toBe("Tweet by Aidan McLaughlin");
    expect(result.content).toContain("what does claude code (with opus) offer that cursor agent doesn't?");
    expect(result.content).toContain("Author: Aidan McLaughlin");
    expect(result.content).toContain("URL: https://x.com/aidan_mclau/status/1941540160434495649");
  }, 10000);
});