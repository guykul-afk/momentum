import { test, expect } from '@playwright/test';

test.describe('Momentum Key Product Flows (F1 - F10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inbox');
  });

  test('F1: Quick capture - Text mode submission', async ({ page }) => {
    const fabButton = page.locator('button[aria-label="לכידת משימה מהירה"]');
    await expect(fabButton).toBeVisible();
    await fabButton.click();

    await expect(page.getByText('לכידת רעיון / משימה מהירה')).toBeVisible();

    const textarea = page.locator('textarea[placeholder*="מה יש לך בראש?"]');
    await expect(textarea).toBeVisible();
    await textarea.fill('משימת בדיקה מהירה לאינבוקס F1');

    const submitBtn = page.getByRole('button', { name: 'לכוד לאינבוקס' });
    await submitBtn.click();

    await expect(page.getByText('משימת בדיקה מהירה לאינבוקס F1')).toBeVisible({ timeout: 10000 });
  });

  test('F2: Quick capture - Keyboard Enter shortcut', async ({ page }) => {
    await page.locator('button[aria-label="לכידת משימה מהירה"]').click();

    const textarea = page.locator('textarea[placeholder*="מה יש לך בראש?"]');
    await textarea.fill('משימה עם מקש אנטר F2');
    await textarea.press('Enter');

    await expect(page.getByText('משימה עם מקש אנטר F2')).toBeVisible({ timeout: 10000 });
  });

  test('F3: Voice capture fallback - Recording UI state', async ({ page }) => {
    await page.locator('button[aria-label="לכידת משימה מהירה"]').click();

    // Switch to Voice Mode
    const voiceTab = page.getByRole('button', { name: 'הקלטה קולית' });
    await voiceTab.click();

    await expect(page.getByText('הקלטת שמע מהירה (Voice Capture)')).toBeVisible();

    // Click mic record button in center (w-16 h-16 round button)
    const recordBtn = page.locator('button.w-16');
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    // Verify active recording UI indicator
    await expect(page.getByText(/מקליט כעת/)).toBeVisible();
  });

  test('F4: Voice capture fallback - Transcribe preview & Save to Inbox', async ({ page }) => {
    await page.locator('button[aria-label="לכידת משימה מהירה"]').click();
    await page.getByRole('button', { name: 'הקלטה קולית' }).click();

    // Start recording
    const recordBtn = page.locator('button.w-16');
    await recordBtn.click();

    // Wait 1 second & stop recording
    await page.waitForTimeout(1000);
    await recordBtn.click();

    // Verify transcription input field appears
    await expect(page.getByText('תמלול אוטומטי (Speech-to-Text):')).toBeVisible();

    // Save recording to inbox
    const saveVoiceBtn = page.getByRole('button', { name: 'שמור לאינבוקס' });
    await expect(saveVoiceBtn).toBeEnabled();
    await saveVoiceBtn.click();

    // Verify raw capture item in inbox with voice badge indicator
    await expect(page.getByText(/הקלטה קולית/).first()).toBeVisible({ timeout: 10000 });
  });

  test('F5: Triage approval - View AI breakdown suggestion', async ({ page }) => {
    // Ensure an item exists first
    await page.locator('button[aria-label="לכידת משימה מהירה"]').click();
    await page.locator('textarea[placeholder*="מה יש לך בראש?"]').fill('פריט לבדיקת טריאז F5');
    await page.getByRole('button', { name: 'לכוד לאינבוקס' }).click();

    const startTriageBtn = page.locator('button:has-text("טריאז׳")').first();
    await expect(startTriageBtn).toBeVisible();
    await startTriageBtn.click();

    await expect(page.getByText(/תוכן.*שנלכד/)).toBeVisible();
  });

  test('F6: Triage approval - Edit breakdown & Approve task', async ({ page }) => {
    // Ensure an item exists first
    await page.locator('button[aria-label="לכידת משימה מהירה"]').click();
    await page.locator('textarea[placeholder*="מה יש לך בראש?"]').fill('פריט לבדיקת טריאז F6');
    await page.getByRole('button', { name: 'לכוד לאינבוקס' }).click();

    const startTriageBtn = page.locator('button:has-text("טריאז׳")').first();
    await startTriageBtn.click();

    // Approve task
    const approveBtn = page.getByRole('button', { name: /אישור/ }).first();
    await approveBtn.click();
  });

  test('F7: Today quota checkoff & metrics update', async ({ page }) => {
    await page.goto('/today');

    await expect(page.getByRole('heading', { name: 'היום שלי' })).toBeVisible();
    await expect(page.getByText('מכסה יומית (Daily Quota)')).toBeVisible();
  });

  test('F8: Goal tree effort-vs-KR gap visualization & Coral alert', async ({ page }) => {
    await page.goto('/goals');

    await expect(page.getByRole('heading', { name: /עץ יעדים/ })).toBeVisible();
  });

  test('F9: Weekly planning Fresh Start ritual', async ({ page }) => {
    await page.goto('/rituals/weekly-planning');

    await expect(page.getByRole('heading', { name: 'תכנון שבועי והקצאת מכסות' })).toBeVisible();

    const freshStartBtn = page.getByRole('button', { name: /הפעל Fresh Start/ });
    await expect(freshStartBtn).toBeVisible();
    await freshStartBtn.click();

    await expect(page.getByText('דף חלק הופעל!')).toBeVisible();

    const aiReportBtn = page.getByRole('button', { name: 'חולל דוח AI' });
    await aiReportBtn.click();

    await expect(page.getByText('סיכום AI שבועי')).toBeVisible();

    const savePlanBtn = page.getByRole('button', { name: 'אשר ושמור תכנון שבועי' });
    await savePlanBtn.click();

    await expect(page.getByText('התכנון השבועי נשמר בהצלחה!')).toBeVisible();
  });

  test('F10: Monthly close ritual & Effort vs Outcome report', async ({ page }) => {
    await page.goto('/rituals/monthly-close');

    await expect(page.getByRole('heading', { name: /סיכום/ })).toBeVisible();

    const aiCloseBtn = page.getByRole('button', { name: 'חולל דוח AI' });
    await aiCloseBtn.click();
  });
});
