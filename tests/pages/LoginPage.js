/**
 * LoginPage - Page Object Model for admin login
 */
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[placeholder="Email"]');
    this.passwordInput = page.locator('input[placeholder="Password"]');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.dashboardHeading = page.locator('h1');
  }

  async goto() {
    await this.page.goto('/admin/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForURL('**/admin/dashboard', { timeout: 20000 }),
      this.signInButton.click(),
    ]);
  }

  async verifyLoginSuccess() {
    await this.page.waitForURL('**/admin/dashboard');
    // Verify sidebar is visible
    const sidebar = this.page.locator('aside').first();
    await sidebar.waitFor({ state: 'visible', timeout: 5000 });
    
    // Verify user name is visible (top right)
    const userProfile = this.page.locator('button').filter({ hasText: /raghuram|user profile/i }).first();
    await userProfile.waitFor({ state: 'visible', timeout: 5000 });
  }
}

module.exports = LoginPage;
