import { test, expect } from '@playwright/test';

test.describe('QR Scanning', () => {
    const testEmail = `qr-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.fill('#confirmPassword', testPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/app');
    });

    test('should open QR scanner modal', async ({ page }) => {
        await page.click('text=📷 Scan QR');
        await expect(page.locator('.modal-content h2')).toContainText('Scan QR Code');
    });

    test('should show camera permission message if denied', async ({ page, context }) => {
        await context.grantPermissions([]);

        await page.click('text=📷 Scan QR');

        await expect(page.locator('.qr-error')).toBeVisible({ timeout: 10000 });
    });

    test('should close QR scanner on cancel', async ({ page }) => {
        await page.click('text=📷 Scan QR');
        await expect(page.locator('.modal-content')).toBeVisible();

        await page.click('text=Cancel');
        await expect(page.locator('.modal-content')).not.toBeVisible();
    });

    test('should handle OTP URI parsing', async ({ page }) => {
        const otpUri = 'otpauth://totp/TestIssuer:testuser?secret=JBSWY3DPEHPK3PXP&issuer=TestIssuer&algorithm=SHA1&digits=6&period=30';

        await page.evaluate((uri) => {
            const event = new CustomEvent('qr-scan', { detail: uri });
            window.dispatchEvent(event);
        }, otpUri);
    });
});
