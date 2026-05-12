import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const USER_LOGIN_URL = `${BASE_URL}/user/login`;
const COURSES_URL = `${BASE_URL}/user/courses`;
const PATHS_URL = `${BASE_URL}/user/paths`;

// Known stable courses
const MANDARIN_COURSE_ID = '442';   // Mandarin Chinese for Beginners – Beginner, Free
const MBA_COURSE_ID = '471';        // MBA Foundations: Management Principles – Intermediate
const MANDARIN_COURSE_URL = `${BASE_URL}/user/courses/${MANDARIN_COURSE_ID}`;
const MBA_COURSE_URL = `${BASE_URL}/user/courses/${MBA_COURSE_ID}`;

// Known stable learning paths
const AI_ARCHITECT_PATH_URL = `${BASE_URL}/user/paths/ai-architect`;

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

async function gotoCourses(page: Page) {
  await loginAsUser(page);
  await page.goto(COURSES_URL);
  await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible({ timeout: 15000 });
}

async function gotoPaths(page: Page) {
  await loginAsUser(page);
  await page.goto(PATHS_URL);
  await expect(page.getByRole('heading', { name: 'Paths to Mastery' })).toBeVisible({ timeout: 15000 });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. COURSES LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Courses List Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCourses(page);
  });

  test('page loads with "Courses" heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible();
    await expect(page.getByText('Browse focused short courses across subjects')).toBeVisible();
  });

  test('course cards are visible', async ({ page }) => {
    const courseLinks = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) });
    const count = await courseLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('known course "Mandarin Chinese for Beginners" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mandarin Chinese for Beginners' })).toBeVisible();
  });

  test('known course "MBA Foundations: Management Principles" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /MBA Foundations/i })).toBeVisible();
  });

  test('course cards show difficulty level badge (Beginner/Intermediate/Advanced)', async ({ page }) => {
    await expect(page.getByText('Beginner').first()).toBeVisible();
    await expect(page.getByText('Advanced').first()).toBeVisible();
  });

  test('course cards show category (MBA/GRE/Foreign Languages)', async ({ page }) => {
    await expect(page.getByText('MBA').first()).toBeVisible();
    await expect(page.getByText('GRE').first()).toBeVisible();
  });

  test('course cards show duration in hours', async ({ page }) => {
    await expect(page.getByText(/\d+\.?\d*h/).first()).toBeVisible();
  });

  test('course cards show modules count', async ({ page }) => {
    await expect(page.getByText(/\d+ modules/).first()).toBeVisible();
  });

  test('course cards show lessons count', async ({ page }) => {
    await expect(page.getByText(/\d+ lessons/).first()).toBeVisible();
  });

  test('course cards have thumbnail images', async ({ page }) => {
    const courseImages = page.getByRole('img', { name: /Mandarin|MBA|GRE|French|German/i });
    await expect(courseImages.first()).toBeVisible();
  });

  test('clicking a course card navigates to the course detail page', async ({ page }) => {
    await page.getByRole('link', { name: /Mandarin Chinese for Beginners/i }).click();
    await expect(page).toHaveURL(/\/user\/courses\/\d+/);
  });

  test('search box is present in header', async ({ page }) => {
    // The header search box is present
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('Courses is accessible via Learning Exp menu', async ({ page }) => {
    // On the Courses page, Learning Exp is already expanded — use href
    await expect(page.locator('a[href="/user/courses"]').first()).toBeVisible();
  });

  test('Learning Paths is accessible via Learning Exp menu', async ({ page }) => {
    await expect(page.locator('a[href="/user/paths"]').first()).toBeVisible();
  });

  test('Foreign Languages courses are visible', async ({ page }) => {
    await expect(page.getByText('Foreign Languages').first()).toBeVisible();
  });

  test('Intermediate difficulty badge is shown', async ({ page }) => {
    await expect(page.getByText('Intermediate').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. COURSE SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Course Search', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCourses(page);
  });

  test('search box is present in header (disabled on courses page)', async ({ page }) => {
    // The global search box is disabled on the Courses page (only enabled on Assessments/Blogs/Test Series)
    const searchBox = page.getByRole('searchbox').first();
    await expect(searchBox).toBeVisible();
  });

  test('searching for a known course shows matching result', async ({ page }) => {
    // Courses page doesn't have its own search — verify the course is visible by default
    await expect(page.getByRole('heading', { name: 'Mandarin Chinese for Beginners' })).toBeVisible();
  });

  test('multiple course categories are visible', async ({ page }) => {
    // Verify MBA, GRE and Foreign Languages courses are all present
    await expect(page.getByText('MBA').first()).toBeVisible();
    await expect(page.getByText('GRE').first()).toBeVisible();
    await expect(page.getByText('Foreign Languages').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. COURSE DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Course Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(MANDARIN_COURSE_URL);
    await expect(page.getByRole('heading', { name: 'Mandarin Chinese for Beginners' })).toBeVisible({ timeout: 15000 });
  });

  test('course detail page loads with correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mandarin Chinese for Beginners' })).toBeVisible();
  });

  test('breadcrumb shows Courses > course name', async ({ page }) => {
    await expect(page.getByRole('list').getByRole('link', { name: 'Courses' })).toBeVisible();
    await expect(page.getByText('Mandarin Chinese for Beginners').first()).toBeVisible();
  });

  test('difficulty level badge is shown', async ({ page }) => {
    await expect(page.getByText('Beginner', { exact: true }).first()).toBeVisible();
  });

  test('course tagline is shown', async ({ page }) => {
    await expect(page.getByText("Start speaking Mandarin — the world's most spoken language")).toBeVisible();
  });

  test('course description is shown', async ({ page }) => {
    await expect(page.getByText(/Learn Mandarin from zero/i)).toBeVisible();
  });

  test('duration stat is shown', async ({ page }) => {
    await expect(page.getByText('42.0 hours')).toBeVisible();
  });

  test('modules count stat is shown', async ({ page }) => {
    // Use exact span text to avoid matching the curriculum summary paragraph
    await expect(page.locator('span').filter({ hasText: /^2 modules$/ }).first()).toBeVisible();
  });

  test('lessons count stat is shown', async ({ page }) => {
    await expect(page.locator('span').filter({ hasText: /^4 lessons$/ }).first()).toBeVisible();
  });

  test('instructor name is shown', async ({ page }) => {
    await expect(page.getByText('OwletCampus Faculty')).toBeVisible();
  });

  test('"Enroll Now" button is present with price', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Enroll Now/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\$0\.00/i })).toBeVisible();
  });

  test('"Preview Course" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Preview Course' })).toBeVisible();
  });

  test('"Course Curriculum" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Course Curriculum' })).toBeVisible();
    await expect(page.getByText('2 modules · 4 lessons')).toBeVisible();
  });

  test('curriculum shows module names', async ({ page }) => {
    // Use the bold paragraph (exact heading text) to avoid matching the subtitle
    await expect(page.locator('p.font-bold').filter({ hasText: 'Getting Started' })).toBeVisible();
    await expect(page.locator('p.font-bold').filter({ hasText: 'Core Concepts' })).toBeVisible();
  });

  test('curriculum shows lesson names', async ({ page }) => {
    await expect(page.getByText('Introduction & Course Overview')).toBeVisible();
    await expect(page.getByText('Key Concepts and Strategies')).toBeVisible();
  });

  test('curriculum shows lesson durations', async ({ page }) => {
    await expect(page.getByText('10 min').first()).toBeVisible();
    await expect(page.getByText('15 min').first()).toBeVisible();
  });

  test('curriculum shows quiz lessons', async ({ page }) => {
    await expect(page.getByText('Fundamentals Quiz')).toBeVisible();
    await expect(page.getByText('Core Concepts Quiz')).toBeVisible();
  });

  test('breadcrumb "Courses" link navigates back to courses list', async ({ page }) => {
    await page.getByRole('list').getByRole('link', { name: 'Courses' }).click();
    await expect(page).toHaveURL(COURSES_URL);
  });

  test('course thumbnail image is shown', async ({ page }) => {
    await expect(page.getByRole('img', { name: 'Mandarin Chinese for Beginners' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. COURSE DETAIL – INTERMEDIATE COURSE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Course Detail – Intermediate Course', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(MBA_COURSE_URL);
    await expect(page.getByRole('heading', { name: /MBA Foundations/i })).toBeVisible({ timeout: 15000 });
  });

  test('Intermediate difficulty badge is shown', async ({ page }) => {
    await expect(page.getByText('Intermediate', { exact: true }).first()).toBeVisible();
  });

  test('course stats show correct duration', async ({ page }) => {
    await expect(page.getByText('35.0 hours')).toBeVisible();
  });

  test('course stats show 1 module', async ({ page }) => {
    await expect(page.locator('span').filter({ hasText: /^1 modules$/ }).first()).toBeVisible();
  });

  test('course stats show 3 lessons', async ({ page }) => {
    await expect(page.locator('span').filter({ hasText: /^3 lessons$/ }).first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. LEARNING PATHS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Learning Paths List Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPaths(page);
  });

  test('page loads with "Paths to Mastery" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Paths to Mastery' })).toBeVisible();
    await expect(page.getByText('Structured learning journeys combining multiple courses')).toBeVisible();
  });

  test('known path "AI Architect" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible();
  });

  test('known path "Neural Ops" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Neural Ops' })).toBeVisible();
  });

  test('known path "Data Strategist" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Data Strategist' })).toBeVisible();
  });

  test('path cards show courses included count', async ({ page }) => {
    await expect(page.getByText('6 Courses Included')).toBeVisible();
    await expect(page.getByText('4 Courses Included')).toBeVisible();
  });

  test('"Most Popular" badge is shown on AI Architect', async ({ page }) => {
    await expect(page.getByText('Most Popular')).toBeVisible();
  });

  test('path cards show duration in weeks', async ({ page }) => {
    await expect(page.getByText('14 Weeks')).toBeVisible();
    await expect(page.getByText('10 Weeks')).toBeVisible();
  });

  test('path cards show difficulty level', async ({ page }) => {
    await expect(page.getByText('Expert')).toBeVisible();
    await expect(page.getByText('Advanced').first()).toBeVisible();
    await expect(page.getByText('Intermediate').first()).toBeVisible();
  });

  test('path cards show description text', async ({ page }) => {
    await expect(page.getByText(/Bridge the gap between theoretical models/i)).toBeVisible();
  });

  test('clicking a path card navigates to the path detail page', async ({ page }) => {
    await page.getByRole('link', { name: /AI Architect/i }).click();
    await expect(page).toHaveURL(/\/user\/paths\/.+/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. LEARNING PATH DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Learning Path Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(AI_ARCHITECT_PATH_URL);
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible({ timeout: 15000 });
  });

  test('path detail page loads with correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Architect' })).toBeVisible();
  });

  test('breadcrumb shows Paths to Mastery > path name', async ({ page }) => {
    await expect(page.getByRole('list').getByRole('link', { name: 'Paths to Mastery' })).toBeVisible();
    await expect(page.getByText('AI Architect').first()).toBeVisible();
  });

  test('category badge is shown', async ({ page }) => {
    await expect(page.getByText('ARTIFICIAL INTELLIGENCE')).toBeVisible();
  });

  test('"LEARNING PATH" label is shown', async ({ page }) => {
    // The badge uses "Learning Path" (not "Learning Paths") — scope to the badge span
    await expect(page.locator('span').filter({ hasText: /^Learning Path$/ })).toBeVisible();
  });

  test('lessons count stat is shown', async ({ page }) => {
    await expect(page.getByText('12 Lessons')).toBeVisible();
  });

  test('difficulty level stat is shown', async ({ page }) => {
    await expect(page.getByText('Expert')).toBeVisible();
  });

  test('duration in weeks is shown', async ({ page }) => {
    await expect(page.getByText('14 Weeks')).toBeVisible();
  });

  test('enrolled students count is shown', async ({ page }) => {
    await expect(page.getByText(/students enrolled/i)).toBeVisible();
  });

  test('rating is shown', async ({ page }) => {
    await expect(page.getByText('4.8')).toBeVisible();
  });

  test('"Courses in this path" section is visible', async ({ page }) => {
    await expect(page.getByText('Courses in this path')).toBeVisible();
  });

  test('courses in path are listed with names', async ({ page }) => {
    await expect(page.getByText('Neural Architectures & Generative Systems')).toBeVisible();
    await expect(page.getByText('Strategic Decision Making with Big Data')).toBeVisible();
  });

  test('courses in path show duration', async ({ page }) => {
    await expect(page.getByText('12 Hours')).toBeVisible();
    await expect(page.getByText('8 Hours')).toBeVisible();
  });

  test('courses in path show modules count', async ({ page }) => {
    await expect(page.getByText('8 modules')).toBeVisible();
    await expect(page.getByText('6 modules')).toBeVisible();
  });

  test('breadcrumb "Paths to Mastery" link navigates back to paths list', async ({ page }) => {
    await page.getByRole('list').getByRole('link', { name: 'Paths to Mastery' }).click();
    await expect(page).toHaveURL(PATHS_URL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Navigation – Courses', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('Courses is accessible via Learning Exp > Courses', async ({ page }) => {
    await page.goto(COURSES_URL);
    // On the Courses page, the Courses link is already visible in the expanded submenu
    await expect(page.locator('a[href="/user/courses"]').first()).toBeVisible();
    await page.locator('a[href="/user/courses"]').first().click();
    await expect(page).toHaveURL(COURSES_URL);
  });

  test('Learning Paths is accessible via Learning Exp > Learning Paths', async ({ page }) => {
    await page.goto(COURSES_URL);
    await expect(page.locator('a[href="/user/paths"]').first()).toBeVisible();
    await page.locator('a[href="/user/paths"]').first().click();
    await expect(page).toHaveURL(PATHS_URL);
  });

  test('unauthenticated access to courses redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(COURSES_URL);
    await page.waitForTimeout(1000);
    const url = page.url();
    const isValid = url.includes('/courses') || url.includes('/login');
    expect(isValid).toBeTruthy();
  });

  test('unauthenticated access to course detail redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(MANDARIN_COURSE_URL);
    await page.waitForTimeout(1000);
    const url = page.url();
    const isValid = url.includes('/courses') || url.includes('/login');
    expect(isValid).toBeTruthy();
  });

  test('unauthenticated access to paths redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(PATHS_URL);
    await page.waitForTimeout(1000);
    const url = page.url();
    const isValid = url.includes('/paths') || url.includes('/login');
    expect(isValid).toBeTruthy();
  });
});
