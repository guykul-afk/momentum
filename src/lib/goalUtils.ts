import { Goal } from '@/types/models';

/**
 * Calculates remaining days until the end of the annual goal (Dec 31 of target year or endDate).
 */
export function getAnnualRemainingInfo(goal: Goal): { daysLeft: number; monthsLeft: number; text: string; endDateStr: string } {
  const now = new Date();
  let targetYear = goal.targetYear;

  if (!targetYear && goal.endDate) {
    targetYear = new Date(goal.endDate).getFullYear();
  }
  if (!targetYear) {
    targetYear = now.getFullYear();
  }

  const endOfYear = goal.endDate
    ? new Date(goal.endDate)
    : new Date(targetYear, 11, 31, 23, 59, 59, 999);

  const diffMs = endOfYear.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  
  // Calculate approximate months left
  const monthsLeft = Math.max(0, (endOfYear.getFullYear() - now.getFullYear()) * 12 + (endOfYear.getMonth() - now.getMonth()));

  let text = '';
  if (daysLeft === 0) {
    text = 'היעד הסתיים';
  } else if (monthsLeft >= 2) {
    text = `נותרו עוד ${monthsLeft} חודשים (${daysLeft} ימים) לסוף השנה`;
  } else {
    text = `נותרו עוד ${daysLeft} ימים לסוף השנה`;
  }

  const endDateStr = endOfYear.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return { daysLeft, monthsLeft, text, endDateStr };
}

/**
 * Calculates remaining days until the end of a monthly goal.
 */
export function getMonthlyRemainingInfo(goal: Goal): { daysLeft: number; text: string; endDateStr: string } {
  const now = new Date();
  let endOfMonth: Date;

  if (goal.endDate) {
    endOfMonth = new Date(goal.endDate);
  } else if (goal.targetMonth) {
    const [y, m] = goal.targetMonth.split('-').map(Number);
    endOfMonth = new Date(y, m, 0, 23, 59, 59, 999); // last day of month m
  } else {
    endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const diffMs = endOfMonth.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let text = '';
  if (daysLeft === 0) {
    text = 'היעד החודשי הסתיים היום';
  } else if (daysLeft === 1) {
    text = 'סוף החודש מחר';
  } else {
    text = `נותרו עוד ${daysLeft} ימים לסוף החודש`;
  }

  const endDateStr = endOfMonth.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return { daysLeft, text, endDateStr };
}

/**
 * Returns the end date for a new annual goal (Dec 31 of current or specified year).
 */
export function getDefaultAnnualEndDate(year?: number): string {
  const y = year || new Date().getFullYear();
  return `${y}-12-31`;
}

/**
 * Returns the end date for a new monthly goal (last day of current or specified month YYYY-MM).
 */
export function getDefaultMonthlyEndDate(yearMonthStr?: string): string {
  const now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth() + 1; // 1-12

  if (yearMonthStr) {
    const parts = yearMonthStr.split('-');
    y = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
  }

  const lastDay = new Date(y, m, 0).getDate();
  const mStr = String(m).padStart(2, '0');
  const dStr = String(lastDay).padStart(2, '0');
  return `${y}-${mStr}-${dStr}`;
}

/**
 * Computes next month's end date when postponing a monthly goal.
 */
export function getPostponedMonthlyEndDate(currentEndDate?: string): { newEndDate: string; newYear: number; newMonthStr: string } {
  let baseDate: Date;
  if (currentEndDate) {
    baseDate = new Date(currentEndDate);
  } else {
    const now = new Date();
    baseDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  // Move to next month (day 1 of next month + 1 month - 1 day)
  const nextMonthYear = baseDate.getMonth() === 11 ? baseDate.getFullYear() + 1 : baseDate.getFullYear();
  const nextMonth = baseDate.getMonth() === 11 ? 1 : baseDate.getMonth() + 2; // 1-12

  const lastDay = new Date(nextMonthYear, nextMonth, 0).getDate();
  const mStr = String(nextMonth).padStart(2, '0');
  const dStr = String(lastDay).padStart(2, '0');

  return {
    newEndDate: `${nextMonthYear}-${mStr}-${dStr}`,
    newYear: nextMonthYear,
    newMonthStr: `${nextMonthYear}-${mStr}`,
  };
}

/**
 * Computes next year's end date when postponing an annual goal.
 */
export function getPostponedAnnualEndDate(currentEndDate?: string, currentYear?: number): { newEndDate: string; newYear: number } {
  let baseYear = currentYear || new Date().getFullYear();
  if (currentEndDate) {
    baseYear = new Date(currentEndDate).getFullYear();
  }
  const newYear = baseYear + 1;
  return {
    newEndDate: `${newYear}-12-31`,
    newYear,
  };
}
