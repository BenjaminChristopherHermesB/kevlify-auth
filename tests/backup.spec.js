import { test, expect } from '@playwright/test';

test.describe('Backup & Restore', () => {
    const testEmail = `backup-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testSecret = 'JBSWY3DPEHPK3PXP';

    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.fill('#confirmPassword', testPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/app');

        await page.click('text=+ Add Account');
        await page.fill('#issuer', 'Backup Test Service');
        await page.fill('#username', 'backupuser@test.com');
        await page.fill('#secret_encrypted', testSecret);
        await page.click('button[type="submit"]:has-text("Add Account")');
        await expect(page.locator('.account_box')).toBeVisible();
    });

    test('should navigate to settings page', async ({ page }) => {
        await page.click('.profile-btn');
        await page.click('text=Settings');
        await expect(page).toHaveURL('/settings');
        await expect(page.locator('h1')).toContainText('Settings');
    });

    test('should display backup section', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.locator('text=Backup & Restore')).toBeVisible();
        await expect(page.locator('text=📥 Export Backup')).toBeVisible();
        await expect(page.locator('text=📤 Import Backup')).toBeVisible();
    });

    test('should export backup as JSON file', async ({ page }) => {
        await page.goto('/settings');

        const downloadPromise = page.waitForEvent('download');
        await page.click('text=📥 Export Backup');
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toMatch(/kevlify-backup-\d+\.json/);
    });

    test('should show success message after export', async ({ page }) => {
        await page.goto('/settings');

        const downloadPromise = page.waitForEvent('download');
        await page.click('text=📥 Export Backup');
        await downloadPromise;

        await expect(page.locator('.success-message')).toContainText('Backup exported');
    });

    test('should import backup file', async ({ page }) => {
        await page.goto('/settings');

        const downloadPromise = page.waitForEvent('download');
        await page.click('text=📥 Export Backup');
        const download = await downloadPromise;
        const backupPath = await download.path();

        const newEmail = `import-test-${Date.now()}@example.com`;
        await page.click('.profile-btn');
        await page.click('text=Logout');

        await page.goto('/register');
        await page.fill('#email', newEmail);
        await page.fill('#password', testPassword);
        await page.fill('#confirmPassword', testPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/app');

        await page.goto('/settings');

        page.on('dialog', dialog => dialog.dismiss());

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(backupPath);

        await expect(page.locator('.success-message')).toContainText('Import successful');
    });

    test('should show user email in settings', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.locator(`text=${testEmail}`)).toBeVisible();
    });

    test('should show user role in settings', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.locator('.badge:has-text("user")')).toBeVisible();
    });
});
