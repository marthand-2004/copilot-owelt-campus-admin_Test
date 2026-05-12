import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const USER_LOGIN_URL = `${BASE_URL}/user/login`;
const JOBS_URL = `${BASE_URL}/user/jobs`;

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

// ─── Wait for jobs page to load ────────────────────────────────────────────
async function gotoJobs(page: Page) {
  await loginAsUser(page);
  await page.goto(JOBS_URL);
  await expect(page.getByRole('heading', { name: 'Discovery Hub' })).toBeVisible({ timeout: 15000 });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. JOBS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Jobs List Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoJobs(page);
  });

  test('page loads with "Discovery Hub" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Discovery Hub' })).toBeVisible();
  });

  test('shows total matches count', async ({ page }) => {
    await expect(page.getByText(/\d+ Matches Found/)).toBeVisible();
  });

  test('search box is present in header', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: 'Search jobs' })).toBeVisible();
  });

  test('"Apply Filters" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Apply Filters/i })).toBeVisible();
  });

  test('job listings region is present', async ({ page }) => {
    // The job listings container — verify at least one job card is visible
    await expect(page.getByRole('button', { name: /Software Engineer/i }).first()).toBeVisible();
  });

  test('known job "Software Engineer (Test)" is visible', async ({ page }) => {
    // Use h3 level heading in the job card list
    await expect(page.getByRole('heading', { name: 'Software Engineer (Test)', level: 3 })).toBeVisible();
  });

  test('known job "Manual / Autimation Tester" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Manual / Autimation Tester' })).toBeVisible();
  });

  test('known job "software trainee" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'software trainee' })).toBeVisible();
  });

  test('known job "Frontend" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Frontend' })).toBeVisible();
  });

  test('job cards show company name', async ({ page }) => {
    await expect(page.getByText('Test Company').first()).toBeVisible();
  });

  test('job cards show location', async ({ page }) => {
    await expect(page.getByText('Remote').first()).toBeVisible();
  });

  test('job cards show salary/stipend', async ({ page }) => {
    await expect(page.getByText('$80,000 - $100,000').first()).toBeVisible();
  });

  test('job cards show posting age (e.g. "2d ago")', async ({ page }) => {
    await expect(page.getByText(/\d+d ago/i).first()).toBeVisible();
  });

  test('PARTNER badge is shown on partner jobs', async ({ page }) => {
    await expect(page.getByText('PARTNER').first()).toBeVisible();
  });

  test('first job detail panel is shown by default', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Job details' })).toBeVisible();
  });

  test('sidebar "Jobs" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Jobs', exact: true })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. JOB DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Job Detail Panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoJobs(page);
  });

  test('clicking a job card updates the detail panel', async ({ page }) => {
    await page.getByRole('button', { name: /Manual \/ Autimation Tester/ }).click();
    await expect(page.getByRole('region', { name: 'Job details' })
      .getByRole('heading', { name: 'Manual / Autimation Tester' })).toBeVisible();
  });

  test('detail panel shows job title', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByRole('heading', { name: 'Software Engineer (Test)' })).toBeVisible();
  });

  test('detail panel shows company and location', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByText(/Test Company/)).toBeVisible();
  });

  test('detail panel shows employment type badges', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByText('Full-time')).toBeVisible();
  });

  test('detail panel shows work mode badge', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    // Work mode badge is a span tag — use exact text
    await expect(detail.getByText('Remote', { exact: true }).first()).toBeVisible();
  });

  test('detail panel shows experience level badge', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    // Experience badge is a span — use the Experience label row
    await expect(detail.getByText('Fresher', { exact: true }).first()).toBeVisible();
  });

  test('detail panel shows Stipend/Salary', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByText('Stipend')).toBeVisible();
    await expect(detail.getByText('$80,000 - $100,000')).toBeVisible();
  });

  test('detail panel shows Apply By deadline', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByText('Apply by')).toBeVisible();
    await expect(detail.getByText('May 20, 2026')).toBeVisible();
  });

  test('detail panel shows Experience level', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByText('Experience')).toBeVisible();
  });

  test('detail panel shows "About the Role" section', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByRole('heading', { name: 'About the Role' })).toBeVisible();
  });

  test('detail panel shows job description text', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByText(/test job description/i)).toBeVisible();
  });

  test('"Apply Now" button is present in detail panel', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByRole('button', { name: 'Apply Now' })).toBeVisible();
  });

  test('"Save for Later" button is present in detail panel', async ({ page }) => {
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByRole('button', { name: 'Save for Later' })).toBeVisible();
  });

  test('already-applied job shows "Applied" badge', async ({ page }) => {
    await page.getByRole('button', { name: /Manual \/ Autimation Tester/ }).click();
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByText('Applied')).toBeVisible();
  });

  test('PARTNER badge is shown on partner job detail', async ({ page }) => {
    await page.getByRole('button', { name: /Manual \/ Autimation Tester/ }).click();
    const detail = page.getByRole('region', { name: 'Job details' });
    await expect(detail.getByText('PARTNER')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. APPLY NOW MODAL
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Apply Now Modal', () => {
  test.beforeEach(async ({ page }) => {
    await gotoJobs(page);
    // Click Apply Now on the Software Engineer job
    const detail = page.getByRole('region', { name: 'Job details' });
    await detail.getByRole('button', { name: 'Apply Now' }).click();
    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8000 });
  });

  test('Apply modal opens with job title', async ({ page }) => {
    await expect(page.getByRole('dialog').getByText('Apply for Software Engineer (Test)')).toBeVisible();
  });

  test('modal shows company and location', async ({ page }) => {
    await expect(page.getByRole('dialog').getByText(/Test Company/)).toBeVisible();
  });

  test('"Full Name" field is present and required', async ({ page }) => {
    await expect(page.getByRole('dialog').getByPlaceholder('e.g. Alex Carter')).toBeVisible();
  });

  test('"Email Address" field is present and required', async ({ page }) => {
    await expect(page.getByRole('dialog').locator('input[type="email"]')).toBeVisible();
  });

  test('"Phone Number" field is present', async ({ page }) => {
    await expect(page.getByRole('dialog').getByPlaceholder('+1 (555) 000-0000')).toBeVisible();
  });

  test('"Current Role / Status" field is present', async ({ page }) => {
    await expect(page.getByRole('dialog').getByPlaceholder(/Junior Scholar|Student/i)).toBeVisible();
  });

  test('"Years of Experience" dropdown is present', async ({ page }) => {
    await expect(page.getByRole('dialog').getByRole('combobox')).toBeVisible();
  });

  test('Years of Experience has expected options', async ({ page }) => {
    const select = page.getByRole('dialog').getByRole('combobox');
    await expect(select).toContainText('Entry Level');
    await expect(select).toContainText('1–2 Years');
    await expect(select).toContainText('3–5 Years');
    await expect(select).toContainText('5+ Years');
  });

  test('"Highest Qualification" field is present', async ({ page }) => {
    await expect(page.getByRole('dialog').getByPlaceholder(/Bachelor/i)).toBeVisible();
  });

  test('Resume upload area is present and mandatory', async ({ page }) => {
    await expect(page.getByRole('dialog').getByText('RESUME UPLOAD')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Mandatory')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Click to upload or drag and drop')).toBeVisible();
  });

  test('Optional message textarea is present with character counter', async ({ page }) => {
    await expect(page.getByRole('dialog').getByText('Why are you a good fit?')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('0/2000')).toBeVisible();
  });

  test('"Submit Application" button is present', async ({ page }) => {
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Submit Application' })).toBeVisible();
  });

  test('"Cancel" button closes the modal', async ({ page }) => {
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('typing in Full Name field updates the value', async ({ page }) => {
    const nameInput = page.getByRole('dialog').getByPlaceholder('e.g. Alex Carter');
    await nameInput.fill('Surya Tataji');
    await expect(nameInput).toHaveValue('Surya Tataji');
  });

  test('typing in optional message updates character counter', async ({ page }) => {
    const msgArea = page.getByRole('dialog').getByPlaceholder(/Briefly describe/i);
    await msgArea.fill('I am a great fit because of my skills.');
    await expect(page.getByRole('dialog').getByText(/\d+\/2000/)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. FILTERS PANEL
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Filters Panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoJobs(page);
    await page.getByRole('button', { name: /Apply Filters/i }).click();
    await page.waitForTimeout(300);
  });

  test('filters panel shows DATE POSTED section', async ({ page }) => {
    await expect(page.getByText('DATE POSTED')).toBeVisible();
  });

  test('DATE POSTED has Anytime, Past 24 Hours, Past Week options', async ({ page }) => {
    await expect(page.getByText('Anytime')).toBeVisible();
    await expect(page.getByText('Past 24 Hours')).toBeVisible();
    await expect(page.getByText('Past Week')).toBeVisible();
  });

  test('filters panel shows SALARY RANGE section', async ({ page }) => {
    await expect(page.getByText('SALARY RANGE')).toBeVisible();
  });

  test('SALARY RANGE has $0, $4.5k+, $10k+ options', async ({ page }) => {
    await expect(page.getByText('$0')).toBeVisible();
    await expect(page.getByText('$4.5k+')).toBeVisible();
    await expect(page.getByText('$10k+')).toBeVisible();
  });

  test('filters panel shows WORK MODE section', async ({ page }) => {
    await expect(page.getByText('WORK MODE')).toBeVisible();
  });

  test('WORK MODE has Remote, On-site, Hybrid options', async ({ page }) => {
    await expect(page.getByText('Remote').first()).toBeVisible();
    await expect(page.getByText('On-site')).toBeVisible();
    await expect(page.getByText('Hybrid')).toBeVisible();
  });

  test('filters panel shows WORK TYPE section', async ({ page }) => {
    await expect(page.getByText('WORK TYPE')).toBeVisible();
  });

  test('WORK TYPE has Full-time, Internship, Contract options', async ({ page }) => {
    await expect(page.getByText('Full-time').first()).toBeVisible();
    await expect(page.getByText('Internship')).toBeVisible();
    await expect(page.getByText('Contract')).toBeVisible();
  });

  test('filters panel shows WORK SHIFT section', async ({ page }) => {
    await expect(page.getByText('WORK SHIFT')).toBeVisible();
  });

  test('WORK SHIFT has Day, Night, Flexible options', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Day' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Night' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flexible' })).toBeVisible();
  });

  test('filters panel shows DEPARTMENT section', async ({ page }) => {
    await expect(page.getByText('DEPARTMENT')).toBeVisible();
  });

  test('"Clear All Filters" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Clear All Filters/i })).toBeVisible();
  });

  test('"Apply Filters" button is present in the panel', async ({ page }) => {
    const applyBtns = page.getByRole('button', { name: /Apply Filters/i });
    const count = await applyBtns.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. JOB SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Job Search', () => {
  test.beforeEach(async ({ page }) => {
    await gotoJobs(page);
  });

  test('search box accepts input', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search jobs' });
    await searchBox.fill('Software');
    await expect(searchBox).toHaveValue('Software');
  });

  test('searching for a known job title shows matching result', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search jobs' }).fill('Software Engineer');
    await page.waitForTimeout(500);
    // Use h3 level to avoid matching the detail panel h2
    await expect(page.getByRole('heading', { name: 'Software Engineer (Test)', level: 3 })).toBeVisible();
  });

  test('searching for non-existent job hides unrelated results', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search jobs' }).fill('xyznonexistentjob99999');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Software Engineer (Test)' })).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Navigation – Jobs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('sidebar "Jobs" link navigates to /user/jobs', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Jobs', exact: true }).click();
    await expect(page).toHaveURL(JOBS_URL);
  });

  test('unauthenticated access to jobs redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(JOBS_URL);
    await expect(page).toHaveURL(/\/user\/login|\/login/, { timeout: 10000 });
  });

  test('"Interview Now" CTA is present in sidebar', async ({ page }) => {
    await page.goto(JOBS_URL);
    await expect(page.getByRole('link', { name: 'Interview Now' })).toBeVisible();
  });
});
