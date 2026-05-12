import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const USER_LOGIN_URL = `${BASE_URL}/user/login`;
const ASSESSMENTS_URL = `${BASE_URL}/user/assessments`;

// Known stable assessments
const DUMMY_TEST_ID = '289bb809-1156-4e0f-910b-3eee8173016f';       // Dummy Test – 3 questions, 30 min
const IN_PROGRESS_TEST_ID = 'dcd6c378-68ce-4add-80fa-a547e067a191'; // E2E Automated Test – In Progress
const CAT_TEST_ID = 'e0a6f9b6-5bc6-44fe-a62e-1163e39e7854';         // CAT SAMPLE PAPER - 1, 35 questions

const DUMMY_TEST_URL = `${BASE_URL}/user/test/${DUMMY_TEST_ID}`;
const IN_PROGRESS_TEST_URL = `${BASE_URL}/user/test/${IN_PROGRESS_TEST_ID}`;

const USER_EMAIL = 'suryatataje@gmail.com';
const USER_PASSWORD = 'Asurya@.0009';

// ─── Shared login helper ────────────────────────────────────────────────────
async function loginAsUser(page: Page) {
  // Clear cookies to ensure no admin session interferes
  await page.context().clearCookies();
  await page.goto(USER_LOGIN_URL);
  await expect(page).toHaveURL(USER_LOGIN_URL, { timeout: 10000 });
  await page.getByRole('textbox', { name: 'Email address' }).fill(USER_EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/user\//, { timeout: 15000 });
  // Wait for the user sidebar to confirm user session is active
  await expect(page.getByRole('complementary')).toBeVisible({ timeout: 10000 });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. USER AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('User Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto(USER_LOGIN_URL);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('login page has Google sign-in option', async ({ page }) => {
    await page.goto(USER_LOGIN_URL);
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('login page has "Forgot password?" link', async ({ page }) => {
    await page.goto(USER_LOGIN_URL);
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
  });

  test('login page has "Sign up here" link', async ({ page }) => {
    await page.goto(USER_LOGIN_URL);
    await expect(page.getByRole('link', { name: 'Sign up here' })).toBeVisible();
  });

  test('login page shows marketing stats panel', async ({ page }) => {
    await page.goto(USER_LOGIN_URL);
    await expect(page.getByRole('heading', { name: 'Recent tests' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Study materials' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Achievements' })).toBeVisible();
  });

  test('valid login redirects to user area', async ({ page }) => {
    await loginAsUser(page);
    await expect(page).toHaveURL(/\/user\//);
  });

  test('invalid login stays on login page', async ({ page }) => {
    await page.goto(USER_LOGIN_URL);
    await page.getByRole('textbox', { name: 'Email address' }).fill('wrong@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('WrongPass123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(USER_LOGIN_URL, { timeout: 8000 });
  });

  test('logged-in user sees their username in the header', async ({ page }) => {
    await loginAsUser(page);
    await expect(page.getByRole('button', { name: /Account menu for suryatataje/i })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. ASSESSMENTS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Assessments List Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(ASSESSMENTS_URL);
    // Wait for the main content to load
    await expect(page.getByRole('heading', { name: 'Available Assessments' })).toBeVisible({ timeout: 15000 });
  });

  test('page loads with "Available Assessments" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Available Assessments' })).toBeVisible();
  });

  test('"Resume Where You Left Off" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Resume Where You Left Off' })).toBeVisible();
    await expect(page.getByText('Pick up your momentum and reach your learning goals faster')).toBeVisible();
  });

  test('"View all progress" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'View all progress' })).toBeVisible();
  });

  test('in-progress assessments show "Continue Assessment" link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Continue Assessment' }).first()).toBeVisible();
  });

  test('in-progress cards show "In progress" badge', async ({ page }) => {
    await expect(page.getByText('In progress').first()).toBeVisible();
  });

  test('in-progress cards show completion percentage', async ({ page }) => {
    await expect(page.getByText(/\d+% Complete/).first()).toBeVisible();
  });

  test('in-progress cards show questions answered count', async ({ page }) => {
    await expect(page.getByText(/\d+\/\d+ questions/).first()).toBeVisible();
  });

  test('filter tabs All, In Progress, Completed are present', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'In Progress' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Completed' })).toBeVisible();
  });

  test('"All" tab is selected by default', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
  });

  test('Category filter dropdown is present', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Category' })).toBeVisible();
  });

  test('Category dropdown has expected options', async ({ page }) => {
    const categorySelect = page.getByRole('combobox', { name: 'Category' });
    await expect(categorySelect).toContainText('All Categories');
    await expect(categorySelect).toContainText('Aptitude');
  });

  test('"Filter" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
  });

  test('assessment cards show title, category, difficulty, questions count and duration', async ({ page }) => {
    // First card (CAT SAMPLE PAPER - 1)
    await expect(page.getByRole('heading', { name: 'CAT SAMPLE PAPER - 1' })).toBeVisible();
    await expect(page.getByText('35 questions').first()).toBeVisible();
    await expect(page.getByText('1h 30m').first()).toBeVisible();
  });

  test('assessment cards show difficulty badge (Beginner/Intermediate/Advanced)', async ({ page }) => {
    await expect(page.getByText('Intermediate').first()).toBeVisible();
  });

  test('assessment cards show "Start" link for new assessments', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Start' }).first()).toBeVisible();
  });

  test('in-progress assessments show "Resume" link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Resume' }).first()).toBeVisible();
  });

  test('search box is present in header', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: 'Search assessments' })).toBeVisible();
  });

  test('sidebar "Assessments" link is active', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Assessments', exact: true })).toBeVisible();
  });

  test('clicking "In Progress" tab filters to in-progress assessments', async ({ page }) => {
    await page.getByRole('tab', { name: 'In Progress' }).click();
    await page.waitForTimeout(400);
    await expect(page.getByRole('tab', { name: 'In Progress' })).toHaveAttribute('aria-selected', 'true');
    // Should show Resume links
    await expect(page.getByRole('link', { name: 'Resume' }).first()).toBeVisible();
  });

  test('clicking "Completed" tab shows completed assessments', async ({ page }) => {
    await page.getByRole('tab', { name: 'Completed' }).click();
    await page.waitForTimeout(400);
    await expect(page.getByRole('tab', { name: 'Completed' })).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking "All" tab restores full list', async ({ page }) => {
    await page.getByRole('tab', { name: 'In Progress' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('tab', { name: 'All' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: 'CAT SAMPLE PAPER - 1' })).toBeVisible();
  });

  test('clicking a "Start" link navigates to the test overview page', async ({ page }) => {
    await page.getByRole('link', { name: 'Start' }).first().click();
    await expect(page).toHaveURL(/\/user\/test\/.+/);
  });

  test('clicking a "Resume" link navigates to the test overview page', async ({ page }) => {
    await page.getByRole('link', { name: 'Resume' }).first().click();
    await expect(page).toHaveURL(/\/user\/test\/.+/);
  });

  test('"Ask your Mentor" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ask your Mentor' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. ASSESSMENT SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Assessment Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(ASSESSMENTS_URL);
    await expect(page.getByRole('heading', { name: 'Available Assessments' })).toBeVisible({ timeout: 15000 });
  });

  test('search box accepts input', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search assessments' });
    await searchBox.fill('Dummy');
    await expect(searchBox).toHaveValue('Dummy');
  });

  test('searching for a known assessment shows matching result', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search assessments' }).fill('Dummy Test');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Dummy Test' })).toBeVisible();
  });

  test('searching for non-existent assessment hides unrelated results', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search assessments' }).fill('xyznonexistenttest99999');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'CAT SAMPLE PAPER - 1' })).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. ASSESSMENT OVERVIEW PAGE (Test Detail)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Assessment Overview Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(DUMMY_TEST_URL);
    await expect(page.getByRole('heading', { name: 'Dummy Test' })).toBeVisible({ timeout: 15000 });
  });

  test('overview page loads with test title as heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dummy Test' })).toBeVisible();
  });

  test('"Assessment overview" label is shown', async ({ page }) => {
    await expect(page.getByText('Assessment overview')).toBeVisible();
  });

  test('breadcrumb shows Assessments > test name', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Assessments' })).toBeVisible();
    await expect(page.getByText('Dummy Test').first()).toBeVisible();
  });

  test('Duration is shown correctly', async ({ page }) => {
    await expect(page.getByText('Duration')).toBeVisible();
    await expect(page.getByText('30 min', { exact: true })).toBeVisible();
  });

  test('Questions count is shown correctly', async ({ page }) => {
    await expect(page.getByText('Questions', { exact: true })).toBeVisible();
    await expect(page.getByText('3 total')).toBeVisible();
  });

  test('"Instructions" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Instructions' })).toBeVisible();
  });

  test('instructions list has expected items', async ({ page }) => {
    await expect(page.getByText(/This test focuses on/i)).toBeVisible();
    await expect(page.getByText(/You have 30 minutes/i)).toBeVisible();
    await expect(page.getByText(/Pay attention to code examples/i)).toBeVisible();
  });

  test('"Before you start" section is visible', async ({ page }) => {
    await expect(page.getByText('Before you start')).toBeVisible();
  });

  test('"Before you start" has important reminders', async ({ page }) => {
    await expect(page.getByText('Ensure a stable internet connection')).toBeVisible();
    await expect(page.getByText('Do not refresh during the test')).toBeVisible();
    await expect(page.getByText('Progress is saved as you go')).toBeVisible();
    await expect(page.getByText('The test auto-submits when time runs out')).toBeVisible();
  });

  test('"Start Test" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start Test' })).toBeVisible();
  });

  test('"Back to Assessments" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();
  });

  test('clicking "Back to Assessments" navigates to assessments list', async ({ page }) => {
    await page.getByRole('button', { name: /Back/i }).click();
    await expect(page).toHaveURL(ASSESSMENTS_URL);
  });

  test('breadcrumb "Assessments" link navigates to assessments list', async ({ page }) => {
    await page.getByRole('link', { name: 'Assessments' }).click();
    await expect(page).toHaveURL(ASSESSMENTS_URL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. IN-PROGRESS ASSESSMENT OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('In-Progress Assessment Overview', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(IN_PROGRESS_TEST_URL);
    await expect(page.getByRole('heading', { name: /E2E Automated Test/i })).toBeVisible({ timeout: 15000 });
  });

  test('in-progress test overview page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /E2E Automated Test/i })).toBeVisible();
  });

  test('"Start Test" button is present for in-progress test', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start Test' })).toBeVisible();
  });

  test('duration is shown for in-progress test', async ({ page }) => {
    await expect(page.getByText('Duration')).toBeVisible();
    await expect(page.getByText('60 min', { exact: true })).toBeVisible();
  });

  test('questions count is shown for in-progress test', async ({ page }) => {
    await expect(page.getByText('1 total')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. ASSESSMENT CATEGORY FILTER
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Assessment Category Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(ASSESSMENTS_URL);
    await expect(page.getByRole('heading', { name: 'Available Assessments' })).toBeVisible({ timeout: 15000 });
  });

  test('selecting Aptitude category filters the list', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Category' }).selectOption('Aptitude');
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.waitForTimeout(500);
    // HR QUESTIONS LEVEL 2 is Aptitude category
    await expect(page.getByRole('heading', { name: 'HR QUESTIONS LEVEL 2' })).toBeVisible();
  });

  test('selecting All Categories restores full list', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Category' }).selectOption('Aptitude');
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.waitForTimeout(400);
    await page.getByRole('combobox', { name: 'Category' }).selectOption('All Categories');
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.waitForTimeout(400);
    await expect(page.getByRole('heading', { name: 'CAT SAMPLE PAPER - 1' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. USER NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('User Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('sidebar "Assessments" link navigates to /user/assessments', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Assessments', exact: true }).click();
    await expect(page).toHaveURL(ASSESSMENTS_URL);
  });

  test('sidebar "Test Series" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Test Series', exact: true })).toBeVisible();
  });

  test('sidebar "Jobs" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Jobs', exact: true })).toBeVisible();
  });

  test('sidebar "Agentic Interviews" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Agentic Interviews', exact: true })).toBeVisible();
  });

  test('sidebar "Practice Zone" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Practice Zone', exact: true })).toBeVisible();
  });

  test('"Interview Now" CTA button is present in sidebar', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Interview Now' })).toBeVisible();
  });

  test('Notifications button is present in header', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Notifications' })).toBeVisible();
  });

  test('Account menu button shows username', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Account menu for suryatataje/i })).toBeVisible();
  });

  test('"Learning Exp" dropdown button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Learning Exp' })).toBeVisible();
  });

  test('clicking "Learning Exp" expands sub-menu with Courses, Blogs etc.', async ({ page }) => {
    await page.goto(ASSESSMENTS_URL);
    await page.getByRole('button', { name: 'Learning Exp' }).click();
    await expect(page.getByRole('link', { name: 'Courses', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blogs', exact: true })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. START TEST FLOW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Start Test Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(DUMMY_TEST_URL);
    await expect(page.getByRole('heading', { name: 'Dummy Test' })).toBeVisible({ timeout: 15000 });
  });

  test('"Start Test" button is enabled on the overview page', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start Test' })).toBeEnabled();
  });

  test('clicking "Start Test" initiates the test session', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Test' }).click();
    // Button becomes active/loading state
    await expect(page.getByRole('button', { name: 'Start Test' })).toBeVisible();
  });

  test('test overview shows correct test description', async ({ page }) => {
    await expect(page.getByText('Comprehensive assessment of dummy test concepts and skills')).toBeVisible();
  });

  test('navigating directly to test URL shows overview page', async ({ page }) => {
    await expect(page).toHaveURL(DUMMY_TEST_URL);
    await expect(page.getByRole('heading', { name: 'Dummy Test' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. UNAUTHENTICATED ACCESS
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Unauthenticated Access', () => {
  test('accessing assessments without login redirects to login page', async ({ page }) => {
    // Use a fresh context (no cookies)
    await page.context().clearCookies();
    await page.goto(ASSESSMENTS_URL);
    await expect(page).toHaveURL(/\/user\/login|\/login/, { timeout: 10000 });
  });

  test('accessing test overview without login redirects to login page', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(DUMMY_TEST_URL);
    await expect(page).toHaveURL(/\/user\/login|\/login/, { timeout: 10000 });
  });
});
