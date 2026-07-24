import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const exportOkfBundle = onCall(async (request) => {
  const db = admin.firestore();
  console.log("Exporting OKF bundle");
  // Implement logic to export full system state as Markdown files into okf-export/
  return { success: true };
});
