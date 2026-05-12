import { test as setup, expect } from '@playwright/test';
import path from 'path';

const USER_AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

setup('authenticate as user', async ({ page }) => {
  await page.goto('https://owlet-campus.com/user/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('suryatataje@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Asurya@.0009');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/user\//, { timeout: 15000 });
  await page.context().storageState({ path: USER_AUTH_FILE });
});
