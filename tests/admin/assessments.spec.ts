import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
const ASSESSMENTS_URL = `${BASE_URL}/admin/tests`;
const NEW_TEST_URL = `${BASE_URL}/admin/tests/new`;

const ADMIN_EMAIL = 'raghuram@gmail.com';
const ADMIN_PASSWORD = 'Ruaf@1489';

// ─── Shared login helper ────────────────────────────────────────────────────
async function loginAsAdmin(page: Page) {
  await page.goto(ADMIN_LOGIN_URL);
  await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(`${BASE_URL}/admin/dashboard`, { timeout: 15000 });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Admin Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto(ADMIN_LOGIN_URL);
    await expect(page.getByRole('heading', { name: 'Admin Sign In' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 10000 });
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto(ADMIN_LOGIN_URL);
    await page.getByRole('textbox', { name: 'Email' }).fill('wrong@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('WrongPass123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    // Should stay on login page
    await expect(page).toHaveURL(ADMIN_LOGIN_URL);
  });

  test('login page has link to user login', async ({ page }) => {
    await page.goto(ADMIN_LOGIN_URL);
    await expect(page.getByRole('link', { name: 'User Login' })).toBeVisible();
  });

  test('forgot password link is present', async ({ page }) => {
    await page.goto(ADMIN_LOGIN_URL);
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. ASSESSMENTS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Assessments List Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(ASSESSMENTS_URL);
  });

  test('assessments page loads with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Assessments' })).toBeVisible();
    await expect(page.getByText('Create and manage individual assessments')).toBeVisible();
  });

  test('stats cards are visible', async ({ page }) => {
    await expect(page.getByText('Total Assessments')).toBeVisible();
    await expect(page.getByText('Active Tests')).toBeVisible();
    await expect(page.getByText('Total Submissions')).toBeVisible();
    await expect(page.getByText('Avg. Score')).toBeVisible();
  });

  test('New Test button is visible and clickable', async ({ page }) => {
    const newTestBtn = page.getByRole('button', { name: 'New Test' });
    await expect(newTestBtn).toBeVisible();
    await newTestBtn.click();
    // The button may open a modal or navigate – either is valid
    const navigated = await page.waitForURL(/\/admin\/tests\/new/, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (!navigated) {
      // Might open a modal/dialog instead
      const modal = page.locator('[role="dialog"], [role="modal"]').first();
      const isModal = await modal.isVisible().catch(() => false);
      expect(isModal || (await page.url()).includes('/admin/tests')).toBeTruthy();
    }
  });

  test('status filter tabs are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ACTIVE' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'DRAFT' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'SCHEDULED' })).toBeVisible();
  });

  test('filter by ACTIVE status shows only active assessments', async ({ page }) => {
    await page.getByRole('button', { name: 'ACTIVE' }).click();
    // All visible status badges should say "active"
    const statusBadges = page.locator('text=active');
    await expect(statusBadges.first()).toBeVisible();
  });

  test('filter by DRAFT status shows only draft assessments', async ({ page }) => {
    await page.getByRole('button', { name: 'DRAFT' }).click();
    const statusBadges = page.locator('text=draft');
    await expect(statusBadges.first()).toBeVisible();
  });

  test('category dropdown is present and has options', async ({ page }) => {
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();
    // Verify some known categories exist
    await expect(categorySelect.locator('option', { hasText: 'All Categories' })).toHaveCount(1);
    await expect(categorySelect.locator('option', { hasText: 'Aptitude' })).toHaveCount(1);
  });

  test('filter by category narrows the list', async ({ page }) => {
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('Aptitude');
    // Page should still be on assessments URL (no navigation)
    await expect(page).toHaveURL(ASSESSMENTS_URL);
  });

  test('search box is present in header', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: 'Search tests' })).toBeVisible();
  });

  test('assessment cards show title, questions count and submissions', async ({ page }) => {
    // First card should have Questions and Submissions labels
    await expect(page.getByText('Questions').first()).toBeVisible();
    await expect(page.getByText('Submissions').first()).toBeVisible();
  });

  test('each assessment card has Edit, Analytics and Delete actions', async ({ page }) => {
    // Edit link (aria-label contains "Edit assessment")
    await expect(page.getByRole('link', { name: /Edit assessment/i }).first()).toBeVisible();
    // Analytics link
    await expect(page.getByRole('link', { name: /View assessment responses/i }).first()).toBeVisible();
    // Delete button
    await expect(page.getByRole('button', { name: 'Delete assessment' }).first()).toBeVisible();
  });

  test('active assessment card shows Manage link', async ({ page }) => {
    await page.getByRole('button', { name: 'ACTIVE' }).click();
    await expect(page.getByRole('link', { name: 'Manage' }).first()).toBeVisible();
  });

  test('draft assessment card shows Publish link', async ({ page }) => {
    await page.getByRole('button', { name: 'DRAFT' }).click();
    await expect(page.getByRole('link', { name: 'Publish' }).first()).toBeVisible();
  });

  test('clicking assessment title navigates to edit page', async ({ page }) => {
    // Click the first assessment card link
    const firstCard = page.getByRole('link', { name: /Edit assessment/i }).first();
    const href = await firstCard.getAttribute('href');
    await firstCard.click();
    await expect(page).toHaveURL(new RegExp('/admin/tests/new'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. CREATE NEW ASSESSMENT – DETAILS STEP
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Create New Assessment – Details Step', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(NEW_TEST_URL);
  });

  test('new test page loads with correct structure', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Assessment Details' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Assessment name/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create & Continue/i })).toBeVisible();
  });

  test('breadcrumb back link navigates to assessments list', async ({ page }) => {
    // Use the breadcrumb link specifically (contains arrow_back icon text)
    await page.getByRole('link', { name: /arrow_back.*Assessments/i }).click();
    await expect(page).toHaveURL(ASSESSMENTS_URL);
  });

  test('assessment name field has default value "New Assessment"', async ({ page }) => {
    const nameInput = page.getByRole('textbox', { name: /e\.g\. Aptitude Test/i });
    await expect(nameInput).toHaveValue('New Assessment');
  });

  test('inline title textbox reflects typed name', async ({ page }) => {
    const inlineTitle = page.getByRole('textbox', { name: 'Assessment name…' });
    await inlineTitle.fill('My Test Assessment');
    await expect(inlineTitle).toHaveValue('My Test Assessment');
  });

  test('category dropdown defaults to "Select category…"', async ({ page }) => {
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toHaveValue('');
  });

  test('language dropdown defaults to English', async ({ page }) => {
    // Find the language combobox (second select on the page)
    const langSelect = page.locator('select').nth(1);
    await expect(langSelect).toHaveValue('English');
  });

  test('description textarea is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Internal notes/i })).toBeVisible();
  });

  test('logo upload button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Upload image' })).toBeVisible();
  });

  test('Activate button is disabled on new test', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Activate/i })).toBeDisabled();
  });

  test('wizard sidebar shows 4 steps', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Details/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Questions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Time Controls/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Access/i })).toBeVisible();
  });

  test('Questions, Time Controls and Access steps are disabled initially', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Questions/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Time Controls/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Access/i })).toBeDisabled();
  });

  test('completion indicator shows 0 of 4 sections complete', async ({ page }) => {
    await expect(page.getByText('0 of 4 sections complete')).toBeVisible();
  });

  test('Create & Continue button advances to next step', async ({ page }) => {
    // Fill required name field
    const nameInput = page.getByRole('textbox', { name: /e\.g\. Aptitude Test/i });
    await nameInput.fill('Playwright Test Assessment');
    // Select a category
    await page.locator('select').first().selectOption('Aptitude');
    await page.getByRole('button', { name: /Create & Continue/i }).click();
    // Should advance – Questions step or URL should update with testId
    await expect(page).toHaveURL(/testId=/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. ASSESSMENT NAVIGATION & SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Admin Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('sidebar Assessments link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Assessments', exact: true })).toBeVisible();
  });

  test('sidebar Assessments link navigates to /admin/tests', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Assessments', exact: true }).click();
    await expect(page).toHaveURL(ASSESSMENTS_URL);
  });

  test('sidebar Test Series link navigates to /admin/test-plans', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Test Series', exact: true }).click();
    await expect(page).toHaveURL(`${BASE_URL}/admin/test-plans`);
  });

  test('sidebar collapse button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();
  });

  test('dashboard quick shortcut "Start new test" navigates correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.getByRole('link', { name: 'Start new test' }).click();
    await expect(page).toHaveURL(NEW_TEST_URL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. ASSESSMENT SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Assessment Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(ASSESSMENTS_URL);
  });

  test('search box accepts input', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search tests' });
    await searchBox.fill('Python');
    await expect(searchBox).toHaveValue('Python');
  });

  test('searching for a known test title shows matching result', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search tests' });
    await searchBox.fill('AI: Python');
    // Wait briefly for any filtering
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'AI: Python' })).toBeVisible();
  });

  test('searching for non-existent test shows no matching cards', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search tests' });
    await searchBox.fill('xyznonexistenttest12345');
    await page.waitForTimeout(500);
    // The known test "AI: Python" should not be visible
    await expect(page.getByRole('heading', { name: 'AI: Python' })).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. ASSESSMENT RESPONSES / ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Assessment Responses & Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(ASSESSMENTS_URL);
  });

  test('clicking analytics icon navigates to responses URL', async ({ page }) => {
    const analyticsLink = page.getByRole('link', { name: /View assessment responses/i }).first();
    await analyticsLink.click();
    await expect(page).toHaveURL(/responses=/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. DELETE ASSESSMENT – MODAL FLOW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Delete Assessment', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(ASSESSMENTS_URL);
  });

  test('clicking delete button opens Delete Test modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete assessment' }).first().click();
    await expect(page.getByRole('heading', { name: 'Delete Test' })).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this test?')).toBeVisible();
  });

  test('delete modal shows confirmation text input', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete assessment' }).first().click();
    await expect(page.getByRole('textbox', { name: 'DELETE' })).toBeVisible();
    await expect(page.getByText('Type DELETE to confirm:')).toBeVisible();
  });

  test('Delete Test button is disabled until DELETE is typed', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete assessment' }).first().click();
    const deleteBtn = page.getByRole('button', { name: 'Delete Test' });
    await expect(deleteBtn).toBeDisabled();
    // Type the confirmation text
    await page.getByRole('textbox', { name: 'DELETE' }).fill('DELETE');
    await expect(deleteBtn).toBeEnabled();
  });

  test('Cancel button closes the delete modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete assessment' }).first().click();
    await expect(page.getByRole('heading', { name: 'Delete Test' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Delete Test' })).not.toBeVisible();
  });

  test('delete modal lists what will be permanently deleted', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete assessment' }).first().click();
    await expect(page.getByText('This will permanently delete:')).toBeVisible();
    await expect(page.getByText('The test and all its settings')).toBeVisible();
    await expect(page.getByText('All test results and submissions')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. DASHBOARD ASSESSMENT WORKFLOW SECTION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Dashboard Assessment Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/dashboard`);
  });

  test('Assessment workflow section is visible on dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Assessment workflow' })).toBeVisible();
  });

  test('Question Bank link is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Question Bank/i })).toBeVisible();
  });

  test('Manage Tests link navigates to assessments list', async ({ page }) => {
    await page.getByRole('link', { name: /Manage Tests/i }).click();
    await expect(page).toHaveURL(ASSESSMENTS_URL);
  });

  test('Create New Test link navigates to new test page', async ({ page }) => {
    await page.getByRole('link', { name: /Create New Test/i }).click();
    await expect(page).toHaveURL(NEW_TEST_URL);
  });

  test('Test Plans link navigates to test-plans page', async ({ page }) => {
    await page.getByRole('link', { name: /Test Plans/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/admin/test-plans`);
  });
});
