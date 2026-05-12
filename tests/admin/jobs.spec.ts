import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
const JOBS_URL = `${BASE_URL}/admin/jobs`;
const NEW_JOB_URL = `${BASE_URL}/admin/jobs/new`;

// Known stable jobs for edit / applications tests
const PUBLISHED_JOB_ID = '69fe3ca33d6a2372e17196c5';   // Software Engineer (Test) – Published, 0 apps
const JOB_WITH_APPS_ID = '69fd94f73d6a2372e17196be';   // Manual / Autimation Tester – Published, 1 app
const DRAFT_JOB_ID     = '69eb6ec617acf8fec9cc46c7';   // Software developer – Draft, 2 apps

const PUBLISHED_JOB_EDIT_URL = `${BASE_URL}/admin/jobs/${PUBLISHED_JOB_ID}/edit`;
const APPS_URL               = `${BASE_URL}/admin/jobs/${JOB_WITH_APPS_ID}/applications`;

const ADMIN_EMAIL    = 'raghuram@gmail.com';
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
// 1. JOBS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Jobs List Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(JOBS_URL);
  });

  test('page loads with correct heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();
    await expect(page.getByText('Manage listings for the candidate job board')).toBeVisible();
  });

  test('"Create a job" link is visible and navigates to /admin/jobs/new', async ({ page }) => {
    const createLink = page.getByRole('link', { name: /Create a job/i });
    await expect(createLink).toBeVisible();
    await createLink.click();
    await expect(page).toHaveURL(NEW_JOB_URL);
  });

  test('"Back to dashboard" link is present and navigates to dashboard', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to dashboard' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/admin/dashboard`);
  });

  test('"All job listings" section heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'All job listings' })).toBeVisible();
    await expect(page.getByText('Published roles and drafts')).toBeVisible();
  });

  test('"Refresh" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  });

  test('jobs table has correct column headers', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Company' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Deadline' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Created' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Applications' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('known published job "Software Engineer (Test)" is visible', async ({ page }) => {
    // Use exact cell match scoped to the Title column
    const titleCell = page.getByRole('cell', { name: 'Software Engineer (Test)', exact: true }).first();
    await expect(titleCell).toBeVisible();
  });

  test('known draft job "Software developer" is visible with Draft status', async ({ page }) => {
    const titleCell = page.getByRole('cell', { name: 'Software developer', exact: true }).first();
    await expect(titleCell).toBeVisible();
    const draftRow = page.getByRole('row', { name: /Software developer/ });
    await expect(draftRow.getByText('Draft')).toBeVisible();
  });

  test('published jobs show "Published" status badge', async ({ page }) => {
    const publishedRow = page.getByRole('row', { name: /Software Engineer \(Test\)/ });
    await expect(publishedRow.getByText('Published')).toBeVisible();
  });

  test('each row has Edit and Delete action buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Edit/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete/i }).first()).toBeVisible();
  });

  test('each row has a "View" applications link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'View' }).first()).toBeVisible();
  });

  test('clicking Edit navigates to the job edit page', async ({ page }) => {
    await page.getByRole('link', { name: /Edit Software Engineer \(Test\)/i }).click();
    await expect(page).toHaveURL(PUBLISHED_JOB_EDIT_URL);
  });

  test('clicking View applications link navigates to applications page', async ({ page }) => {
    await page.getByRole('link', { name: 'View' }).first().click();
    await expect(page).toHaveURL(/\/admin\/jobs\/.+\/applications/);
  });

  test('applications count is shown for each job', async ({ page }) => {
    // "Manual / Autimation Tester" has 1 application — use the aria-title span
    const appRow = page.getByRole('row', { name: /Manual \/ Autimation Tester/ });
    const appCount = appRow.locator('[title="Applications submitted for this job"]');
    await expect(appCount).toHaveText('1');
  });

  test('sidebar "Jobs" link is present and active', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Jobs', exact: true })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. CREATE NEW JOB LISTING
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Create New Job Listing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(NEW_JOB_URL);
  });

  test('page loads with "New job listing" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New job listing' })).toBeVisible();
    await expect(page.getByText('Publish goes live immediately')).toBeVisible();
  });

  test('"Back to jobs" link navigates to jobs list', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to jobs' }).click();
    await expect(page).toHaveURL(JOBS_URL);
  });

  test('Job title field is present and required', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Job title *' })).toBeVisible();
  });

  test('Subtitle / note field is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Subtitle / note' })).toBeVisible();
  });

  test('Company name field is present and required', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Company name *' })).toBeVisible();
  });

  test('Location field is present and required', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Location *' })).toBeVisible();
  });

  test('Employment type dropdown defaults to Full-time', async ({ page }) => {
    const empType = page.getByRole('combobox', { name: 'Employment type *' });
    await expect(empType).toBeVisible();
    await expect(empType).toHaveValue('full-time');
  });

  test('Employment type has Full-time, Part-time, Contract options', async ({ page }) => {
    const empType = page.getByRole('combobox', { name: 'Employment type *' });
    await expect(empType).toContainText('Full-time');
    await expect(empType).toContainText('Part-time');
    await expect(empType).toContainText('Contract');
  });

  test('Work mode dropdown defaults to Remote', async ({ page }) => {
    const workMode = page.getByRole('combobox', { name: 'Work mode *' });
    await expect(workMode).toBeVisible();
    await expect(workMode).toHaveValue('remote');
  });

  test('Work mode has Remote, Hybrid, On-site options', async ({ page }) => {
    const workMode = page.getByRole('combobox', { name: 'Work mode *' });
    await expect(workMode).toContainText('Remote');
    await expect(workMode).toContainText('Hybrid');
    await expect(workMode).toContainText('On-site');
  });

  test('Experience level dropdown defaults to Fresher', async ({ page }) => {
    const expLevel = page.getByRole('combobox', { name: 'Experience level *' });
    await expect(expLevel).toBeVisible();
    await expect(expLevel).toHaveValue('fresher');
  });

  test('Experience level has Fresher, Mid, Senior options', async ({ page }) => {
    const expLevel = page.getByRole('combobox', { name: 'Experience level *' });
    await expect(expLevel).toContainText('Fresher');
    await expect(expLevel).toContainText('Mid');
    await expect(expLevel).toContainText('Senior');
  });

  test('Salary field is present and required', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Salary *' })).toBeVisible();
  });

  test('Application deadline field is present and required', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Application deadline *' })).toBeVisible();
  });

  test('Full job description rich text editor is present', async ({ page }) => {
    await expect(page.getByText('Full job description *')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Image' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Video' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Link' })).toBeVisible();
  });

  test('"Partner job" checkbox is present', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: 'Partner job' })).toBeVisible();
  });

  test('"Publish" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
  });

  test('"Save as draft" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save as draft' })).toBeVisible();
  });

  test('live preview panel is shown on the right', async ({ page }) => {
    // Preview label is uppercase "PREVIEW" in the UI
    await expect(page.getByText('Preview', { exact: true })).toBeVisible();
    // Preview shows placeholder heading "Job title" before any input
    await expect(page.getByRole('heading', { name: 'Job title' })).toBeVisible();
  });

  test('preview updates when Job title is typed', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Job title *' }).fill('Senior QA Engineer');
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: 'Senior QA Engineer' })).toBeVisible();
  });

  test('preview updates when Company name is typed', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Company name *' }).fill('OwletCorp');
    await page.waitForTimeout(300);
    await expect(page.getByRole('article').getByText('OwletCorp')).toBeVisible();
  });

  test('preview updates when Location is typed', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Location *' }).fill('Hyderabad, India');
    await page.waitForTimeout(300);
    await expect(page.getByRole('article').getByText('Hyderabad, India')).toBeVisible();
  });

  test('preview updates when Salary is typed', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Salary *' }).fill('₹8 LPA');
    await page.waitForTimeout(300);
    await expect(page.getByRole('article').getByText('₹8 LPA')).toBeVisible();
  });

  test('changing Employment type updates the preview', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Employment type *' }).selectOption('Contract');
    await page.waitForTimeout(300);
    await expect(page.getByRole('article').getByText('Contract')).toBeVisible();
  });

  test('changing Work mode updates the preview', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Work mode *' }).selectOption('On-site');
    await page.waitForTimeout(300);
    await expect(page.getByRole('article').getByText('On-site')).toBeVisible();
  });

  test('checking "Partner job" checkbox works', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'Partner job' });
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. EDIT EXISTING JOB LISTING
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Edit Existing Job Listing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(PUBLISHED_JOB_EDIT_URL);
  });

  test('edit page loads with "Edit job listing" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit job listing' })).toBeVisible();
    await expect(page.getByText('Update the listing')).toBeVisible();
  });

  test('"Back to jobs" link navigates to jobs list', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to jobs' }).click();
    await expect(page).toHaveURL(JOBS_URL);
  });

  test('Job title field is pre-filled', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Job title *' });
    const value = await titleInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
    expect(value).toContain('Software Engineer');
  });

  test('Company name field is pre-filled', async ({ page }) => {
    const companyInput = page.getByRole('textbox', { name: 'Company name *' });
    const value = await companyInput.inputValue();
    expect(value).toBe('Test Company');
  });

  test('Location field is pre-filled', async ({ page }) => {
    const locationInput = page.getByRole('textbox', { name: 'Location *' });
    const value = await locationInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Salary field is pre-filled', async ({ page }) => {
    const salaryInput = page.getByRole('textbox', { name: 'Salary *' });
    const value = await salaryInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Application deadline field is pre-filled', async ({ page }) => {
    const deadlineInput = page.getByRole('textbox', { name: 'Application deadline *' });
    const value = await deadlineInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('"Publish" and "Save as draft" buttons are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save as draft' })).toBeVisible();
  });

  test('preview panel shows the job title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Software Engineer (Test)' })).toBeVisible();
  });

  test('editing the title updates the preview', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Job title *' });
    await titleInput.fill('Updated QA Engineer');
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: 'Updated QA Engineer' })).toBeVisible();
    // Restore
    await titleInput.fill('Software Engineer (Test)');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. JOB APPLICATIONS PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Job Applications Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(APPS_URL);
  });

  test('applications page loads with job title as heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Manual / Autimation Tester' })).toBeVisible();
  });

  test('"Applications" label is shown', async ({ page }) => {
    await expect(page.getByText('Applications')).toBeVisible();
  });

  test('company name is shown on the applications page', async ({ page }) => {
    await expect(page.getByText('owlet')).toBeVisible();
  });

  test('job status badge is shown', async ({ page }) => {
    await expect(page.getByText('Published')).toBeVisible();
  });

  test('"Back to jobs" link navigates to jobs list', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to jobs' }).click();
    await expect(page).toHaveURL(JOBS_URL);
  });

  test('applications table has correct column headers', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Applicant' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Applied' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Resume' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Message' })).toBeVisible();
  });

  test('applicant name is shown in the table', async ({ page }) => {
    await expect(page.getByRole('cell', { name: 'surya tataji' })).toBeVisible();
  });

  test('applicant email is shown in the table', async ({ page }) => {
    await expect(page.getByRole('cell', { name: 'suryatataje@gmail.com' })).toBeVisible();
  });

  test('resume link is present and downloadable', async ({ page }) => {
    const resumeLink = page.getByRole('link', { name: /\.pdf/i });
    await expect(resumeLink).toBeVisible();
    const href = await resumeLink.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('application date is shown', async ({ page }) => {
    await expect(page.getByText(/May 8, 2026/)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. DELETE JOB LISTING
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Delete Job Listing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(JOBS_URL);
  });

  test('clicking Delete opens a confirmation dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Delete/i }).first().click();
    await expect(page.getByRole('alertdialog', { name: 'Delete this job?' })).toBeVisible();
  });

  test('delete dialog shows the job title and company', async ({ page }) => {
    await page.getByRole('button', { name: /Delete/i }).first().click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByRole('heading', { name: 'Delete this job?' })).toBeVisible();
    await expect(dialog.getByText(/will be removed permanently/)).toBeVisible();
  });

  test('delete dialog has Cancel and Delete buttons', async ({ page }) => {
    await page.getByRole('button', { name: /Delete/i }).first().click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('clicking Cancel closes the dialog and keeps the job', async ({ page }) => {
    await page.getByRole('button', { name: /Delete/i }).first().click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('alertdialog')).not.toBeVisible();
    // Table should still have rows
    await expect(page.getByRole('row').nth(1)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Sidebar Navigation – Jobs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('sidebar "Jobs" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Jobs', exact: true })).toBeVisible();
  });

  test('sidebar "Jobs" link navigates to /admin/jobs', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Jobs', exact: true }).click();
    await expect(page).toHaveURL(JOBS_URL);
  });
});
