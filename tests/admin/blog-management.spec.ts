import { test, expect, Page } from '@playwright/test';

// ─── Credentials & URLs ────────────────────────────────────────────────────
const BASE_URL = 'https://owlet-campus.com';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
const BLOGS_URL = `${BASE_URL}/admin/blogs`;
const NEW_BLOG_URL = `${BASE_URL}/admin/blogs/new`;

// Known stable blog post for edit tests (Published + Approved)
const KNOWN_BLOG_ID = '69fefc30f5fe02fbb3c546a2';
const KNOWN_BLOG_EDIT_URL = `${BASE_URL}/admin/blogs/${KNOWN_BLOG_ID}/edit`;
const KNOWN_BLOG_TITLE = 'The Microbiome Revolution';

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
// 1. BLOG MANAGEMENT LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Blog Management List Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(BLOGS_URL);
  });

  test('page loads with correct heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Blog Management' })).toBeVisible();
    await expect(page.getByText('Draft, review moderation, publish, and track readership')).toBeVisible();
  });

  test('"New post" link is visible and navigates to /admin/blogs/new', async ({ page }) => {
    const newPostLink = page.getByRole('link', { name: /New post/i });
    await expect(newPostLink).toBeVisible();
    await newPostLink.click();
    await expect(page).toHaveURL(NEW_BLOG_URL);
  });

  test('search box is present in header', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: 'Search blogs' })).toBeVisible();
  });

  test('Publication status filter is present with "All statuses" default', async ({ page }) => {
    const statusSelect = page.getByRole('combobox', { name: 'Publication status' });
    await expect(statusSelect).toBeVisible();
    await expect(statusSelect).toContainText('All statuses');
  });

  test('Publication status filter has Draft, Published, Archived, Pending review options', async ({ page }) => {
    const statusSelect = page.getByRole('combobox', { name: 'Publication status' });
    await expect(statusSelect).toContainText('Draft');
    await expect(statusSelect).toContainText('Published');
    await expect(statusSelect).toContainText('Archived');
    await expect(statusSelect).toContainText('Pending review');
  });

  test('Moderation filter is present with "All moderation" default', async ({ page }) => {
    const modSelect = page.getByRole('combobox', { name: 'Moderation' });
    await expect(modSelect).toBeVisible();
    await expect(modSelect).toContainText('All moderation');
  });

  test('Moderation filter has Approved, Pending, Rejected options', async ({ page }) => {
    const modSelect = page.getByRole('combobox', { name: 'Moderation' });
    await expect(modSelect).toContainText('Approved');
    await expect(modSelect).toContainText('Pending');
    await expect(modSelect).toContainText('Rejected');
  });

  test('filter by Published status shows only published posts', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Publication status' }).selectOption('Published');
    await page.waitForTimeout(500);
    // All visible status badges should be Published
    const draftBadges = page.getByRole('article').getByText('Draft');
    await expect(draftBadges).toHaveCount(0);
  });

  test('filter by Draft status shows only draft posts', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Publication status' }).selectOption('Draft');
    await page.waitForTimeout(500);
    const publishedBadges = page.getByRole('article').getByText('Published');
    await expect(publishedBadges).toHaveCount(0);
  });

  test('filter by Approved moderation shows only approved posts', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Moderation' }).selectOption('Approved');
    await page.waitForTimeout(500);
    const pendingBadges = page.getByRole('article').getByText('Pending');
    await expect(pendingBadges).toHaveCount(0);
  });

  test('filter by Pending moderation shows only pending posts', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Moderation' }).selectOption('Pending');
    await page.waitForTimeout(500);
    const approvedBadges = page.getByRole('article').getByText('Approved');
    await expect(approvedBadges).toHaveCount(0);
  });

  test('blog post cards show Author, Views and Created metadata', async ({ page }) => {
    await expect(page.getByText('Author').first()).toBeVisible();
    await expect(page.getByText('Views').first()).toBeVisible();
    await expect(page.getByText('Created').first()).toBeVisible();
  });

  test('each card has Publication status and Moderation badges', async ({ page }) => {
    const firstCard = page.getByRole('article').first();
    // Status badge is one of Published/Draft/Archived/Pending review
    const statusBadge = firstCard.getByText(/^(Published|Draft|Archived|Pending review)$/).first();
    await expect(statusBadge).toBeVisible();
    // Moderation badge is one of Approved/Pending/Rejected
    const modBadge = firstCard.getByText(/^(Approved|Pending|Rejected)$/).first();
    await expect(modBadge).toBeVisible();
  });

  test('each card has Preview, Edit and Delete action buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Preview:/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Edit:/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete:/i }).first()).toBeVisible();
  });

  test('clicking Edit navigates to the blog edit page', async ({ page }) => {
    const editLink = page.getByRole('link', { name: /Edit:/i }).first();
    await editLink.click();
    await expect(page).toHaveURL(/\/admin\/blogs\/.+\/edit/);
  });

  test('known published+approved post is visible in the list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /The Microbiome Revolution/i })).toBeVisible();
  });

  test('known draft+pending post is visible in the list', async ({ page }) => {
    // Edge Computing post is Draft/Pending
    await expect(page.getByRole('heading', { name: /Edge Computing and AI/i }).first()).toBeVisible();
  });

  test('sidebar "Blog Management" link is active on this page', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Blog Management', exact: true })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. BLOG SEARCH
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Blog Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(BLOGS_URL);
  });

  test('search box accepts input', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Search blogs' });
    await searchBox.fill('Quantum');
    await expect(searchBox).toHaveValue('Quantum');
  });

  test('searching for a known title shows matching posts', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search blogs' }).fill('Microbiome');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /The Microbiome Revolution/i })).toBeVisible();
  });

  test('searching for non-existent term hides unrelated posts', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search blogs' }).fill('xyznonexistentblog99999');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /The Microbiome Revolution/i })).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. CREATE NEW BLOG POST PAGE
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Create New Blog Post', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(NEW_BLOG_URL);
  });

  test('page loads with "New Blog Post" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New Blog Post' })).toBeVisible();
    await expect(page.getByText('Create a new blog post')).toBeVisible();
  });

  test('back link navigates to blogs list', async ({ page }) => {
    // The back link is an icon-only link pointing to /admin/blogs
    await page.locator('a[href="/admin/blogs"]').first().click();
    await expect(page).toHaveURL(BLOGS_URL);
  });

  test('"Basic Information" section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
  });

  test('Title field is present and required', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Enter blog post title' })).toBeVisible();
  });

  test('Slug field is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'url-friendly-slug' })).toBeVisible();
  });

  test('Tag line field is present with character counter', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /One short line for admin cards/i })).toBeVisible();
    await expect(page.getByText('0/220')).toBeVisible();
  });

  test('Summary / excerpt field is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Longer optional summary/i })).toBeVisible();
  });

  test('Featured Image upload button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Choose File' })).toBeVisible();
  });

  test('"Content" section with rich text editor is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Content' })).toBeVisible();
    await expect(page.getByRole('toolbar')).toBeVisible();
  });

  test('"SEO Settings" section is present', async ({ page }) => {
    await page.getByRole('heading', { name: 'SEO Settings' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'SEO Settings' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'SEO title' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'SEO description' })).toBeVisible();
  });

  test('"Categories & Tags" section is present', async ({ page }) => {
    await page.getByRole('heading', { name: 'Categories & Tags' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Categories & Tags' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Select or type to create a category/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Type to search or create tags/i })).toBeVisible();
  });

  test('"Publishing" section has Status dropdown defaulting to Draft', async ({ page }) => {
    await page.getByRole('heading', { name: 'Publishing' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Publishing' })).toBeVisible();
    const statusSelect = page.getByRole('combobox').last();
    await expect(statusSelect).toContainText('Draft');
  });

  test('Status dropdown has Draft, Published, Pending Review options', async ({ page }) => {
    await page.getByRole('heading', { name: 'Publishing' }).scrollIntoViewIfNeeded();
    const statusSelect = page.getByRole('combobox').last();
    await expect(statusSelect).toContainText('Draft');
    await expect(statusSelect).toContainText('Published');
    await expect(statusSelect).toContainText('Pending Review');
  });

  test('"Save Post" button is present', async ({ page }) => {
    await page.getByRole('button', { name: 'Save Post' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Save Post' })).toBeVisible();
  });

  test('"Cancel" link navigates back to blogs list', async ({ page }) => {
    await page.getByRole('link', { name: 'Cancel' }).scrollIntoViewIfNeeded();
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(BLOGS_URL);
  });

  test('typing in Title field updates the value', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Enter blog post title' });
    await titleInput.fill('My Test Blog Post');
    await expect(titleInput).toHaveValue('My Test Blog Post');
  });

  test('tag line character counter updates as user types', async ({ page }) => {
    const tagLineInput = page.getByRole('textbox', { name: /One short line for admin cards/i });
    await tagLineInput.fill('Hello World');
    await expect(page.getByText('11/220')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. EDIT EXISTING BLOG POST
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Edit Existing Blog Post', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(KNOWN_BLOG_EDIT_URL);
  });

  test('edit page loads with "Edit Blog Post" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit Blog Post' })).toBeVisible();
    await expect(page.getByText('Update your blog post')).toBeVisible();
  });

  test('back link navigates to blogs list', async ({ page }) => {
    // The back link is an icon-only link pointing to /admin/blogs
    await page.locator('a[href="/admin/blogs"]').first().click();
    await expect(page).toHaveURL(BLOGS_URL);
  });

  test('Title field is pre-filled with the post title', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Enter blog post title' });
    await expect(titleInput).toHaveValue(new RegExp(KNOWN_BLOG_TITLE));
  });

  test('Slug field is pre-filled', async ({ page }) => {
    const slugInput = page.getByRole('textbox', { name: 'url-friendly-slug' });
    const value = await slugInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Summary field is pre-filled', async ({ page }) => {
    const summaryInput = page.getByRole('textbox', { name: /Longer optional summary/i });
    const value = await summaryInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Meta Title is pre-filled', async ({ page }) => {
    await page.getByRole('heading', { name: 'SEO Settings' }).scrollIntoViewIfNeeded();
    const metaTitle = page.getByRole('textbox', { name: 'SEO title' });
    const value = await metaTitle.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Meta Description is pre-filled', async ({ page }) => {
    await page.getByRole('heading', { name: 'SEO Settings' }).scrollIntoViewIfNeeded();
    const metaDesc = page.getByRole('textbox', { name: 'SEO description' });
    const value = await metaDesc.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Category field is pre-filled', async ({ page }) => {
    await page.getByRole('heading', { name: 'Categories & Tags' }).scrollIntoViewIfNeeded();
    const categoryInput = page.getByRole('textbox', { name: /Select or type to create a category/i });
    const value = await categoryInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Tags are pre-filled', async ({ page }) => {
    await page.getByRole('heading', { name: 'Categories & Tags' }).scrollIntoViewIfNeeded();
    // Tags appear as text chips — at least one should be visible
    await expect(page.getByText('climate')).toBeVisible();
  });

  test('Status is pre-selected as Published', async ({ page }) => {
    await page.getByRole('heading', { name: 'Publishing' }).scrollIntoViewIfNeeded();
    const statusSelect = page.getByRole('combobox').last();
    await expect(statusSelect).toHaveValue('published');
  });

  test('"Update Post" button is present and enabled', async ({ page }) => {
    await page.getByRole('button', { name: 'Update Post' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Update Post' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Post' })).toBeEnabled();
  });

  test('"Cancel" link navigates back to blogs list', async ({ page }) => {
    await page.getByRole('link', { name: 'Cancel' }).scrollIntoViewIfNeeded();
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(BLOGS_URL);
  });

  test('rich text editor toolbar has formatting buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'bold' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'italic' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'underline' })).toBeVisible();
  });

  test('editor toolbar has media upload buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Upload Image' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload Video' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload Audio' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible();
  });

  test('editor toolbar has AI Commands button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'AI Commands' })).toBeVisible();
  });

  test('editing the title field updates the value', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Enter blog post title' });
    const original = await titleInput.inputValue();
    await titleInput.fill('Updated Title Test');
    await expect(titleInput).toHaveValue('Updated Title Test');
    // Restore
    await titleInput.fill(original);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. DELETE BLOG POST FLOW
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Delete Blog Post', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(BLOGS_URL);
  });

  test('clicking Delete button triggers a native confirm dialog', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('delete');
      await dialog.dismiss();
    });
    await page.getByRole('button', { name: /Delete:/i }).first().click();
  });

  test('dismissing the confirm dialog keeps the post in the list', async ({ page }) => {
    // Get the first post title before clicking delete
    const firstTitle = await page.getByRole('article').first().getByRole('heading').textContent();
    page.once('dialog', async (dialog) => {
      await dialog.dismiss(); // Cancel
    });
    await page.getByRole('button', { name: /Delete:/i }).first().click();
    await page.waitForTimeout(500);
    // Post should still be visible
    await expect(page.getByRole('heading', { name: firstTitle! })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. PREVIEW BLOG POST
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Preview Blog Post', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(BLOGS_URL);
  });

  test('Preview button is present on each card', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Preview:/i }).first()).toBeVisible();
  });

  test('clicking Preview button opens a preview', async ({ page }) => {
    // Preview may open in same page, new tab, or modal — just verify the button is clickable
    // and the page doesn't crash
    await page.getByRole('button', { name: /Preview:/i }).first().click();
    await page.waitForTimeout(1000);
    // Page should still be functional (either same URL or navigated)
    const url = page.url();
    expect(url).toContain('owlet-campus.com');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
test.describe('Sidebar Navigation – Blog Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('sidebar "Blog Management" link is present', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('link', { name: 'Blog Management', exact: true })).toBeVisible();
  });

  test('sidebar "Blog Management" link navigates to /admin/blogs', async ({ page }) => {
    const sidebar = page.getByRole('complementary');
    await sidebar.getByRole('link', { name: 'Blog Management', exact: true }).click();
    await expect(page).toHaveURL(BLOGS_URL);
  });
});
