import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface OKFDocument {
  path: string;
  content: string;
}

export const exportOkfBundle = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated to export data.");
  }

  const uid = request.auth.uid;
  const db = admin.firestore();
  const okfDocs: OKFDocument[] = [];

  // 1. Export Goals
  const goalsSnap = await db.collection("goals").where("uid", "==", uid).get();
  goalsSnap.forEach((doc) => {
    const data = doc.data();
    const yamlHeader = `---
id: "${doc.id}"
type: "goal"
timeframe: "${data.timeframe || 'monthly'}"
category: "${data.category || 'general'}"
status: "${data.status || 'active'}"
created_at: "${data.createdAt ? new Date(data.createdAt).toISOString() : ''}"
updated_at: "${data.updatedAt ? new Date(data.updatedAt).toISOString() : ''}"
---`;

    const markdownBody = `
# ${data.title || 'Untitled Goal'}

${data.description ? `${data.description}\n` : ''}
- **Key Result**: ${data.krTitle || 'N/A'}
- **KR Target**: ${data.krCurrent || 0} / ${data.krTarget || 0} ${data.krUnit || ''}
- **Effort Points**: ${data.effortCompletedPoints || 0} / ${data.effortTargetPoints || 0}
`;

    okfDocs.push({
      path: `goals/${doc.id}.md`,
      content: `${yamlHeader}\n${markdownBody.trim()}`
    });
  });

  // 2. Export Tasks
  const tasksSnap = await db.collection("tasks").where("uid", "==", uid).get();
  tasksSnap.forEach((doc) => {
    const data = doc.data();
    const yamlHeader = `---
id: "${doc.id}"
type: "task"
task_type: "${data.type || 'one-off'}"
category: "${data.category || 'general'}"
is_active: ${data.isActive !== undefined ? data.isActive : true}
goal_id: "${data.goalId || ''}"
weight: ${data.weight || 1}
estimated_minutes: ${data.estimatedMinutes || 0}
created_at: "${data.createdAt ? new Date(data.createdAt).toISOString() : ''}"
updated_at: "${data.updatedAt ? new Date(data.updatedAt).toISOString() : ''}"
---`;

    const markdownBody = `
# ${data.title || 'Untitled Task'}

${data.description ? `${data.description}\n` : ''}
- **Type**: ${data.type || 'one-off'}
- **Context**: ${data.when ? `When: ${data.when}` : ''} ${data.where ? `| Where: ${data.where}` : ''}
- **Streak**: ${data.streakCount || 0}
`;

    okfDocs.push({
      path: `tasks/${doc.id}.md`,
      content: `${yamlHeader}\n${markdownBody.trim()}`
    });
  });

  // 3. Export Daily Reflections
  const reflectionsSnap = await db.collection("reflections").where("uid", "==", uid).get();
  reflectionsSnap.forEach((doc) => {
    const data = doc.data();
    const yamlHeader = `---
id: "${doc.id}"
type: "daily_reflection"
date: "${data.date || ''}"
adherence_score: ${data.adherenceScore || 0}
timestamp: "${data.createdAt ? new Date(data.createdAt).toISOString() : ''}"
---`;

    const markdownBody = `
# רפלקציה יומית - ${data.date || ''}

### ניצחונות
${data.wins || 'אין'}

### למידות
${data.learnings || 'אין'}

### עדיפויות מחר
${Array.isArray(data.tomorrowPriorities) ? data.tomorrowPriorities.map((p: string) => `- ${p}`).join('\n') : 'אין'}
`;

    okfDocs.push({
      path: `reflections/${data.date || doc.id}.md`,
      content: `${yamlHeader}\n${markdownBody.trim()}`
    });
  });

  // 3. Export Reports
  const reportsSnap = await db.collection("reports").where("uid", "==", uid).get();
  reportsSnap.forEach((doc) => {
    const data = doc.data();
    const yamlHeader = `---
id: "${doc.id}"
type: "analysis_report"
generated: true
timestamp: "${data.createdAt ? new Date(data.createdAt).toISOString() : ''}"
---`;

    const insights = Array.isArray(data.insights) ? data.insights.map((i: string) => `- ${i}`).join('\n') : '';
    const markdownBody = `
# דוח ניתוח - ${doc.id}

## תובנות
${insights}
`;

    okfDocs.push({
      path: `reports/${doc.id}.md`,
      content: `${yamlHeader}\n${markdownBody.trim()}`
    });
  });

  return {
    success: true,
    totalDocuments: okfDocs.length,
    bundle: okfDocs
  };
});
