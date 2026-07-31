/**
 * OKR Knowledge Base & AI Advisor Guidelines
 * Derived from okr_comprehensive_guide.md
 */

export const OKR_KNOWLEDGE_BASE = {
  title: "המדריך המלא לשיטת OKR (Objectives and Key Results)",
  coreComponents: {
    objective: {
      definition: "היעד מגדיר *מה* רוצים להשיג.",
      rules: [
        "איכותי ולא כמותי: מתווה כיוון ומטרה, ללא מספרים.",
        "מעורר השראה ושאפתני: ברור, קליט ומניע לפעולה (Stretch Goal)."
      ]
    },
    keyResult: {
      definition: "תוצאות המפתח מגדירות *איך נדע* שהשגנו את היעד.",
      rules: [
        "מדידות וכמותיות: חייבות לכלול מספרים, אחוזים או מדדים ברורים.",
        "ממוקדות תוצאה (Outcomes): מודדות שינוי או אימפקט, ולא מטלות/יוזמות (Outputs).",
        "מוגבלות: 2-4 תוצאות מפתח לכל יעד."
      ]
    },
    initiatives: {
      definition: "הפעולות/המשימות שעושים כדי לקדם את תוצאות המפתח.",
      rules: [
        "ניתנות לשינוי וגמישות במהלך הרבעון/התקופה אם אינן מביאות את התוצאה המקווה."
      ]
    }
  },
  guidingPrinciples: [
    "שאפתנות ומתיחת גבולות (Stretch Goals): 70% הצלחה נחשב כהצלחה מצוינת.",
    "מיקוד (Focus): 3-5 יעדים בלבד.",
    "הפרדה מתגמול כספי: מניעת Sandbagging והערכת חסר של יעדים.",
    "שקיפות (Transparency): יעדים גלויים לכולם לסנכרון ועבודת צוות.",
    "אג'יליות ומחזוריות קצרה: בדיקה שבועית/דו-שבועית ועדכון רבעוני.",
    "הגדרה משולבת: Top-Down combined with Bottom-Up."
  ],
  commonMistakes: [
    {
      mistake: "משימות כתוצאות (Outputs vs Outcomes)",
      explanation: "כתיבת KR כגון 'השקת פיצ'ר X' במקום 'העלאת השימוש ב-20%'",
      solution: "מיקוד באימפקט ושינוי התנהגותי/עסקי ולא בפעולת הביצוע."
    },
    {
      mistake: "Business As Usual (BAU)",
      explanation: "הכנסת עבודת תחזוקה שוטפת ל-OKR",
      solution: "ה-OKR מיועד לצמיחה ושינוי, לא למשימות שוטפות."
    },
    {
      mistake: "יותר מדי יעדים",
      explanation: "הגדרת עשרות יעדים המפזרים פוקוס",
      solution: "היצמדות ל-3-5 יעדים בלבד."
    },
    {
      mistake: "בלבול בין KPI ל-OKR",
      explanation: "התייחסות למדדי בריאות (KPI) כ-OKR",
      solution: "KPI הוא לוח המחוונים, OKR הוא היעד וה-GPS לאן מתקדמים."
    }
  ]
};

export interface OkrEvaluation {
  isGood: boolean;
  tip: string;
  suggestion?: string;
  violations?: string[];
}

/**
 * Evaluates an Objective title against OKR rules.
 */
export function evaluateObjective(title: string): OkrEvaluation {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return { isGood: false, tip: "אנא הזן כותרת ליעד." };
  }

  const containsNumbers = /\d+/.test(cleanTitle);
  const taskWords = ['פיתוח', 'בנייה', 'השקה', 'כתיבה', 'יצירת', 'פרויקט', 'להעלות', 'להוריד', 'לקנות'];
  const isTaskLike = taskWords.some((w) => cleanTitle.includes(w));

  if (containsNumbers) {
    return {
      isGood: false,
      tip: "על פי עקרונות ה-OKR, יעד (Objective) אמור להיות איכותי ומעורר השראה, ללא מספרים. את המספרים והמדדים הכמותיים יש לשבץ ב-Key Results!",
      suggestion: `להשיג פריצת דרך משמעותית ב${cleanTitle.replace(/\d+/g, '').replace(/%/g, '').trim()}`,
      violations: ["היעד מכיל מספרים/מדדים כמותיים"]
    };
  }

  if (isTaskLike) {
    return {
      isGood: false,
      tip: "הניסוח הנוכחי נשמע כמו משימה (Output/Initiative) ולא כמו יעד אסטרטגי איכותי. ב-OKR יעד מתמקד באימפקט, בשינוי ובמציאות החדשה שרוצים ליצור.",
      suggestion: `להציב סטנדרט חדש של מצוינות ב${cleanTitle.replace(/פיתוח|בנייה|השקה|כתיבה|יצירת|פרויקט/g, '').trim()}`,
      violations: ["היעד מנוסח כיוזמה/משימה (Output) ולא כאימפקט (Outcome)"]
    };
  }

  return {
    isGood: true,
    tip: "ניסוח מצוין! היעד מנוסח באופן איכותי, מעורר השראה ונטול מספרים, בהתאם לעקרונות ה-OKR.",
    suggestion: `להוביל ולהביא למצוינות ב${cleanTitle}`
  };
}

/**
 * Evaluates a Key Result title against OKR rules.
 */
export function evaluateKeyResult(title: string, target?: number, unit?: string): OkrEvaluation {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return { isGood: false, tip: "אנא הזן תיאור לתוצאת המפתח." };
  }

  const taskWords = ['פיתוח', 'בנייה', 'השקה', 'כתיבה', 'הכנת', 'קנייה', 'פרויקט'];
  const isTaskLike = taskWords.some((w) => cleanTitle.includes(w));

  if (isTaskLike) {
    return {
      isGood: false,
      tip: "במתודולוגיית OKR, תוצאת מפתח (KR) אמורה למדוד תוצאה/אימפקט (Outcome) ולא משימה/פרויקט (Output/Initiative). למשל: במקום 'בניית אתר' -> 'הגדלת תנועת המשתמשים ב-50%'.",
      suggestion: target && unit
        ? `להגדיל את ${cleanTitle.replace(/פיתוח|בנייה|השקה|כתיבה|הכנת|קנייה|פרויקט/g, '').trim()} ל-${target} ${unit}`
        : `הגדלת אימפקט ב-${cleanTitle.replace(/פיתוח|בנייה|השקה|כתיבה|הכנת|קנייה|פרויקט/g, '').trim()}`,
      violations: ["תוצאת המפתח מנוסחת כמשימה (Output) ולא כתוצאה מדידה (Outcome)"]
    };
  }

  return {
    isGood: true,
    tip: "ניסוח תוצאת מפתח (KR) מצוין! המדד מודד תוצאה מדידה, כמותית וברורה.",
    suggestion: target && unit ? `השגת ${target} ${unit} ב-${cleanTitle}` : undefined
  };
}
