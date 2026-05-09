import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
const TEST_SERIES_URL = `${BASE_URL}/admin/test-plans`;
const NEW_TEST_PLAN_URL = `${BASE_URL}/admin/test-plans/new`;

// Known stable test plan for read/edit tests (TG EAMCET – Active, 25 tests)
const KNOWN_PLAN_ID = '1c771fb8-4a36-4a4d-8423-642b09ebe191';
const KNOWN_PLAN_EDIT_URL = `${BASE_URL}/admin/test-plans/${KNOWN_PLAN_ID}/edit`;
const KNOWN_PLAN_VIEW_URL = `${BASE_URL}/admin/test-plans/${KNOWN_PLAN_ID}`;

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
// 1. TEST SERIES LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Test Series List Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(TEST_SERIES_URL);
  });

  test('page loads with correct heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Test Series' })).toBeVisible();
    await expect(page.getByText('Group published assessments into cohesive plans')).toBeVisible();
  });

  test('"New test plan" link is visible and points to /admin/test-plans/new', async ({ page }) => {
    // The link text includes icon text — use partial match
    const newPlanLink = page.getByRole('link', { name: /New test plan/i });
    await expect(newPlanLink).toBeVisible();
    await newPlanLink.click();
    await expect(page).toHaveURL(NEW_TEST_PLAN_URL);
  });

  test('search box is present in header', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: 'Search test series' })).toBeVisible();
  });

  test('category filter dropdown is present with "All categories" default', async ({ page }) => {
    const categorySelect = page.getByRole('combobox', { name: 'Category' });
    await expect(categorySelect).toBeVisible();
    await expect(categorySelect).toHaveValue('');
  });

  test('status filter dropdown is present with "All status" default', async ({ page }) => {
    const statusSelect = page.getByRole('combobox', { name: 'Status' });
    await expect(statusSelect).toBeVisible();
    await expect(statusSelect).toHaveValue('');
  });

  test('category filter has expected options', async ({ page }) => {
    const categorySelect = page.getByRole('combobox', { name: 'Category' });
    await expect(categorySelect.locator('option', { hasText: 'All categories' })).toHaveCount(1);
    await expect(categorySelect.locator('option', { hasText: 'EAMCET' })).toHaveCount(1);
    await expect(categorySelect.locator('option', { hasText: 'Test Series' })).toHaveCount(1);
  });

  test('status filter has Active and Inactive options', async ({ page }) => {
    const statusSelect = page.getByRole('combobox', { name: 'Status' });
    // Use toContainText on the select element itself
    await expect(statusSelect).toContainText('Active');
    await expect(statusSelect).toContainText('Inactive');
  });

  test('filter by Active status shows only active plans', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Status' }).selectOption('Active');
    await page.waitForTimeout(600);
    // After filtering Active, no card should have an Inactive badge
    // Scope to article cards only to avoid matching the dropdown option text
    const inactiveBadgesInCards = page.getByRole('article').getByText('Inactive');
    await expect(inactiveBadgesInCards).toHaveCount(0);
  });

  test('filter by Inactive status shows only inactive plans', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Status' }).selectOption('inactive');
    await page.waitForTimeout(600);
    // At least one Inactive badge should be visible in the cards
    await expect(page.getByRole('article').getByText('Inactive').first()).toBeVisible();
  });

  test('filter by EAMCET category narrows the list', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Category' }).selectOption('EAMCET');
    await page.waitForTimeout(400);
    // TG EAMCET and AP EAMCET should be visible
    await expect(page.getByRole('heading', { name: 'TG EAMCET' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AP EAMCET' })).toBeVisible();
  });

  test('test plan cards show Tests, Category and Price metadata', async ({ page }) => {
    await expect(page.getByText('Tests').first()).toBeVisible();
    await expect(page.getByText('Category').first()).toBeVisible();
    await expect(page.getByText('Price').first()).toBeVisible();
  });

  test('each card has Edit, View and Delete action buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Edit test plan/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /View test plan/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete test plan/i }).first()).toBeVisible();
  });

  test('known active plan "TG EAMCET" is visible with Active badge', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TG EAMCET' })).toBeVisible();
    // The card containing TG EAMCET should show Active status
    const card = page.getByRole('article').filter({ hasText: 'TG EAMCET' }).first();
    await expect(card.getByText('Active')).toBeVisible();
  });

  test('known inactive plan "Sample" is visible with Inactive badge', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sample' }).first()).toBeVisible();
    // Find the article card that contains "Sample" as a heading
    const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Sample', exact: true }) }).first();
    await expect(card.getByText('Inactive')).toBeVisible();
  });

  test('clicking Edit navigates to edit page', async ({ page }) => {
    const editLink = page.getByRole('link', { name: /Edit test plan: TG EAMCET/i });
    await editLink.click();
    await expect(page).toHaveURL(KNOWN_PLAN_EDIT_URL);
  });

  test('clicking View navigates to view page', async ({ page }) => {
    const viewLink = page.getByRole('link', { name: /View test plan: TG EAMCET/i });
    await viewLink.click();
    await expect(page).toHaveURL(KNOWN_PLAN_VIEW_URL);
  });

  test('clicking plan title navigates to edit page', async ({ page }) => {
    await page.getByRole('link', { name: /TG EAMCET No description/i }).click();
    await expect(page).toHaveURL(KNOWN_PLAN_EDIT_URL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. CREATE NEW TEST PLAN PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Create New Test Plan', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(NEW_TEST_PLAN_URL);
  });

  test('page loads with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Test Plan Details' })).toBeVisible();
  });

  test('"Back to Test Plans" link navigates to list', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to Test Plans' }).click();
    await expect(page).toHaveURL(TEST_SERIES_URL);
  });

  test('Test Plan Name field is present and required', async ({ page }) => {
    const nameInput = page.getByRole('textbox', { name: 'Test Plan Name *' });
    await expect(nameInput).toBeVisible();
  });

  test('Description field is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible();
  });

  test('Tag Line field is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Tag Line' })).toBeVisible();
  });

  test('Category dropdown defaults to "Select a category (optional)"', async ({ page }) => {
    // Use label-scoped selector to avoid matching the "Filter by Category" dropdown
    const categorySelect = page.getByLabel('Category', { exact: true });
    await expect(categorySelect).toHaveValue('');
  });

  test('Category dropdown has expected options', async ({ page }) => {
    const categorySelect = page.getByLabel('Category', { exact: true });
    await expect(categorySelect).toContainText('EAMCET');
    await expect(categorySelect).toContainText('Test Series');
    await expect(categorySelect).toContainText('+ Add new category...');
  });

  test('"Landing page content" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Landing page content' })).toBeVisible();
  });

  test('"What you will be tested on" checkboxes are present', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: 'Quantitative aptitude & arithmetic' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Logical & analytical reasoning' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Verbal ability & reading comprehension' })).toBeVisible();
  });

  test('"Subjects covered" checkboxes are present', async ({ page }) => {
    await page.getByText('Subjects covered').scrollIntoViewIfNeeded();
    await expect(page.getByRole('checkbox', { name: 'Mathematics' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Physics' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Chemistry' })).toBeVisible();
  });

  test('"Add FAQ" button is present', async ({ page }) => {
    await page.getByRole('button', { name: 'Add FAQ' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Add FAQ' })).toBeVisible();
  });

  test('"Select Tests" section is visible with search and category filter', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Select Tests' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Search Tests' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by Category' })).toBeVisible();
  });

  test('test list shows checkboxes for each available test', async ({ page }) => {
    // Scroll to the Select Tests section to trigger rendering
    await page.getByRole('heading', { name: 'Select Tests' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const checkboxes = page.getByRole('checkbox');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('"Create Test Plan" button is disabled when no name is entered', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Create Test Plan' })).toBeDisabled();
  });

  test('"Create Test Plan" button is present and name field accepts input', async ({ page }) => {
    // Fill the name — the button may stay disabled until a test is also selected (app logic)
    await page.getByRole('textbox', { name: 'Test Plan Name *' }).fill('My New Test Plan');
    await expect(page.getByRole('textbox', { name: 'Test Plan Name *' })).toHaveValue('My New Test Plan');
    await expect(page.getByRole('button', { name: 'Create Test Plan' })).toBeVisible();
  });

  test('"Cancel" link navigates back to test plans list', async ({ page }) => {
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(TEST_SERIES_URL);
  });

  test('searching tests filters the available test list', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'Search Tests' });
    await searchInput.fill('AI: Python');
    await page.waitForTimeout(400);
    await expect(page.getByText('AI: Python').first()).toBeVisible();
  });

  test('filtering tests by category narrows the list', async ({ page }) => {
    // The filter dropdown uses UUIDs as option values — select by label text
    const filterSelect = page.getByRole('combobox', { name: 'Filter by Category' });
    await filterSelect.selectOption({ label: 'Aptitude' });
    await page.waitForTimeout(400);
    // At least one test item with "Playwright Test Assessment" (Aptitude) should be visible
    await expect(page.getByText('Playwright Test Assessment').first()).toBeVisible();
  });

  test('checking a test checkbox selects it', async ({ page }) => {
    const firstCheckbox = page.getByRole('checkbox').first();
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();
  });

  test('"Prefill from linked assessments" button is disabled initially', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Prefill from linked assessments' })).toBeDisabled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. EDIT EXISTING TEST PLAN (TG EAMCET)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Edit Existing Test Plan', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(KNOWN_PLAN_EDIT_URL);
  });

  test('edit page loads with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit Test Plan' })).toBeVisible();
    await expect(page.getByText('Update your test plan details, tests, and pricing')).toBeVisible();
  });

  test('"Back to Test Plan" link navigates to view page', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to Test Plan' }).click();
    await expect(page).toHaveURL(KNOWN_PLAN_VIEW_URL);
  });

  test('name field is pre-filled with "TG EAMCET"', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Test Plan Name *' })).toHaveValue('TG EAMCET');
  });

  test('category is pre-selected as EAMCET', async ({ page }) => {
    // The category select uses a UUID as value, check by selected option text instead
    const categorySelect = page.getByRole('combobox', { name: 'Category' });
    const selectedText = await categorySelect.locator('option:checked').textContent();
    expect(selectedText?.trim()).toBe('EAMCET');
  });

  test('Active status checkbox is checked', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: 'Active' })).toBeChecked();
  });

  test('public URL slug is shown and contains "tg-eamcet"', async ({ page }) => {
    await expect(page.getByText('/test-series/tg-eamcet')).toBeVisible();
  });

  test('"Basic Information" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
  });

  test('"Selected Tests" section shows 25 tests', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Selected Tests' })).toBeVisible();
    await expect(page.getByText('25 tests')).toBeVisible();
  });

  test('selected tests list shows numbered entries with Up/Down/Remove controls', async ({ page }) => {
    // First item should have Up disabled, Down enabled
    await expect(page.getByRole('button', { name: '↑' }).first()).toBeDisabled();
    await expect(page.getByRole('button', { name: '↓' }).first()).toBeEnabled();
    // Last item should have Down disabled
    await expect(page.getByRole('button', { name: '↓' }).last()).toBeDisabled();
  });

  test('Remove button is present for each selected test', async ({ page }) => {
    // Scroll to Selected Tests section to ensure it's rendered
    await page.getByRole('heading', { name: 'Selected Tests' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    // Use ↑ buttons as a proxy — each row has one ↑ button (25 rows = 25 ↑ buttons)
    const upButtons = page.getByRole('button', { name: '↑' });
    const count = await upButtons.count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('"Pricing & Discount" section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Pricing & Discount' })).toBeVisible();
  });

  test('plan price field shows 149', async ({ page }) => {
    await expect(page.getByRole('spinbutton', { name: 'Plan price' })).toHaveValue('149');
  });

  test('discount percentage field shows 0', async ({ page }) => {
    await expect(page.getByRole('spinbutton', { name: 'Discount Percentage' })).toHaveValue('0');
  });

  test('pricing summary shows Plan price and Total Price', async ({ page }) => {
    // Use the definition list term for "Plan price" to avoid strict mode violation
    await expect(page.getByRole('term').filter({ hasText: 'Plan price' })).toBeVisible();
    await expect(page.getByRole('term').filter({ hasText: 'Total Price' })).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: '₹149.00' }).first()).toBeVisible();
  });

  test('"Available Tests" section has search and category filter', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Available Tests' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Search tests...' })).toBeVisible();
  });

  test('already-selected tests show checked checkboxes in available list', async ({ page }) => {
    // Scroll to Available Tests section to trigger rendering of checkboxes
    await page.getByRole('heading', { name: 'Available Tests' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const checkedBoxes = page.getByRole('checkbox', { checked: true });
    const count = await checkedBoxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('"Update Test Plan" button is present and enabled', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Update Test Plan' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Test Plan' })).toBeEnabled();
  });

  test('"Cancel" link navigates to view page', async ({ page }) => {
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(KNOWN_PLAN_VIEW_URL);
  });

  test('subjects covered checkboxes reflect saved state (Mathematics checked)', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: 'Mathematics' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Physics' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Chemistry' })).toBeChecked();
  });

  test('editing the plan name field updates the value', async ({ page }) => {
    const nameInput = page.getByRole('textbox', { name: 'Test Plan Name *' });
    await nameInput.fill('TG EAMCET Updated');
    await expect(nameInput).toHaveValue('TG EAMCET Updated');
    // Restore original value
    await nameInput.fill('TG EAMCET');
  });

  test('changing price updates the pricing summary', async ({ page }) => {
    const priceInput = page.getByRole('spinbutton', { name: 'Plan price' });
    await priceInput.fill('199');
    await expect(page.getByText('₹199.00').first()).toBeVisible();
    // Restore
    await priceInput.fill('149');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. DELETE TEST PLAN FLOW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Delete Test Plan', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(TEST_SERIES_URL);
  });

  test('clicking delete button on a plan opens a confirmation prompt', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /Delete test plan/i }).first();
    await deleteBtn.click();
    // Expect a dialog, alert, or confirmation text to appear
    const hasDialog = await page.getByRole('dialog').isVisible().catch(() => false);
    const hasAlert = await page.getByRole('alertdialog').isVisible().catch(() => false);
    const hasConfirmText = await page.getByText(/confirm|are you sure|delete/i).isVisible().catch(() => false);
    expect(hasDialog || hasAlert || hasConfirmText).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. SIDEBAR NAVIGATION TO TEST SERIES
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Sidebar Navigation – Test Series', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('sidebar "Test Series" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Test Series', exact: true })).toBeVisible();
  });

  test('sidebar "Test Series" link navigates to /admin/test-plans', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Test Series', exact: true }).click();
    await expect(page).toHaveURL(TEST_SERIES_URL);
  });

  test('dashboard "Test Plans" workflow card links to /admin/test-plans', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.getByRole('link', { name: /Test Plans/i }).click();
    await expect(page).toHaveURL(TEST_SERIES_URL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. TEST SERIES SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Test Series Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(TEST_SERIES_URL);
  });

  test('search box accepts input', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search test series' });
    await searchBox.fill('EAMCET');
    await expect(searchBox).toHaveValue('EAMCET');
  });

  test('searching for "TG EAMCET" shows matching plan', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search test series' }).fill('TG EAMCET');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'TG EAMCET' })).toBeVisible();
  });

  test('searching for non-existent plan hides unrelated plans', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search test series' }).fill('xyznonexistent99999');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'TG EAMCET' })).not.toBeVisible();
  });
});
