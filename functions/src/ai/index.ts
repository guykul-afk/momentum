import { GoogleGenAI, Type } from "@google/genai";
import { defineSecret } from "firebase-functions/params";
import { InboxBatchAnalysisSchema } from "./schemas/triage";

const geminiApiKeySecret = defineSecret("GEMINI_API_KEY");

// Allow passing a mock key for tests
function getGeminiClient(mockKey?: string) {
  const apiKey = mockKey || geminiApiKeySecret.value();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY secret");
  }
  return new GoogleGenAI({ apiKey });
}

export async function analyzeInboxBatch(items: any[], mockApiKey?: string) {
  const ai = getGeminiClient(mockApiKey);
  
  // Create a JSON schema that matches the Zod schema for structured output
  // We manually map it here since @google/genai expects a JSON schema object
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      results: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item_id: { type: Type.STRING, description: "The ID of the inbox item being analyzed" },
            refined_text: { type: Type.STRING, description: "Refined and actionable text for the item" },
            track: { type: Type.STRING, enum: ["active", "backlog", "delegate", "drop", "incubate"], description: "Suggested track for the item" },
            suggested_goal_id: { type: Type.STRING, description: "ID of a related goal, if applicable", nullable: true },
            suggested_weight: { type: Type.NUMBER, description: "Suggested weight or priority (1-5)", nullable: true },
            is_project: { type: Type.BOOLEAN, description: "Whether this item is complex enough to be a project" },
            split_into: { type: Type.ARRAY, items: { type: Type.STRING }, description: "If it's a project, list of sub-tasks it can be split into", nullable: true },
            suggested_when_where: { type: Type.STRING, description: "Suggested context (when/where) to do this task", nullable: true },
            reasoning: { type: Type.STRING, description: "Explanation for the recommendations made" }
          },
          required: ["item_id", "refined_text", "track", "is_project", "reasoning"]
        }
      }
    },
    required: ["results"]
  };

  const prompt = `Analyze the following inbox items and provide a structured triage recommendation for each:\n${JSON.stringify(items, null, 2)}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }
  
  // Zod validation step to ensure strict output
  return InboxBatchAnalysisSchema.parse(JSON.parse(response.text));
}

export async function analyzeWeek(okfBundle: any, mockApiKey?: string) {
  const ai = getGeminiClient(mockApiKey);
  const prompt = `Analyze this weekly OKF bundle and provide observations and recommendations:\n${JSON.stringify(okfBundle, null, 2)}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro",
    contents: prompt,
  });
  
  return response.text;
}

export async function analyzeMonth(okfBundle: any, mockApiKey?: string) {
  const ai = getGeminiClient(mockApiKey);
  const prompt = `Analyze this monthly OKF bundle and provide observations and recommendations:\n${JSON.stringify(okfBundle, null, 2)}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro",
    contents: prompt,
  });
  
  return response.text;
}
