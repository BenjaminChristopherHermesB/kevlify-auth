import { test, expect } from '@playwright/test';

test.describe('OTP Generation', () => {
    const testEmail = `otp-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testSecret = 'JBSWY3DPEHPK3PXP';

    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.fill('#confirmPassword', testPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/app');
    });

    test('should add a new account manually', async ({ page }) => {
        await page.click('text=+ Add Account');
        await expect(page.locator('.modal-content h2')).toContainText('Add Account');

        await page.fill('#issuer', 'Test Service');
        await page.fill('#username', 'testuser@example.com');
        await page.fill('#secret_encrypted', testSecret);
        await page.click('button[type="submit"]:has-text("Add Account")');

        await expect(page.locator('.account_box')).toBeVisible();
        await expect(page.locator('.account-issuer')).toContainText('Test Service');
    });

    test('should generate 6-digit OTP code', async ({ page }) => {
        await page.click('text=+ Add Account');
        await page.fill('#issuer', 'OTP Test');
        await page.fill('#secret_encrypted', testSecret);
        await page.click('button[type="submit"]:has-text("Add Account")');

        const codeElement = page.locator('.auth_code');
        await expect(codeElement).toBeVisible();

        const code = await codeElement.textContent();
        const cleanCode = code.replace(/\s/g, '');
        expect(cleanCode).toMatch(/^\d{6}$/);
    });

    test('should update OTP code periodically', async ({ page }) => {
        await page.click('text=+ Add Account');
        await page.fill('#issuer', 'Periodic Test');
        await page.fill('#secret_encrypted', testSecret);
        await page.click('button[type="submit"]:has-text("Add Account")');

        const codeElement = page.locator('.auth_code');
        const initialCode = await codeElement.textContent();

        await page.waitForTimeout(31000);

        const newCode = await codeElement.textContent();
        expect(newCode).not.toBe(initialCode);
    });

    test('should copy code to clipboard on click', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);

        await page.click('text=+ Add Account');
        await page.fill('#issuer', 'Copy Test');
        await page.fill('#secret_encrypted', testSecret);
        await page.click('button[type="submit"]:has-text("Add Account")');

        await page.click('.account_box');
        await expect(page.locator('.copied_text')).toHaveCSS('opacity', '1');
    });

    test('should show progress bar countdown', async ({ page }) => {
        await page.click('text=+ Add Account');
        await page.fill('#issuer', 'Progress Test');
        await page.fill('#secret_encrypted', testSecret);
        await page.click('button[type="submit"]:has-text("Add Account")');

        const progressBar = page.locator('.progress-fill');
        await expect(progressBar).toBeVisible();

        const width = await progressBar.evaluate(el => el.style.width);
        expect(parseFloat(width)).toBeLessThanOrEqual(100);
        expect(parseFloat(width)).toBeGreaterThan(0);
    });

    test('should edit account name', async ({ page }) => {
        await page.click('text=+ Add Account');
        await page.fill('#issuer', 'Original Name');
        await page.fill('#secret_encrypted', testSecret);
        await page.click('button[type="submit"]:has-text("Add Account")');

        await page.click('.account_menu');
        await page.click('text=Edit');

        await page.fill('dialog input, [role="dialog"] input', 'Updated Name');
        await page.keyboard.press('Enter');

        await expect(page.locator('.account-issuer')).toContainText('Updated Name');
    });

    test('should delete account', async ({ page }) => {
        await page.click('text=+ Add Account');
        await page.fill('#issuer', 'Delete Test');
        await page.fill('#secret_encrypted', testSecret);
        await page.click('button[type="submit"]:has-text("Add Account")');

        await expect(page.locator('.account_box')).toHaveCount(1);

        await page.click('.account_menu');

        page.on('dialog', dialog => dialog.accept());
        await page.click('text=Delete');

        await expect(page.locator('.account_box')).toHaveCount(0);
    });
});
