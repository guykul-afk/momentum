import { z } from "zod";

export const InboxItemAnalysisSchema = z.object({
  item_id: z.string().describe("The ID of the inbox item being analyzed"),
  refined_text: z.string().describe("Refined and actionable text for the item"),
  track: z.enum(["active", "backlog", "delegate", "drop", "incubate"]).describe("Suggested track for the item"),
  suggested_goal_id: z.string().optional().describe("ID of a related goal, if applicable"),
  suggested_weight: z.number().optional().describe("Suggested weight or priority (1-5)"),
  is_project: z.boolean().describe("Whether this item is complex enough to be a project"),
  split_into: z.array(z.string()).optional().describe("If it's a project, list of sub-tasks it can be split into"),
  suggested_when_where: z.string().optional().describe("Suggested context (when/where) to do this task"),
  reasoning: z.string().describe("Explanation for the recommendations made")
});

export const InboxBatchAnalysisSchema = z.object({
  results: z.array(InboxItemAnalysisSchema)
});
