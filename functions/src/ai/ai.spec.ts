import { analyzeInboxBatch, analyzeWeek, analyzeMonth } from "./index";
import { Prompts } from "./prompts";

// Mock @google/genai and firebase-functions/params
jest.mock("firebase-functions/params", () => ({
  defineSecret: jest.fn(() => ({
    value: jest.fn().mockReturnValue(undefined)
  }))
}));

jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: JSON.stringify({
              results: [
                {
                  item_id: "1",
                  refined_text: "Test task",
                  track: "active",
                  is_project: false,
                  reasoning: "Test reasoning"
                }
              ]
            })
          })
        }
      };
    }),
    Type: {
      OBJECT: "object",
      ARRAY: "array",
      STRING: "string",
      NUMBER: "number",
      BOOLEAN: "boolean"
    }
  };
});

describe("AI Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeInboxBatch", () => {
    it("should throw error if API key is missing", async () => {
      await expect(analyzeInboxBatch([{ item_id: "1", text: "test" }]))
        .rejects.toThrow("Missing GEMINI_API_KEY secret");
    });

    it("should process items successfully with mock API key", async () => {
      const result = await analyzeInboxBatch([{ item_id: "1", text: "test" }], "mock-key");
      expect(result.results).toHaveLength(1);
      expect(result.results[0].item_id).toBe("1");
      expect(result.results[0].track).toBe("active");
    });
  });

  describe("analyzeWeek", () => {
    it("should return analysis text", async () => {
      const { GoogleGenAI } = require("@google/genai");
      GoogleGenAI.mockImplementationOnce(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({ text: "Weekly analysis" })
        }
      }));
      const result = await analyzeWeek({ data: "okf-bundle" }, "mock-key");
      expect(result).toBe("Weekly analysis");
    });
  });

  describe("analyzeMonth", () => {
    it("should return analysis text", async () => {
      const { GoogleGenAI } = require("@google/genai");
      GoogleGenAI.mockImplementationOnce(() => ({
        models: {
          generateContent: jest.fn().mockResolvedValue({ text: "Monthly analysis" })
        }
      }));
      const result = await analyzeMonth({ data: "okf-bundle" }, "mock-key");
      expect(result).toBe("Monthly analysis");
    });
  });

  describe("prompts", () => {
    it("fiveWhys should generate correct prompt", () => {
      const prompt = Prompts.fiveWhys("Do taxes", 3);
      expect(prompt).toContain("Do taxes");
      expect(prompt).toContain("3 times");
      expect(prompt).toContain("5-Whys");
    });

    it("realityCheck should generate correct prompt", () => {
      const prompt = Prompts.realityCheck("Learn unicycle");
      expect(prompt).toContain("Learn unicycle");
      expect(prompt).toContain("Reality Check");
    });
  });
});
