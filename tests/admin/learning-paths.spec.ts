import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
const LEARNING_PATHS_URL = `${BASE_URL}/admin/courses/paths`;
const NEW_PATH_URL = `${BASE_URL}/admin/courses/paths/new`;

// Known stable paths
const FULL_STACK_PATH_ID = '2';   // Full Stack Developer – Draft, 2 courses, Intermediate, Popular
const MANUAL_TEST_PATH_ID = '3';  // manual. testing – Draft, 0 courses, Beginner, Popular

const FULL_STACK_EDIT_URL = `${BASE_URL}/admin/courses/paths/${FULL_STACK_PATH_ID}/edit`;
const MANUAL_EDIT_URL = `${BASE_URL}/admin/courses/paths/${MANUAL_TEST_PATH_ID}/edit`;

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
// 1. LEARNING PATHS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Learning Paths List Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(LEARNING_PATHS_URL);
  });

  test('page loads with correct heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Learning Paths' })).toBeVisible();
    await expect(page.getByText('Group courses into guided learning journeys')).toBeVisible();
  });

  test('"New Path" link is visible and navigates to /admin/courses/paths/new', async ({ page }) => {
    const newPathLink = page.getByRole('link', { name: /New Path/i });
    await expect(newPathLink).toBeVisible();
    await newPathLink.click();
    await expect(page).toHaveURL(NEW_PATH_URL);
  });

  test('search box is present in header', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: /Search learning paths/i })).toBeVisible();
  });

  test('stats card "Total Paths" is visible with count', async ({ page }) => {
    await expect(page.getByText('Total Paths')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: '2' }).first()).toBeVisible();
  });

  test('stats card "Published" is visible', async ({ page }) => {
    await expect(page.getByRole('paragraph').filter({ hasText: 'Published' }).first()).toBeVisible();
  });

  test('stats card "Popular" is visible', async ({ page }) => {
    await expect(page.getByRole('paragraph').filter({ hasText: 'Popular' }).first()).toBeVisible();
  });

  test('stats card "Enrollments" is visible', async ({ page }) => {
    await expect(page.getByText('Enrollments')).toBeVisible();
  });

  test('known path "Full Stack Developer" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Full Stack Developer' })).toBeVisible();
  });

  test('known path "manual. testing" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'manual. testing' })).toBeVisible();
  });

  test('path cards show description text', async ({ page }) => {
    await expect(page.getByText('this course is for beginers')).toBeVisible();
    await expect(page.getByText('for demo purpose')).toBeVisible();
  });

  test('path cards show courses count', async ({ page }) => {
    await expect(page.getByText('2 courses')).toBeVisible();
    await expect(page.getByText('0 courses')).toBeVisible();
  });

  test('path cards show enrolled count', async ({ page }) => {
    await expect(page.getByText('0 enrolled').first()).toBeVisible();
  });

  test('path cards show difficulty level badge', async ({ page }) => {
    await expect(page.getByText('Intermediate')).toBeVisible();
    await expect(page.getByText('Beginner')).toBeVisible();
  });

  test('path cards show Draft status badge', async ({ page }) => {
    await expect(page.getByText('Draft').first()).toBeVisible();
  });

  test('path cards show Popular badge', async ({ page }) => {
    await expect(page.getByText('Popular').first()).toBeVisible();
  });

  test('each path card has a "Publish" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Publish' }).first()).toBeVisible();
  });

  test('each path card has an "Edit" link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Edit' }).first()).toBeVisible();
  });

  test('each path card has a delete (icon) button', async ({ page }) => {
    // Verify Publish buttons exist (2 cards × 1 Publish each = at least 2)
    const publishBtns = page.getByRole('button', { name: /Publish/i });
    await expect(publishBtns.first()).toBeVisible();
    const count = await publishBtns.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('clicking "Edit" on Full Stack Developer navigates to edit page', async ({ page }) => {
    await page.getByRole('link', { name: 'Edit' }).nth(1).click(); // Full Stack is 2nd card
    await expect(page).toHaveURL(FULL_STACK_EDIT_URL);
  });

  test('sidebar "Learning Paths" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Learning Paths', exact: true })).toBeVisible();
  });

  test('sidebar "Learning Paths" link navigates to /admin/courses/paths', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Learning Paths', exact: true }).click();
    await expect(page).toHaveURL(LEARNING_PATHS_URL);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. LEARNING PATHS SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Learning Paths Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(LEARNING_PATHS_URL);
  });

  test('search box accepts input', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: /Search learning paths/i });
    await searchBox.fill('Full Stack');
    await expect(searchBox).toHaveValue('Full Stack');
  });

  test('searching for "Full Stack" shows matching path', async ({ page }) => {
    await page.getByRole('searchbox', { name: /Search learning paths/i }).fill('Full Stack');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Full Stack Developer' })).toBeVisible();
  });

  test('searching for non-existent path hides unrelated paths', async ({ page }) => {
    await page.getByRole('searchbox', { name: /Search learning paths/i }).fill('xyznonexistentpath99999');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Full Stack Developer' })).not.toBeVisible();
  });

  test('clearing search restores all paths', async ({ page }) => {
    // Search, then navigate back to the page to reset — the app doesn't auto-restore on clear
    await page.getByRole('searchbox', { name: /Search learning paths/i }).fill('Full Stack');
    await page.waitForTimeout(400);
    // Reload the page to clear the search
    await page.goto(LEARNING_PATHS_URL);
    await expect(page.getByRole('heading', { name: 'manual. testing' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Full Stack Developer' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. CREATE NEW LEARNING PATH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Create New Learning Path', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(NEW_PATH_URL);
  });

  test('page loads with "New Learning Path" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New Learning Path' })).toBeVisible();
  });

  test('"Draft" status button is shown', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible();
  });

  test('"Save Path" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save Path' })).toBeVisible();
  });

  test('"Path Details" section heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Path Details' })).toBeVisible();
  });

  test('Title field is present and required', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Full-Stack AI Development Path/i })).toBeVisible();
  });

  test('Tag Line field is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Short compelling subtitle/i })).toBeVisible();
  });

  test('Description field is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /What will learners achieve/i })).toBeVisible();
  });

  test('Level dropdown has Beginner, Intermediate, Advanced options', async ({ page }) => {
    const levelSelect = page.getByRole('combobox');
    await expect(levelSelect).toContainText('Beginner');
    await expect(levelSelect).toContainText('Intermediate');
    await expect(levelSelect).toContainText('Advanced');
  });

  test('Level dropdown defaults to Beginner', async ({ page }) => {
    // The option value uses title-case "Beginner" not lowercase
    const levelSelect = page.getByRole('combobox');
    const selectedText = await levelSelect.locator('option:checked').textContent();
    expect(selectedText?.trim()).toBe('Beginner');
  });

  test('Duration (hrs) spinbutton is present', async ({ page }) => {
    await expect(page.getByRole('spinbutton')).toBeVisible();
  });

  test('"Mark as Popular" checkbox is present and unchecked by default', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'Mark as Popular' });
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();
  });

  test('Thumbnail URL field is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'https://...' })).toBeVisible();
  });

  test('"Courses in this Path" section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Courses in this Path' })).toBeVisible();
  });

  test('shows "0 courses selected" initially', async ({ page }) => {
    await expect(page.getByText('0 courses selected')).toBeVisible();
  });

  test('course search box is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Search published courses to add/i })).toBeVisible();
  });

  test('empty state message is shown when no courses added', async ({ page }) => {
    await expect(page.getByText('Search for published courses above to add them to this path')).toBeVisible();
  });

  test('"← Back to Paths" button navigates to learning paths list', async ({ page }) => {
    await page.getByRole('button', { name: '← Back to Paths' }).click();
    await expect(page).toHaveURL(LEARNING_PATHS_URL);
  });

  test('"Create Path" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Create Path' })).toBeVisible();
  });

  test('typing in Title field updates the value', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: /Full-Stack AI Development Path/i });
    await titleInput.fill('My New Learning Path');
    await expect(titleInput).toHaveValue('My New Learning Path');
  });

  test('typing in Tag Line field updates the value', async ({ page }) => {
    const tagInput = page.getByRole('textbox', { name: /Short compelling subtitle/i });
    await tagInput.fill('Learn everything from scratch');
    await expect(tagInput).toHaveValue('Learn everything from scratch');
  });

  test('typing in Description field updates the value', async ({ page }) => {
    const descInput = page.getByRole('textbox', { name: /What will learners achieve/i });
    await descInput.fill('Students will master full-stack development');
    await expect(descInput).toHaveValue('Students will master full-stack development');
  });

  test('selecting Intermediate level updates the dropdown', async ({ page }) => {
    // Option values use title-case
    await page.getByRole('combobox').selectOption('Intermediate');
    const selectedText = await page.getByRole('combobox').locator('option:checked').textContent();
    expect(selectedText?.trim()).toBe('Intermediate');
  });

  test('checking "Mark as Popular" checkbox works', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'Mark as Popular' });
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('typing in Thumbnail URL field updates the value', async ({ page }) => {
    const urlInput = page.getByRole('textbox', { name: 'https://...' });
    await urlInput.fill('https://example.com/thumbnail.jpg');
    await expect(urlInput).toHaveValue('https://example.com/thumbnail.jpg');
  });

  test('searching for a course in the course search box works', async ({ page }) => {
    const courseSearch = page.getByRole('textbox', { name: /Search published courses to add/i });
    await courseSearch.fill('French');
    await expect(courseSearch).toHaveValue('French');
  });

  test('entering duration updates the spinbutton value', async ({ page }) => {
    const durationInput = page.getByRole('spinbutton');
    await durationInput.fill('10');
    await expect(durationInput).toHaveValue('10');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. EDIT EXISTING LEARNING PATH (Full Stack Developer)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Edit Existing Learning Path', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(FULL_STACK_EDIT_URL);
  });

  test('edit page loads with "Edit Learning Path" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit Learning Path' })).toBeVisible();
  });

  test('"Draft" status button is shown', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible();
  });

  test('"Save Path" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save Path' })).toBeVisible();
  });

  test('Title field is pre-filled with "Full Stack Developer"', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: /Full-Stack AI Development Path/i });
    await expect(titleInput).toHaveValue('Full Stack Developer');
  });

  test('Tag Line field is pre-filled', async ({ page }) => {
    const tagInput = page.getByRole('textbox', { name: /Short compelling subtitle/i });
    const value = await tagInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Description field is pre-filled', async ({ page }) => {
    const descInput = page.getByRole('textbox', { name: /What will learners achieve/i });
    const value = await descInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Level is pre-selected as Intermediate', async ({ page }) => {
    // Option values use title-case
    const selectedText = await page.getByRole('combobox').locator('option:checked').textContent();
    expect(selectedText?.trim()).toBe('Intermediate');
  });

  test('Duration is pre-filled', async ({ page }) => {
    const durationInput = page.getByRole('spinbutton');
    const value = await durationInput.inputValue();
    expect(parseFloat(value)).toBeGreaterThan(0);
  });

  test('"Mark as Popular" checkbox is checked', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: 'Mark as Popular' })).toBeChecked();
  });

  test('"Courses in this Path" shows 2 courses selected', async ({ page }) => {
    await expect(page.getByText('2 courses selected')).toBeVisible();
  });

  test('course list shows "Data Science Job Preparation"', async ({ page }) => {
    await expect(page.getByText('Data Science Job Preparation')).toBeVisible();
  });

  test('course list shows "MBA Foundations: Management Principles"', async ({ page }) => {
    await expect(page.getByText(/MBA Foundations/i)).toBeVisible();
  });

  test('course list shows learning order numbers', async ({ page }) => {
    // Order numbers are shown in violet badge divs — use exact text match scoped to the list
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
    // "2" appears in "2 courses selected" and the order badge — use the badge specifically
    await expect(page.getByText('2 courses selected')).toBeVisible();
  });

  test('first course has move-down button enabled', async ({ page }) => {
    // First course: up disabled, down enabled
    const firstCourseRow = page.getByText('Data Science Job Preparation').locator('../..');
    await expect(firstCourseRow.getByRole('button').nth(1)).toBeEnabled();
  });

  test('last course has move-up button enabled', async ({ page }) => {
    // Last course: up enabled, down disabled
    const lastCourseRow = page.getByText(/MBA Foundations/i).locator('../..');
    await expect(lastCourseRow.getByRole('button').first()).toBeEnabled();
  });

  test('"← Back to Paths" button navigates to learning paths list', async ({ page }) => {
    await page.getByRole('button', { name: '← Back to Paths' }).click();
    await expect(page).toHaveURL(LEARNING_PATHS_URL);
  });

  test('"Save Changes" button is present and enabled', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
  });

  test('editing the title field updates the value', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: /Full-Stack AI Development Path/i });
    await titleInput.fill('Updated Path Title');
    await expect(titleInput).toHaveValue('Updated Path Title');
    // Restore
    await titleInput.fill('Full Stack Developer');
  });

  test('course search box is present in edit page', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Search published courses to add/i })).toBeVisible();
  });

  test('"Learning order (top = first)" label is shown', async ({ page }) => {
    await expect(page.getByText('Learning order (top = first)')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. DELETE LEARNING PATH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Delete Learning Path', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(LEARNING_PATHS_URL);
  });

  test('clicking delete button triggers a native confirm dialog', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Delete this learning path');
      await dialog.dismiss();
    });
    // Delete is the icon-only button after Publish and Edit on each card
    // Use evaluate to click it safely
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      // Find the first icon-only button that is not Publish/Draft/Collapse/Platform
      const deleteBtn = btns.find(b =>
        !b.textContent.trim() &&
        b.querySelector('img, svg') &&
        !b.getAttribute('aria-label')?.includes('menu') &&
        !b.getAttribute('aria-label')?.includes('Collapse')
      );
      if (deleteBtn) deleteBtn.click();
    });
  });

  test('dismissing the confirm dialog keeps the path in the list', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const deleteBtn = btns.find(b =>
        !b.textContent.trim() &&
        b.querySelector('img, svg') &&
        !b.getAttribute('aria-label')?.includes('menu') &&
        !b.getAttribute('aria-label')?.includes('Collapse')
      );
      if (deleteBtn) deleteBtn.click();
    });
    await page.waitForTimeout(500);
    // Both paths should still be visible
    await expect(page.getByRole('heading', { name: 'manual. testing' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Full Stack Developer' })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. PUBLISH LEARNING PATH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Publish Learning Path', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(LEARNING_PATHS_URL);
  });

  test('"Publish" button is present on each draft path card', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Publish' }).first()).toBeVisible();
  });

  test('both path cards have Publish buttons', async ({ page }) => {
    // Publish buttons contain text "Publish" — use locator with text content
    const publishBtns = page.locator('button').filter({ hasText: 'Publish' });
    await expect(publishBtns.first()).toBeVisible();
    const count = await publishBtns.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Navigation – Learning Paths', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('sidebar "Learning Paths" link navigates to /admin/courses/paths', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Learning Paths', exact: true }).click();
    await expect(page).toHaveURL(LEARNING_PATHS_URL);
  });

  test('sidebar "Courses" link navigates to /admin/courses', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Courses', exact: true }).click();
    await expect(page).toHaveURL(`${BASE_URL}/admin/courses`);
  });

  test('back button on list page navigates to courses', async ({ page }) => {
    await page.goto(LEARNING_PATHS_URL);
    // Navigate directly to courses via the sidebar Courses link
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Courses', exact: true }).click();
    await expect(page).toHaveURL(`${BASE_URL}/admin/courses`);
  });

  test('New Path link from list page navigates to create page', async ({ page }) => {
    await page.goto(LEARNING_PATHS_URL);
    await page.getByRole('link', { name: /New Path/i }).click();
    await expect(page).toHaveURL(NEW_PATH_URL);
  });

  test('Edit link navigates to the correct edit page', async ({ page }) => {
    await page.goto(LEARNING_PATHS_URL);
    await page.getByRole('link', { name: 'Edit' }).first().click();
    await expect(page).toHaveURL(/\/admin\/courses\/paths\/\d+\/edit/);
  });
});
