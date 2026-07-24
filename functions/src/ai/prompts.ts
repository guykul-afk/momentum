export const Prompts = {
  fiveWhys: (taskName: string, deferralCount: number) => {
    return `The task "${taskName}" has been deferred ${deferralCount} times. Let's perform a "5-Whys" analysis to uncover the root cause of why this task is not getting done. Please generate a response walking the user through the 5-Whys to find the real blocker.`;
  },
  realityCheck: (taskName: string) => {
    return `The task "${taskName}" has been experiencing repeated Fresh Starts (rescheduling). Let's do a "Reality Check". Is this task genuinely necessary? Does it align with current goals? Generate a gentle but firm reality check prompt for the user to help them decide whether to drop it or commit to it.`;
  }
};
