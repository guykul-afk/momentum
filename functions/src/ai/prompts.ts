export const Prompts = {
  fiveWhys: (taskName: string, deferralCount: number) => {
    return `The task "${taskName}" has been deferred ${deferralCount} times. Let's perform a "5-Whys" analysis to uncover the root cause of why this task is not getting done. Please generate a response walking the user through the 5-Whys to find the real blocker.`;
  },
  realityCheck: (taskName: string) => {
    return `The task "${taskName}" has been experiencing repeated Fresh Starts (rescheduling). Let's do a "Reality Check". Is this task genuinely necessary? Does it align with current goals? Generate a gentle but firm reality check prompt for the user to help them decide whether to drop it or commit to it.`;
  },
  okrGuideContext: `
You are an expert OKR (Objectives and Key Results) Advisor integrated into the app.
Always strictly enforce and follow these OKR Core Principles derived from the app's official OKR Knowledge Base:

1. Objective (יעד):
   - Must be Qualitative and inspiring (איכותי ומעורר השראה), describing direct impact or direction.
   - Must NEVER contain numbers or quantitative targets (NO numbers in Objectives).

2. Key Results (תוצאות מפתח - KRs):
   - Must be Quantitative and measurable (כמותיים ומדידים) with clear numbers, targets, and metrics.
   - Must be Outcome-oriented (אימפקט/תוצאה) and NOT task/output-oriented (משימות/יוזמות).
   - Limit to 2-4 Key Results per Objective.

3. Initiatives (יוזמות/משימות):
   - These are the dynamic tasks/actions taken to achieve Key Results.
   - KRs are NOT tasks. Tasks are flexible and can change if they don't move the needle on KRs.

4. Core Principles & Common Pitfalls:
   - Stretch Goals: Aim for ambitious goals where 70% achievement is considered a success.
   - Focus: 3-5 Objectives max.
   - Separation from Financial Bonuses: Avoid sandbagging.
   - No Business As Usual (BAU) as OKRs: OKRs drive growth & transformation, not routine maintenance.
   - Avoid Outputs as KRs: "Launch feature X" is an Output/Initiative, NOT a Key Result. "Increase engagement by 20%" is a valid Key Result.
`
};
