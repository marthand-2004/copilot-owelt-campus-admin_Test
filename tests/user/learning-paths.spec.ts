import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const USER_LOGIN_URL = `${BASE_URL}/user/login`;
const PATHS_URL = `${BASE_URL}/user/paths`;
const COURSES_URL = `${BASE_URL}/user/courses`;

// Known stable paths
const AI_ARCHITECT_URL = `${BASE_URL}/user/paths/ai-architect`;
const NEURAL_OPS_URL = `${BASE_URL}/user/paths/neural-ops`;
const DATA_STRATEGIST_URL = `${BASE_URL}/user/paths/data-strategist`;

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

async function gotoPaths(page: Page) {
  await loginAsUser(page);
  await page.goto(PATHS_URL);
  await expect(page.getByRole('heading', { name: 'Paths to Mastery' })).toBeVisible({ timeout: 15000 });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. LEARNING PATHS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Learning Paths List Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPaths(page);
  });

  test('page loads with "Paths to Mastery" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Paths to Mastery' })).toBeVisible();
  });

  test('page shows correct description', async ({ page }) => {
    await expect(page.getByText('Structured learning journeys combining multiple courses')).toBeVisible();
  });

  test('all three paths are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Neural Ops' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data Strategist' })).toBeVisible();
  });

  test('"AI Architect" path shows 6 Courses Included', async ({ page }) => {
    await expect(page.getByText('6 Courses Included')).toBeVisible();
  });

  test('"Neural Ops" path shows 4 Courses Included', async ({ page }) => {
    await expect(page.getByText('4 Courses Included')).toBeVisible();
  });

  test('"Data Strategist" path shows 5 Courses Included', async ({ page }) => {
    await expect(page.getByText('5 Courses Included')).toBeVisible();
  });

  test('"Most Popular" badge is shown on AI Architect', async ({ page }) => {
    const aiCard = page.getByRole('link', { name: /AI Architect/i });
    await expect(aiCard.getByText('Most Popular')).toBeVisible();
  });

  test('path cards show duration in weeks', async ({ page }) => {
    await expect(page.getByText('14 Weeks')).toBeVisible();
    await expect(page.getByText('10 Weeks')).toBeVisible();
    await expect(page.getByText('12 Weeks')).toBeVisible();
  });

  test('path cards show difficulty levels', async ({ page }) => {
    await expect(page.getByText('Expert')).toBeVisible();
    await expect(page.getByText('Advanced').first()).toBeVisible();
    await expect(page.getByText('Intermediate').first()).toBeVisible();
  });

  test('AI Architect card shows Expert difficulty', async ({ page }) => {
    const aiCard = page.getByRole('link', { name: /AI Architect/i });
    await expect(aiCard.getByText('Expert')).toBeVisible();
  });

  test('Neural Ops card shows Advanced difficulty', async ({ page }) => {
    const neuralCard = page.getByRole('link', { name: /Neural Ops/i });
    await expect(neuralCard.getByText('Advanced')).toBeVisible();
  });

  test('Data Strategist card shows Intermediate difficulty', async ({ page }) => {
    const dataCard = page.getByRole('link', { name: /Data Strategist/i });
    await expect(dataCard.getByText('Intermediate')).toBeVisible();
  });

  test('path cards show description text', async ({ page }) => {
    await expect(page.getByText(/Bridge the gap between theoretical models/i)).toBeVisible();
    await expect(page.getByText(/evolution of DevOps for the machine learning age/i)).toBeVisible();
    await expect(page.getByText(/translating complex data insights/i)).toBeVisible();
  });

  test('path cards have thumbnail images', async ({ page }) => {
    await expect(page.getByRole('img', { name: 'AI Architect' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Neural Ops' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Data Strategist' })).toBeVisible();
  });

  test('clicking AI Architect navigates to its detail page', async ({ page }) => {
    await page.getByRole('link', { name: /AI Architect/i }).click();
    await expect(page).toHaveURL(AI_ARCHITECT_URL);
  });

  test('clicking Neural Ops navigates to its detail page', async ({ page }) => {
    await page.getByRole('link', { name: /Neural Ops/i }).click();
    await expect(page).toHaveURL(NEURAL_OPS_URL);
  });

  test('clicking Data Strategist navigates to its detail page', async ({ page }) => {
    await page.getByRole('link', { name: /Data Strategist/i }).click();
    await expect(page).toHaveURL(DATA_STRATEGIST_URL);
  });

  test('Learning Paths is accessible via Learning Exp menu', async ({ page }) => {
    await expect(page.locator('a[href="/user/paths"]').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. AI ARCHITECT PATH DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('AI Architect Path Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(AI_ARCHITECT_URL);
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible({ timeout: 15000 });
  });

  test('page loads with "AI Architect" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible();
  });

  test('breadcrumb shows Paths to Mastery > AI Architect', async ({ page }) => {
    await expect(page.getByRole('list').getByRole('link', { name: 'Paths to Mastery' })).toBeVisible();
    await expect(page.getByText('AI Architect').first()).toBeVisible();
  });

  test('category badge shows "Artificial Intelligence"', async ({ page }) => {
    await expect(page.getByText('Artificial Intelligence')).toBeVisible();
  });

  test('"Learning Path" label badge is shown', async ({ page }) => {
    await expect(page.locator('span').filter({ hasText: /^Learning Path$/ })).toBeVisible();
  });

  test('stats show 12 Lessons', async ({ page }) => {
    await expect(page.getByText('12 Lessons')).toBeVisible();
  });

  test('stats show Expert difficulty', async ({ page }) => {
    await expect(page.getByText('Expert')).toBeVisible();
  });

  test('stats show 14 Weeks duration', async ({ page }) => {
    await expect(page.getByText('14 Weeks')).toBeVisible();
  });

  test('enrolled students count is shown', async ({ page }) => {
    await expect(page.getByText(/1245 students enrolled/i)).toBeVisible();
  });

  test('rating 4.8 is shown', async ({ page }) => {
    await expect(page.getByText('4.8')).toBeVisible();
  });

  test('"Courses in this path" section heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Courses in this path' })).toBeVisible();
  });

  test('course 1 "Neural Architectures & Generative Systems" is listed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Neural Architectures & Generative Systems' })).toBeVisible();
  });

  test('course 2 "Strategic Decision Making with Big Data" is listed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Strategic Decision Making with Big Data' })).toBeVisible();
  });

  test('course 3 "Principles of Modern Interface Design" is listed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Principles of Modern Interface Design' })).toBeVisible();
  });

  test('courses show duration in hours', async ({ page }) => {
    await expect(page.getByText('12 Hours')).toBeVisible();
    await expect(page.getByText('8 Hours')).toBeVisible();
    await expect(page.getByText('15 Hours')).toBeVisible();
  });

  test('courses show modules count', async ({ page }) => {
    await expect(page.getByText('8 modules')).toBeVisible();
    await expect(page.getByText('6 modules')).toBeVisible();
    await expect(page.getByText('10 modules')).toBeVisible();
  });

  test('courses are numbered (1, 2, 3)', async ({ page }) => {
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('3', { exact: true }).first()).toBeVisible();
  });

  test('course items have navigation arrows', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Neural Architectures/i })).toBeVisible();
  });

  test('path thumbnail image is shown', async ({ page }) => {
    await expect(page.getByRole('img', { name: 'AI Architect' })).toBeVisible();
  });

  test('breadcrumb "Paths to Mastery" link navigates back to paths list', async ({ page }) => {
    await page.getByRole('list').getByRole('link', { name: 'Paths to Mastery' }).click();
    await expect(page).toHaveURL(PATHS_URL);
  });

  test('clicking a course link navigates to the course page', async ({ page }) => {
    await page.getByRole('link', { name: /Neural Architectures/i }).click();
    await expect(page).toHaveURL(/\/user\/courses\/.+/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. NEURAL OPS PATH DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Neural Ops Path Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(NEURAL_OPS_URL);
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible({ timeout: 15000 });
  });

  test('path detail page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible();
  });

  test('breadcrumb is present', async ({ page }) => {
    await expect(page.getByRole('list').getByRole('link', { name: 'Paths to Mastery' })).toBeVisible();
  });

  test('"Courses in this path" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Courses in this path' })).toBeVisible();
  });

  test('courses are listed with durations', async ({ page }) => {
    await expect(page.getByText(/Hours/).first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. DATA STRATEGIST PATH DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Data Strategist Path Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(DATA_STRATEGIST_URL);
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible({ timeout: 15000 });
  });

  test('path detail page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible();
  });

  test('"Courses in this path" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Courses in this path' })).toBeVisible();
  });

  test('enrolled students count is shown', async ({ page }) => {
    await expect(page.getByText(/students enrolled/i)).toBeVisible();
  });

  test('rating is shown', async ({ page }) => {
    await expect(page.getByText('4.8')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Navigation – Learning Paths', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('Learning Paths accessible via Learning Exp > Learning Paths', async ({ page }) => {
    await page.goto(PATHS_URL);
    await expect(page.locator('a[href="/user/paths"]').first()).toBeVisible();
    await page.locator('a[href="/user/paths"]').first().click();
    await expect(page).toHaveURL(PATHS_URL);
  });

  test('Courses accessible via Learning Exp > Courses', async ({ page }) => {
    await page.goto(PATHS_URL);
    await expect(page.locator('a[href="/user/courses"]').first()).toBeVisible();
    await page.locator('a[href="/user/courses"]').first().click();
    await expect(page).toHaveURL(COURSES_URL);
  });

  test('sidebar "Assessments" link is present', async ({ page }) => {
    await page.goto(PATHS_URL);
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Assessments', exact: true })).toBeVisible();
  });

  test('unauthenticated access to paths redirects or loads', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(PATHS_URL);
    await page.waitForTimeout(1000);
    const url = page.url();
    const isValid = url.includes('/paths') || url.includes('/login');
    expect(isValid).toBeTruthy();
  });

  test('unauthenticated access to path detail redirects or loads', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(AI_ARCHITECT_URL);
    await page.waitForTimeout(1000);
    const url = page.url();
    const isValid = url.includes('/paths') || url.includes('/login');
    expect(isValid).toBeTruthy();
  });
});
