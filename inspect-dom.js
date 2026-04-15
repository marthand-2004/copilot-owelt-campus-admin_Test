const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://owlet-campus.com/admin/login');
  await page.fill('input[placeholder="Email"]', 'raghuram@gmail.com');
  await page.fill('input[placeholder="Password"]', 'Ruaf@1489');
  await Promise.all([
    page.waitForURL('**/admin/dashboard', { timeout: 30000 }),
    page.click('button:has-text("Sign In")'),
  ]);
  console.log('logged in');
  await page.click('a:has-text("Courses")');
  await page.waitForURL('**/admin/courses', { timeout: 30000 });
  console.log('courses page');
  const moduleButton = await page.locator('button:has-text("Add New Module"), button:has-text("add new module"), [role="button"]:has-text("Add New Module")').first().evaluate((el) => el.outerHTML).catch(() => null);
  console.log('module button html:', moduleButton);
  const moduleCard = await page.locator('div').filter({ hasText: /Module \d+/ }).first().evaluate((el) => el.outerHTML).catch(() => null);
  console.log('module card html:', moduleCard);
  await browser.close();
})();
