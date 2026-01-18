import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    test('should register a new user', async ({ page }) => {
        await page.goto('/register');
        await expect(page.locator('h1')).toContainText('Create Account');

        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.fill('#confirmPassword', testPassword);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/app');
    });

    test('should login with valid credentials', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('h1')).toContainText('Welcome Back');

        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/app');
        await expect(page.locator('.authenticator-header h1')).toContainText('Your Accounts');
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('#email', 'wrong@example.com');
        await page.fill('#password', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toBeVisible();
        await expect(page).toHaveURL('/login');
    });

    test('should logout successfully', async ({ page }) => {
        await page.goto('/login');
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/app');

        await page.click('.profile-btn');
        await page.click('text=Logout');

        await expect(page).toHaveURL('/');
    });

    test('should redirect unauthenticated users from protected routes', async ({ page }) => {
        await page.goto('/app');
        await expect(page).toHaveURL('/login');

        await page.goto('/settings');
        await expect(page).toHaveURL('/login');
    });

    test('should validate password length', async ({ page }) => {
        await page.goto('/register');

        await page.fill('#email', 'new@example.com');
        await page.fill('#password', 'short');
        await page.fill('#confirmPassword', 'short');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toContainText('at least 8 characters');
    });

    test('should validate password confirmation match', async ({ page }) => {
        await page.goto('/register');

        await page.fill('#email', 'new@example.com');
        await page.fill('#password', 'ValidPassword123');
        await page.fill('#confirmPassword', 'DifferentPassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toContainText('do not match');
    });
});
