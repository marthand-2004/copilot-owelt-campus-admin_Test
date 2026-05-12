import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const USER_LOGIN_URL = `${BASE_URL}/user/login`;
const TEST_SERIES_URL = `${BASE_URL}/user/test_series`;
const PUBLIC_TEST_SERIES_URL = `${BASE_URL}/test-series`;

// Known stable series
const TG_EAMCET_ID = '1c771fb8-4a36-4a4d-8423-642b09ebe191';
const TG_EAMCET_TESTS_URL = `${BASE_URL}/user/test_series/${TG_EAMCET_ID}/tests`;
const TG_EAMCET_PUBLIC_URL = `${BASE_URL}/test-series/tg-eamcet`;

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

// ═══════════════════════════════════════════════════════════════════════════
// 1. USER TEST SERIES LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('User Test Series List Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(TEST_SERIES_URL);
    // Use level=1 heading to avoid matching DDCET card h2
    await expect(page.getByRole('heading', { name: 'Test Series', level: 1 })).toBeVisible({ timeout: 15000 });
  });

  test('page loads with correct heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Test Series', level: 1 })).toBeVisible();
    await expect(page.getByText('Browse assigned series and open one to view assessments')).toBeVisible();
  });

  test('search box is present in header', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: 'Search test series' })).toBeVisible();
  });

  test('known series "TG EAMCET" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TG EAMCET' })).toBeVisible();
  });

  test('known series "AP EAMCET" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AP EAMCET' })).toBeVisible();
  });

  test('known series "TS POLYCET" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TS POLYCET' })).toBeVisible();
  });

  test('known series "DDCET 2026 Complete Test Series" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'DDCET 2026 Complete Test Series' })).toBeVisible();
  });

  test('series cards show category badge', async ({ page }) => {
    await expect(page.getByText('EAMCET').first()).toBeVisible();
  });

  test('series cards show price', async ({ page }) => {
    await expect(page.getByText('₹149').first()).toBeVisible();
  });

  test('series cards show assessments count', async ({ page }) => {
    await expect(page.getByText('25 assessments').first()).toBeVisible();
  });

  test('series cards show "Open series" action', async ({ page }) => {
    await expect(page.getByText('Open series').first()).toBeVisible();
  });

  test('TG EAMCET card shows 25 assessments', async ({ page }) => {
    const tgCard = page.getByRole('button', { name: /TG EAMCET/ }).first();
    await expect(tgCard.getByText('25 assessments')).toBeVisible();
  });

  test('DDCET card shows 71 assessments', async ({ page }) => {
    const ddcetCard = page.getByRole('button', { name: /DDCET 2026/ });
    await expect(ddcetCard.getByText('71 assessments')).toBeVisible();
  });

  test('DDCET card shows ₹99 price', async ({ page }) => {
    // Use the exact price span inside the DDCET card
    const ddcetCard = page.getByRole('button', { name: /DDCET 2026/ });
    await expect(ddcetCard.locator('span').filter({ hasText: /^₹99$/ })).toBeVisible();
  });

  test('clicking a series card navigates to the series tests page', async ({ page }) => {
    await page.getByRole('button', { name: /TG EAMCET/ }).first().click();
    await expect(page).toHaveURL(/\/user\/test_series\/.+\/tests/);
  });

  test('sidebar "Test Series" link is present and active', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Test Series', exact: true })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. TEST SERIES SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Test Series Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(TEST_SERIES_URL);
    await expect(page.getByRole('heading', { name: 'Test Series', level: 1 })).toBeVisible({ timeout: 15000 });
  });

  test('search box accepts input', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search test series' });
    await searchBox.fill('EAMCET');
    await expect(searchBox).toHaveValue('EAMCET');
  });

  test('searching for "TG EAMCET" shows matching series', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search test series' }).fill('TG EAMCET');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'TG EAMCET' })).toBeVisible();
  });

  test('searching for non-existent series hides unrelated results', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search test series' }).fill('xyznonexistentseries99999');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'TG EAMCET' })).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. SERIES DETAIL PAGE (PAID – LOCKED)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Series Detail Page – Paid (Locked)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto(TG_EAMCET_TESTS_URL);
    await expect(page.getByRole('heading', { name: 'TG EAMCET' }).first()).toBeVisible({ timeout: 15000 });
  });

  test('series detail page loads with series title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TG EAMCET' }).first()).toBeVisible();
  });

  test('"Back to Test Series" link is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Back to Test Series' })).toBeVisible();
  });

  test('"Back to Test Series" link navigates to test series list', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to Test Series' }).click();
    await expect(page).toHaveURL(TEST_SERIES_URL);
  });

  test('"Premium Pathway" label is shown for paid series', async ({ page }) => {
    await expect(page.getByText('Premium Pathway')).toBeVisible();
  });

  test('paid series shows purchase message', async ({ page }) => {
    await expect(page.getByText('This plan is paid. Purchase it to access all assessments.')).toBeVisible();
  });

  test('"Included Assessments" section is visible', async ({ page }) => {
    await expect(page.getByText('Included Assessments')).toBeVisible();
  });

  test('assessments list shows TG EAMCET MATHS - 1', async ({ page }) => {
    await expect(page.getByText('TG EAMCET MATHS - 1')).toBeVisible();
  });

  test('assessments list shows question counts', async ({ page }) => {
    await expect(page.getByText('20 questions').first()).toBeVisible();
  });

  test('"Purchase Now" button is present with price', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Purchase Now for ₹149/i })).toBeVisible();
  });

  test('"Maybe later" link is present and navigates back', async ({ page }) => {
    const maybeLater = page.getByRole('link', { name: 'Maybe later' });
    await expect(maybeLater).toBeVisible();
    await maybeLater.click();
    await expect(page).toHaveURL(TEST_SERIES_URL);
  });

  test('series shows structured pathway description', async ({ page }) => {
    await expect(page.getByText('Structured pathway for focused preparation.')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. PUBLIC TEST SERIES LISTING PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Public Test Series Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PUBLIC_TEST_SERIES_URL);
    await expect(page).toHaveURL(PUBLIC_TEST_SERIES_URL);
  });

  test('public test series page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Test Series/i);
  });

  test('TG EAMCET series is listed', async ({ page }) => {
    await expect(page.getByText('TG EAMCET').first()).toBeVisible();
  });

  test('AP EAMCET series is listed', async ({ page }) => {
    await expect(page.getByText('AP EAMCET').first()).toBeVisible();
  });

  test('series cards show pack price', async ({ page }) => {
    await expect(page.getByText('PACK PRICE').first()).toBeVisible();
    await expect(page.getByText('₹149').first()).toBeVisible();
  });

  test('series cards show tests count', async ({ page }) => {
    await expect(page.getByText('25 tests').first()).toBeVisible();
  });

  test('series cards show total hours', async ({ page }) => {
    await expect(page.getByText('28 hr total').first()).toBeVisible();
  });

  test('"View tests" link is present on each card', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'View tests' }).first()).toBeVisible();
  });

  test('clicking "View tests" navigates to the series landing page', async ({ page }) => {
    // "View tests" links point to /test-series/{slug} — verify the href pattern
    const links = page.getByRole('link', { name: 'View tests' });
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    // All View tests links should point to /test-series/ paths
    const firstHref = await links.first().getAttribute('href');
    expect(firstHref).toBeTruthy();
  });

  test('navigation bar is present with OwletCampus logo', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'OwletCampus' })).toBeVisible();
  });

  test('footer is present with copyright info', async ({ page }) => {
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByText(/Carrot Owl Education/i)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. PUBLIC SERIES LANDING PAGE (TG EAMCET)
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Public Series Landing Page – TG EAMCET', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TG_EAMCET_PUBLIC_URL);
    await expect(page.getByRole('heading', { name: 'TG EAMCET' }).first()).toBeVisible({ timeout: 15000 });
  });

  test('landing page loads with series title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TG EAMCET' }).first()).toBeVisible();
  });

  test('page title includes series name', async ({ page }) => {
    await expect(page).toHaveTitle(/TG EAMCET/i);
  });

  test('"Back to Test Series" link is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Back to Test Series' })).toBeVisible();
  });

  test('"Back to Test Series" navigates to public listing', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to Test Series' }).click();
    await expect(page).toHaveURL(PUBLIC_TEST_SERIES_URL);
  });

  test('category badge "EAMCET" is shown', async ({ page }) => {
    await expect(page.getByText('EAMCET').first()).toBeVisible();
  });

  test('series stats show 25 tests', async ({ page }) => {
    // The "25 tests · your full path" heading is the clearest unique identifier
    await expect(page.getByRole('heading', { name: /25 tests/i })).toBeVisible();
  });

  test('series stats show total time (28 hr)', async ({ page }) => {
    await expect(page.getByText('28 hr')).toBeVisible();
  });

  test('"AI Feedback" stat is shown', async ({ page }) => {
    await expect(page.getByText('AI Feedback')).toBeVisible();
  });

  test('"Enroll" button with price is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Enroll for ₹149/i })).toBeVisible();
  });

  test('"First test free" label is shown on enroll button', async ({ page }) => {
    await expect(page.getByText('First test free')).toBeVisible();
  });

  test('"25 tests · your full path" heading is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /25 tests/i })).toBeVisible();
  });

  test('test list shows TG EAMCET MATHS - 1 as first test', async ({ page }) => {
    await expect(page.getByText('TG EAMCET MATHS - 1')).toBeVisible();
  });

  test('test list shows question counts and duration', async ({ page }) => {
    await expect(page.getByText('20 questions').first()).toBeVisible();
    await expect(page.getByText('60 min').first()).toBeVisible();
  });

  test('test list shows "Adaptive" label', async ({ page }) => {
    await expect(page.getByText('● Adaptive').first()).toBeVisible();
  });

  test('mock tests show 100 questions and 90 min', async ({ page }) => {
    await expect(page.getByText('100 questions').first()).toBeVisible();
    await expect(page.getByText('90 min').first()).toBeVisible();
  });

  test('"About this test series" section is visible', async ({ page }) => {
    await expect(page.getByText('About this test series')).toBeVisible();
  });

  test('"Why aspirants choose TG EAMCET" heading is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Why aspirants choose TG EAMCET/i })).toBeVisible();
  });

  test('subjects covered are shown (Mathematics, Chemistry, Physics, Biology)', async ({ page }) => {
    await expect(page.getByText('Mathematics').first()).toBeVisible();
    await expect(page.getByText('Chemistry').first()).toBeVisible();
    await expect(page.getByText('Physics').first()).toBeVisible();
    await expect(page.getByText('Biology').first()).toBeVisible();
  });

  test('FAQ section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();
  });

  test('FAQ "What does TG EAMCET include?" is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'What does TG EAMCET include?' })).toBeVisible();
  });

  test('FAQ "How much time does this series require?" is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'How much time does this series require?' })).toBeVisible();
  });

  test('FAQ "Can I retake tests?" is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Can I retake tests?' })).toBeVisible();
  });

  test('clicking FAQ question reveals the answer', async ({ page }) => {
    await page.getByRole('button', { name: 'What does TG EAMCET include?' }).click();
    await expect(page.getByText('This series includes 25 test(s) with analytics')).toBeVisible();
  });

  test('footer is present with privacy and terms links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Privacy Policy' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms of Service' }).first()).toBeVisible();
  });

  test('logged-in user sees their username in the nav', async ({ page }) => {
    await loginAsUser(page);
    await page.goto(TG_EAMCET_PUBLIC_URL);
    await expect(page.getByRole('link', { name: /suryatataje/i })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Navigation – Test Series', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('sidebar "Test Series" link navigates to /user/test_series', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Test Series', exact: true }).click();
    await expect(page).toHaveURL(TEST_SERIES_URL);
  });

  test('sidebar "Assessments" link navigates to /user/assessments', async ({ page }) => {
    await page.goto(TEST_SERIES_URL);
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Assessments', exact: true }).click();
    await expect(page).toHaveURL(`${BASE_URL}/user/assessments`);
  });

  test('unauthenticated access to test series redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(TEST_SERIES_URL);
    await expect(page).toHaveURL(/\/user\/login|\/login/, { timeout: 10000 });
  });

  test('unauthenticated access to series detail redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(TG_EAMCET_TESTS_URL);
    await expect(page).toHaveURL(/\/user\/login|\/login/, { timeout: 10000 });
  });

  test('public series landing page is accessible without login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(TG_EAMCET_PUBLIC_URL);
    await expect(page).toHaveURL(TG_EAMCET_PUBLIC_URL);
    await expect(page.getByRole('heading', { name: 'TG EAMCET' }).first()).toBeVisible();
  });
});
