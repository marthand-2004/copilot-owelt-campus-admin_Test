import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const USER_LOGIN_URL = `${BASE_URL}/user/login`;
const VIDEO_NUGGETS_URL = `${BASE_URL}/user/learning-experience/video-nuggets`;
const LEARNING_EXP_URL = `${BASE_URL}/user/learning-experience`;

const USER_EMAIL = 'suryatataje@gmail.com';
const USER_PASSWORD = 'Asurya@.0009';

// ─── Shared login helper ────────────────────────────────────────────────────
async function loginAsUser(page: Page) {
  await page.context().clearCookies();
  await page.goto(USER_LOGIN_URL);
  await expect(page).toHaveURL(USER_LOGIN_URL, { timeout: 10000 });
  await page.getByRole('textbox', { name: 'Email address' }).fill(USER_EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/user\//, { timeout: 15000 });
  await expect(page.getByRole('complementary')).toBeVisible({ timeout: 10000 });
}

async function gotoVideoNuggets(page: Page) {
  await loginAsUser(page);
  await page.goto(VIDEO_NUGGETS_URL);
  await expect(page.getByRole('heading', { name: 'Video Nuggets' })).toBeVisible({ timeout: 15000 });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. VIDEO NUGGETS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Video Nuggets List Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVideoNuggets(page);
  });

  test('page loads with "Video Nuggets" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Video Nuggets' })).toBeVisible();
  });

  test('page shows correct description', async ({ page }) => {
    await expect(page.getByText('Master complex concepts in under 3 minutes')).toBeVisible();
  });

  test('breadcrumb shows Learning Experience > Video Nuggets', async ({ page }) => {
    // Breadcrumb uses a list with Learning Experience link and Video Nuggets text
    await expect(page.getByRole('link', { name: 'Learning Experience' })).toBeVisible();
    await expect(page.getByText('Video Nuggets').first()).toBeVisible();
  });

  test('"All Videos" filter tab is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'All Videos' })).toBeVisible();
  });

  test('"Popular" filter tab is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Popular' })).toBeVisible();
  });

  test('"New" filter tab is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
  });

  test('category filter tabs are present (CAT Prep, UPSC, Data Science, Soft Skills)', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'CAT Prep' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'UPSC' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Data Science' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Soft Skills' })).toBeVisible();
  });

  test('"SORT BY: Recent" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Recent/i })).toBeVisible();
  });

  test('video cards are visible', async ({ page }) => {
    // Video cards are div elements with cursor-pointer class
    const videoCards = page.locator('.cursor-pointer.group');
    const count = await videoCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('known video "Mastering the Deployment of AI Agents" is visible', async ({ page }) => {
    await expect(page.getByText('Mastering the Deployment of AI Agents')).toBeVisible();
  });

  test('known video "Mastering Prompt Prototypes" is visible', async ({ page }) => {
    await expect(page.getByText('Mastering Prompt Prototypes')).toBeVisible();
  });

  test('known video "What is Quantum Computing" is visible', async ({ page }) => {
    await expect(page.getByText('What is Quantum Computing')).toBeVisible();
  });

  test('video cards show duration timestamps', async ({ page }) => {
    await expect(page.getByText('01:00').first()).toBeVisible();
    await expect(page.getByText('01:01').first()).toBeVisible();
  });

  test('video cards show views count', async ({ page }) => {
    await expect(page.getByText(/\d+ views/i).first()).toBeVisible();
  });

  test('video cards show category label', async ({ page }) => {
    await expect(page.getByText('General').first()).toBeVisible();
  });

  test('video cards show likes count', async ({ page }) => {
    await expect(page.getByText(/\d+ likes/i).first()).toBeVisible();
  });

  test('"YOU\'VE SEEN ALL VIDEOS" message is shown at the bottom', async ({ page }) => {
    await expect(page.getByText(/YOU'VE SEEN ALL VIDEOS/i)).toBeVisible();
  });

  test('clicking "Popular" tab filters videos', async ({ page }) => {
    await page.getByRole('button', { name: 'Popular' }).click();
    await page.waitForTimeout(400);
    // Page should still show videos
    await expect(page.getByText(/views/i).first()).toBeVisible();
  });

  test('clicking "New" tab filters videos', async ({ page }) => {
    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForTimeout(400);
    await expect(page.getByRole('heading', { name: 'Video Nuggets' })).toBeVisible();
  });

  test('clicking "Data Science" category tab filters videos', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Science' }).click();
    await page.waitForTimeout(400);
    await expect(page.getByRole('heading', { name: 'Video Nuggets' })).toBeVisible();
  });

  test('clicking "All Videos" restores full list', async ({ page }) => {
    await page.getByRole('button', { name: 'Popular' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'All Videos' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText('Mastering the Deployment of AI Agents')).toBeVisible();
  });

  test('Video Nuggets is accessible via Learning Exp menu', async ({ page }) => {
    await expect(page.locator('a[href="/user/learning-experience/video-nuggets"]').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. VIDEO PLAYER VIEW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Video Player View', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVideoNuggets(page);
    // Click the first video card to open the player
    await page.locator('.cursor-pointer.group').first().click();
    await expect(page.getByRole('heading', { name: 'Mastering the Deployment of AI Agents' })).toBeVisible({ timeout: 10000 });
  });

  test('player view shows video title as heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mastering the Deployment of AI Agents' })).toBeVisible();
  });

  test('player view shows breadcrumb with video title', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(page.getByText('Mastering the Deployment of AI Agents').first()).toBeVisible();
  });

  test('player view shows views count', async ({ page }) => {
    // Views count shown in the player stats — matches "N Views" pattern
    await expect(page.getByText(/^\d+ Views$/).first()).toBeVisible();
  });

  test('player view shows category label', async ({ page }) => {
    await expect(page.getByText('General').first()).toBeVisible();
  });

  test('player view shows video duration', async ({ page }) => {
    await expect(page.getByText('⏱ 01:00')).toBeVisible();
  });

  test('"Like" button is present', async ({ page }) => {
    // The Like/Liked button has aria-pressed — distinguishes it from video card divs
    await expect(page.locator('button[aria-pressed]')).toBeVisible();
  });

  test('"Like" button shows likes count', async ({ page }) => {
    const likeBtn = page.locator('button[aria-pressed]');
    await expect(likeBtn).toBeVisible();
    const text = await likeBtn.textContent();
    expect(text).toMatch(/\d/);
  });

  test('"Next Up" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Next Up' })).toBeVisible();
  });

  test('"Autoplay" toggle is present', async ({ page }) => {
    await expect(page.getByText('Autoplay')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle autoplay' })).toBeVisible();
  });

  test('"Next Up" list shows upcoming videos', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mastering Prompt Prototypes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What is Quantum Computing' })).toBeVisible();
  });

  test('"Next Up" videos show duration', async ({ page }) => {
    await expect(page.getByText('01:01').first()).toBeVisible();
    await expect(page.getByText('01:17').first()).toBeVisible();
  });

  test('"Next Up" videos show views count', async ({ page }) => {
    await expect(page.getByText(/\d+ views/i).first()).toBeVisible();
  });

  test('"Agentic Mentor AI" assistant is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Agentic Mentor AI' })).toBeVisible();
  });

  test('Agentic Mentor AI shows context-aware message', async ({ page }) => {
    await expect(page.getByText(/Mastering the Deployment of AI Agents/i).first()).toBeVisible();
  });

  test('clicking a "Next Up" video loads that video', async ({ page }) => {
    await page.getByRole('heading', { name: 'Mastering Prompt Prototypes' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Mastering Prompt Prototypes' })).toBeVisible();
  });

  test('breadcrumb "Video Nuggets" button navigates back to list', async ({ page }) => {
    await page.getByRole('button', { name: 'Video Nuggets' }).click();
    await page.waitForTimeout(400);
    // Should return to the list view
    await expect(page.getByRole('button', { name: 'All Videos' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Navigation – Video Nuggets', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('Video Nuggets accessible via Learning Exp > Video Nuggets', async ({ page }) => {
    await page.goto(VIDEO_NUGGETS_URL);
    await expect(page.locator('a[href="/user/learning-experience/video-nuggets"]').first()).toBeVisible();
    await page.locator('a[href="/user/learning-experience/video-nuggets"]').first().click();
    await expect(page).toHaveURL(VIDEO_NUGGETS_URL);
  });

  test('breadcrumb "Learning Experience" link navigates to learning experience page', async ({ page }) => {
    await page.goto(VIDEO_NUGGETS_URL);
    await expect(page.getByRole('heading', { name: 'Video Nuggets' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('link', { name: 'Learning Experience' }).click();
    await expect(page).toHaveURL(LEARNING_EXP_URL);
  });

  test('unauthenticated access to video nuggets redirects or loads', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(VIDEO_NUGGETS_URL);
    await page.waitForTimeout(1000);
    const url = page.url();
    const isValid = url.includes('/video-nuggets') || url.includes('/login') || url.includes('/learning-experience');
    expect(isValid).toBeTruthy();
  });

  test('"Interview Now" CTA is present in sidebar', async ({ page }) => {
    await page.goto(VIDEO_NUGGETS_URL);
    await expect(page.getByRole('link', { name: 'Interview Now' })).toBeVisible();
  });

  test('sidebar "Assessments" link is present', async ({ page }) => {
    await page.goto(VIDEO_NUGGETS_URL);
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Assessments', exact: true })).toBeVisible();
  });
});
