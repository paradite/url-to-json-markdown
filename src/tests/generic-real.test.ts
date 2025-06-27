import { urlToJsonMarkdown } from "../index.js";

describe("Generic Real URL", () => {
  test("should work with real website", async () => {
    const result = await urlToJsonMarkdown("https://paradite.github.io/");
    
    expect(result.type).toBe("generic");
    expect(result.title).toBe("Zhu Liang");
    expect(result.content).toContain("Hi, I am Zhu Liang");
  }, 10000);
});