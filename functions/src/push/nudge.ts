import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

export const sendDailyNudge = onSchedule({
  schedule: "0 9,14,19 * * *",
  timeZone: "UTC"
}, async (event) => {
  const db = admin.firestore();
  console.log("Sending daily nudge");
  // Implement sending FCM nudge formatted strictly with progress-oriented language:
  // "You earned 7 points, 5 more to target"
});
