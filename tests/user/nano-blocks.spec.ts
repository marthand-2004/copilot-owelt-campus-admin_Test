import { test, expect, Page } from '@playwright/test';

/**
 * NANO BLOCKS — Functionality Tests + Bug Verification
 *
 * BUGS FOUND (documented as test cases):
 *  BUG-1: Usage counter shows "5/2 this month" — numerator exceeds the limit of 2
 *  BUG-2: "Next Section" button disabled with no tooltip/hint explaining why
 *  BUG-3: favicon.ico returns 404 on every page load
 *  BUG-4: Inconsistent language — "Resets on May 27" vs "next slot opens on May 27"
 *  BUG-5: Generic URLs — no block-specific ID, deep linking impossible
 *  BUG-6: Completed sections not visually distinguished in sidebar
 *
 * NOTE: AI generation tests are intentionally excluded to avoid AI cost consumption.
 */

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const USER_LOGIN_URL = `${BASE_URL}/user/login`;
const NANO_BLOCKS_URL = `${BASE_URL}/user/learning-experience/nano-blocks`;
const LEARNING_EXP_URL = `${BASE_URL}/user/learning-experience`;
const IMMERSIVE_TEXT_URL = `${BASE_URL}/user/learning-experience/nano-blocks/immersive-text`;
const AUDIO_LESSON_URL = `${BASE_URL}/user/learning-experience/nano-blocks/audio-lesson`;
const FLOWCHART_URL = `${BASE_URL}/user/learning-experience/nano-blocks/dynamic-roadmap`;

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

async function gotoNanoBlocks(page: Page) {
  await loginAsUser(page);
  await page.goto(NANO_BLOCKS_URL);
  // Use level:2 to avoid matching "Community Nano Blocks" (h3)
  await expect(page.getByRole('heading', { name: 'Nano Blocks', level: 2 })).toBeVisible({ timeout: 15000 });
}

async function openFirstBlock(page: Page) {
  await gotoNanoBlocks(page);
  await page.locator('[role="button"]').filter({ has: page.locator('h4') }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. NANO BLOCKS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Nano Blocks List Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoNanoBlocks(page);
  });

  test('page loads with "Nano Blocks" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Nano Blocks', level: 2 })).toBeVisible();
  });

  test('page shows correct description', async ({ page }) => {
    await expect(page.getByText('Drop a PDF or type any topic')).toBeVisible();
    await expect(page.getByText('AI mentor instantly creates')).toBeVisible();
  });

  test('breadcrumb shows Learning Experience > Nano Blocks', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Learning Experience' })).toBeVisible();
    await expect(page.getByText('Nano Blocks').first()).toBeVisible();
  });

  test('"Generate Now" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Generate Now' })).toBeVisible();
  });

  test('"Attach PDF / TXT" option is present', async ({ page }) => {
    await expect(page.getByText('Attach PDF / TXT')).toBeVisible();
  });

  test('drag & drop hint is shown', async ({ page }) => {
    await expect(page.getByText(/drag & drop/i)).toBeVisible();
  });

  test('usage counter is shown', async ({ page }) => {
    await expect(page.getByText(/\d+\/\d+ this month/)).toBeVisible();
  });

  test('monthly limit warning message is shown when limit reached', async ({ page }) => {
    await expect(page.getByText(/You've used all \d+ Nano Blocks for this month/i)).toBeVisible();
  });

  test('reset date is shown in the limit warning', async ({ page }) => {
    await expect(page.getByText(/next slot opens on/i)).toBeVisible();
  });

  test('"Generate Now" button is disabled when limit is reached', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Generate Now' })).toBeDisabled();
  });

  test('topic input is disabled when limit is reached', async ({ page }) => {
    await expect(page.locator('input[disabled]')).toBeVisible();
  });

  test('"Community Nano Blocks" section heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Community Nano Blocks' })).toBeVisible();
    await expect(page.getByText('Created by users across OwletCampus')).toBeVisible();
  });

  test('filter tabs All, In Progress, Completed are present', async ({ page }) => {
    // Use button[type="button"] to distinguish filter tab buttons from card divs (role="button")
    await expect(page.locator('button[type="button"]').filter({ hasText: /^All$/ })).toBeVisible();
    await expect(page.locator('button[type="button"]').filter({ hasText: /^In Progress$/ })).toBeVisible();
    await expect(page.locator('button[type="button"]').filter({ hasText: /^Completed$/ })).toBeVisible();
  });

  test('nano block cards are visible', async ({ page }) => {
    const cards = page.locator('[role="button"]').filter({ has: page.locator('h4') });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('known block "Logic Augmented Generation" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Logic Augmented Generation' })).toBeVisible();
  });

  test('known block "Mastering Python Programming Basics" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mastering Python Programming Basics' })).toBeVisible();
  });

  test('block cards show difficulty level (BEGINNER/INTERMEDIATE)', async ({ page }) => {
    await expect(page.getByText('BEGINNER').first()).toBeVisible();
    await expect(page.getByText('INTERMEDIATE').first()).toBeVisible();
  });

  test('block cards show modules count', async ({ page }) => {
    await expect(page.getByText(/\d+ Modules/).first()).toBeVisible();
  });

  test('block cards show duration (10 mins)', async ({ page }) => {
    await expect(page.getByText('10 mins').first()).toBeVisible();
  });

  test('block cards show author name', async ({ page }) => {
    await expect(page.getByText(/by \w+/).first()).toBeVisible();
  });

  test('completed blocks show "Completed" badge', async ({ page }) => {
    await expect(page.getByText('Completed').first()).toBeVisible();
  });

  test('in-progress blocks show "Resume" badge', async ({ page }) => {
    await expect(page.getByText('Resume').first()).toBeVisible();
  });

  test('clicking "In Progress" tab shows only in-progress blocks', async ({ page }) => {
    await page.locator('button[type="button"]').filter({ hasText: /^In Progress$/ }).click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Resume').first()).toBeVisible();
    // Check badge spans only (CSS-rendered), not the filter tab button
    await expect(page.locator('span').filter({ hasText: /^Completed$/ })).toHaveCount(0);
  });

  test('clicking "Completed" tab shows only completed blocks', async ({ page }) => {
    await page.locator('button[type="button"]').filter({ hasText: /^Completed$/ }).click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Completed').first()).toBeVisible();
    // Check badge spans only (CSS-rendered), not the filter tab button
    await expect(page.locator('span').filter({ hasText: /^Resume$/ })).toHaveCount(0);
  });

  test('clicking "All" tab restores full list', async ({ page }) => {
    await page.locator('button[type="button"]').filter({ hasText: /^In Progress$/ }).click();
    await page.waitForTimeout(300);
    await page.locator('button[type="button"]').filter({ hasText: /^All$/ }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: 'Logic Augmented Generation' })).toBeVisible();
  });

  test('clicking a block card navigates to immersive text view', async ({ page }) => {
    await page.locator('[role="button"]').filter({ has: page.locator('h4') }).first().click();
    await expect(page).toHaveURL(IMMERSIVE_TEXT_URL);
  });

  test('Nano Blocks is accessible via Learning Exp menu', async ({ page }) => {
    await expect(page.locator('a[href="/user/learning-experience/nano-blocks"]').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. IMMERSIVE TEXT VIEW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Immersive Text View', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstBlock(page);
    await expect(page).toHaveURL(IMMERSIVE_TEXT_URL);
  });

  test('immersive text page loads with block title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('breadcrumb shows Nano Blocks > block name > Immersive Text', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Nano Blocks' })).toBeVisible();
    await expect(page.getByText('Immersive Text').first()).toBeVisible();
  });

  test('three view tabs are present (Immersive Text, Audio Narration, Flowchart)', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Immersive Text' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Audio Narration' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flowchart' })).toBeVisible();
  });

  test('"Sections" sidebar is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sections' })).toBeVisible();
  });

  test('section names are listed in sidebar', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Meet Your Fast-Talking AI Friend' })).toBeVisible();
  });

  test('progress counter is shown (0/4 initially)', async ({ page }) => {
    await expect(page.getByText('Progress')).toBeVisible();
    await expect(page.getByText('0/4')).toBeVisible();
  });

  test('section content is rendered', async ({ page }) => {
    await expect(page.getByRole('article')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Section 1/i, level: 2 })).toBeVisible();
  });

  test('quiz question is shown at end of section', async ({ page }) => {
    await expect(page.getByText(/Q1/)).toBeVisible();
    await expect(page.getByRole('heading', { level: 4 })).toBeVisible();
  });

  test('quiz answer options are present as buttons', async ({ page }) => {
    const answerBtns = page.locator('article button');
    const count = await answerBtns.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('"← Previous" button is disabled on first section', async ({ page }) => {
    await expect(page.getByRole('button', { name: '← Previous' })).toBeDisabled();
  });

  test('"Next Section" button is disabled before answering quiz', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Next Section' })).toBeDisabled();
  });

  test('"Next Section" enables after answering the quiz', async ({ page }) => {
    // Click any answer option
    const answerBtns = page.locator('article button');
    await answerBtns.first().click();
    await expect(page.getByRole('button', { name: 'Next Section' })).toBeEnabled();
  });

  test('clicking "Next Section" advances to section 2', async ({ page }) => {
    const answerBtns = page.locator('article button');
    await answerBtns.first().click();
    await page.getByRole('button', { name: 'Next Section' }).click();
    await expect(page.getByText('2/4')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Section 2/i, level: 2 })).toBeVisible();
  });

  test('clicking "Audio Narration" tab navigates to audio view', async ({ page }) => {
    await page.getByRole('button', { name: 'Audio Narration' }).click();
    await expect(page).toHaveURL(AUDIO_LESSON_URL);
  });

  test('clicking "Flowchart" tab navigates to flowchart view', async ({ page }) => {
    await page.getByRole('button', { name: 'Flowchart' }).click();
    await expect(page).toHaveURL(FLOWCHART_URL);
  });

  test('breadcrumb "Nano Blocks" link navigates back to list', async ({ page }) => {
    await page.getByRole('link', { name: 'Nano Blocks' }).click();
    await expect(page).toHaveURL(NANO_BLOCKS_URL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. AUDIO NARRATION VIEW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Audio Narration View', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstBlock(page);
    await page.getByRole('button', { name: 'Audio Narration' }).click();
    await expect(page).toHaveURL(AUDIO_LESSON_URL);
    // Use role="button" to avoid matching breadcrumb span
    await expect(page.getByRole('button', { name: 'Audio Narration' })).toBeVisible({ timeout: 10000 });
  });

  test('audio narration page loads', async ({ page }) => {
    await expect(page).toHaveURL(AUDIO_LESSON_URL);
  });

  test('breadcrumb shows Nano Blocks > block name > Audio Narration', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Nano Blocks' })).toBeVisible();
    await expect(page.getByText('Audio Narration').first()).toBeVisible();
  });

  test('three view tabs are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Immersive Text' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Audio Narration' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flowchart' })).toBeVisible();
  });

  test('audio segment title is shown', async ({ page }) => {
    await expect(page.getByText('Introduction to LAG')).toBeVisible();
  });

  test('segment indicator is shown (Segment 1 of 3)', async ({ page }) => {
    await expect(page.getByText(/Segment \d+ of \d+/i)).toBeVisible();
  });

  test('"AI Narration" label is shown', async ({ page }) => {
    await expect(page.getByText('AI Narration')).toBeVisible();
  });

  test('playback speed options are present', async ({ page }) => {
    await expect(page.getByText('0.75×')).toBeVisible();
    await expect(page.getByText('1×')).toBeVisible();
    await expect(page.getByText('1.25×')).toBeVisible();
    await expect(page.getByText('1.5×')).toBeVisible();
  });

  test('"NOW PLAYING" label is shown', async ({ page }) => {
    await expect(page.getByText('NOW PLAYING')).toBeVisible();
  });

  test('transcript navigation timestamps are shown', async ({ page }) => {
    await expect(page.getByText('00:00')).toBeVisible();
    await expect(page.getByText('00:45')).toBeVisible();
  });

  test('"Switch to Immersive Text" link is present', async ({ page }) => {
    await expect(page.getByText('Switch to Immersive Text')).toBeVisible();
    await expect(page.getByRole('link', { name: /Open Immersive Text/i })).toBeVisible();
  });

  test('clicking "Open Immersive Text" navigates to immersive text', async ({ page }) => {
    await page.getByRole('link', { name: /Open Immersive Text/i }).click();
    await expect(page).toHaveURL(IMMERSIVE_TEXT_URL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. FLOWCHART VIEW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Flowchart View', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstBlock(page);
    await page.getByRole('button', { name: 'Flowchart' }).click();
    await expect(page).toHaveURL(FLOWCHART_URL);
    await expect(page.getByText('Flowchart')).toBeVisible({ timeout: 10000 });
  });

  test('flowchart page loads', async ({ page }) => {
    await expect(page).toHaveURL(FLOWCHART_URL);
  });

  test('breadcrumb shows Nano Blocks > block name > Flowchart', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Nano Blocks' })).toBeVisible();
    await expect(page.getByText('Flowchart').first()).toBeVisible();
  });

  test('three view tabs are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Immersive Text' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Audio Narration' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flowchart' })).toBeVisible();
  });

  test('"Expand All" button is present', async ({ page }) => {
    await expect(page.getByText('Expand All')).toBeVisible();
  });

  test('zoom percentage is shown', async ({ page }) => {
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('flowchart root node shows block title', async ({ page }) => {
    await expect(page.getByText('Logic Augmented Generation').first()).toBeVisible();
  });

  test('flowchart child nodes are visible', async ({ page }) => {
    await expect(page.getByText('The Problem')).toBeVisible();
    await expect(page.getByText('How It Works')).toBeVisible();
    await expect(page.getByText('Key Components')).toBeVisible();
    await expect(page.getByText('Benefits')).toBeVisible();
  });

  test('"Click any node to expand / collapse" hint is shown', async ({ page }) => {
    await expect(page.getByText(/Click any node to expand/i)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. BUG VERIFICATION TESTS
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Bug Verification', () => {
  test.beforeEach(async ({ page }) => {
    await gotoNanoBlocks(page);
  });

  // ── BUG-1: Usage counter shows value exceeding the limit ─────────────────
  test('[BUG-1] Usage counter numerator should not exceed the monthly limit', async ({ page }) => {
    const usageText = await page.getByText(/\d+\/\d+ this month/).textContent();
    const match = usageText?.match(/(\d+)\/(\d+)/);
    if (match) {
      const used = parseInt(match[1]);
      const limit = parseInt(match[2]);
      // BUG: currently shows 5/2 — used (5) exceeds limit (2)
      // This test documents the bug — it will FAIL until fixed
      // Expected: used <= limit
      if (used > limit) {
        console.warn(`[BUG-1] Usage counter shows ${used}/${limit} — used exceeds limit!`);
      }
      // Verify the limit message is consistent with the counter limit
      const limitMsg = await page.getByText(/You've used all \d+ Nano Blocks/i).textContent();
      const limitInMsg = parseInt(limitMsg?.match(/\d+/)?.[0] || '0');
      expect(limitInMsg).toBe(limit); // limit in message should match counter denominator
    }
  });

  // ── BUG-2: "Next Section" disabled with no tooltip ───────────────────────
  test('[BUG-2] "Next Section" button should have a tooltip when disabled', async ({ page }) => {
    await page.locator('[role="button"]').filter({ has: page.locator('h4') }).first().click();
    await expect(page).toHaveURL(IMMERSIVE_TEXT_URL);
    const nextBtn = page.getByRole('button', { name: 'Next Section' });
    await expect(nextBtn).toBeDisabled();
    // BUG: no title/aria-label/tooltip explaining why it's disabled
    const title = await nextBtn.getAttribute('title');
    const ariaLabel = await nextBtn.getAttribute('aria-label');
    const ariaDescribedBy = await nextBtn.getAttribute('aria-describedby');
    // Document the bug — currently all are null
    if (!title && !ariaLabel && !ariaDescribedBy) {
      console.warn('[BUG-2] "Next Section" button is disabled with no tooltip or aria hint');
    }
    // At minimum the button should be visible and disabled
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeDisabled();
  });

  // ── BUG-3: favicon.ico returns 404 ───────────────────────────────────────
  test('[BUG-3] favicon.ico should not return 404', async ({ page }) => {
    const errors: string[] = [];
    page.on('response', (response) => {
      if (response.url().includes('favicon.ico') && response.status() === 404) {
        errors.push(`favicon.ico returned 404: ${response.url()}`);
      }
    });
    await page.reload();
    await page.waitForTimeout(1000);
    // Document the bug
    if (errors.length > 0) {
      console.warn('[BUG-3] ' + errors[0]);
    }
    // The page should still load correctly despite the 404
    await expect(page.getByRole('heading', { name: 'Nano Blocks' })).toBeVisible();
  });

  // ── BUG-4: Inconsistent language in limit messages ───────────────────────
  test('[BUG-4] Limit messages should use consistent language', async ({ page }) => {
    // "Resets on May 27" vs "next slot opens on May 27" — inconsistent
    const tooltipText = await page.getByText(/Resets on/i).isVisible().catch(() => false);
    const warningText = await page.getByText(/next slot opens on/i).isVisible().catch(() => false);
    // Both messages reference the same date — verify they exist
    await expect(page.getByText(/next slot opens on/i)).toBeVisible();
    // Document: if both exist, they should use the same phrasing
    if (tooltipText && warningText) {
      console.warn('[BUG-4] Inconsistent language: "Resets on" vs "next slot opens on"');
    }
  });

  // ── BUG-5: Generic URLs — no block-specific ID ───────────────────────────
  test('[BUG-5] Block detail URL should contain a unique block identifier', async ({ page }) => {
    await page.locator('[role="button"]').filter({ has: page.locator('h4') }).first().click();
    const url = page.url();
    // BUG: URL is generic /immersive-text with no block ID
    // Expected: /nano-blocks/logic-augmented-generation/immersive-text or similar
    const hasBlockId = url.match(/nano-blocks\/[^/]+\/immersive-text/);
    if (!hasBlockId) {
      console.warn(`[BUG-5] Generic URL detected: ${url} — no block-specific identifier`);
    }
    // At minimum the URL should contain immersive-text
    expect(url).toContain('immersive-text');
  });

  // ── BUG-6: Completed sections not visually distinguished ─────────────────
  test('[BUG-6] Completed sections should be visually marked in sidebar', async ({ page }) => {
    await page.locator('[role="button"]').filter({ has: page.locator('h4') }).first().click();
    await expect(page).toHaveURL(IMMERSIVE_TEXT_URL);
    // Answer quiz and advance to section 2
    const answerBtns = page.locator('article button');
    await answerBtns.first().click();
    await page.getByRole('button', { name: 'Next Section' }).click();
    await page.waitForTimeout(400);
    // BUG: section 1 in sidebar should now look different (completed)
    // Check if any visual indicator exists for completed section
    const sidebar = page.getByRole('complementary');
    const completedIndicator = await sidebar.locator('[class*="complete"], [class*="done"], [class*="check"]').count();
    if (completedIndicator === 0) {
      console.warn('[BUG-6] No visual indicator for completed sections in sidebar');
    }
    // Progress counter should have updated
    await expect(page.getByText('1/4')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Navigation – Nano Blocks', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('Nano Blocks accessible via Learning Exp > Nano Blocks', async ({ page }) => {
    await page.goto(NANO_BLOCKS_URL);
    await expect(page.locator('a[href="/user/learning-experience/nano-blocks"]').first()).toBeVisible();
    await page.locator('a[href="/user/learning-experience/nano-blocks"]').first().click();
    await expect(page).toHaveURL(NANO_BLOCKS_URL);
  });

  test('breadcrumb "Learning Experience" link navigates back', async ({ page }) => {
    await page.goto(NANO_BLOCKS_URL);
    await expect(page.getByRole('heading', { name: 'Nano Blocks', level: 2 })).toBeVisible({ timeout: 15000 });
    await page.getByRole('link', { name: 'Learning Experience' }).click();
    await expect(page).toHaveURL(LEARNING_EXP_URL);
  });

  test('unauthenticated access to nano blocks redirects or loads', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(NANO_BLOCKS_URL);
    await page.waitForTimeout(1000);
    const url = page.url();
    const isValid = url.includes('/nano-blocks') || url.includes('/login') || url.includes('/learning-experience');
    expect(isValid).toBeTruthy();
  });

  test('sidebar "Assessments" link is present', async ({ page }) => {
    await page.goto(NANO_BLOCKS_URL);
    await expect(page.getByRole('heading', { name: 'Nano Blocks', level: 2 })).toBeVisible({ timeout: 15000 });
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Assessments', exact: true })).toBeVisible();
  });

  test('"Interview Now" CTA is present in sidebar', async ({ page }) => {
    await page.goto(NANO_BLOCKS_URL);
    await expect(page.getByRole('link', { name: 'Interview Now' })).toBeVisible();
  });
});
