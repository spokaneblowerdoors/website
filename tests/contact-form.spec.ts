import { test, expect } from '@playwright/test';

// The form service is intercepted in every test, so no real messages are ever sent.
const FORM_ENDPOINT = 'https://api.web3forms.com/submit';

test('shows clear errors when required fields are empty', async ({ page }) => {
  let sent = false;
  await page.route(FORM_ENDPOINT, (route) => { sent = true; return route.abort(); });
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  await expect(page.getByText('Please enter a message.')).toBeVisible();
  await expect(page.getByLabel(/^Name/)).toBeFocused();
  expect(sent).toBe(false);
});

test('sends a well-formed message and shows the thank-you page', async ({ page }) => {
  let body: Record<string, string> = {};
  await page.route(FORM_ENDPOINT, async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Email sent' }) });
  });
  await page.goto('/contact/');
  await page.getByLabel(/^Name/).fill('Test Person');
  await page.getByLabel(/^Email/).fill('test@example.com');
  await page.getByLabel(/^Phone/).fill('509-555-0100');
  await page.getByLabel(/^Message/).fill('Automated test message. Please ignore.');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page).toHaveURL(/\/thank-you\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thank you');

  expect(body.access_key).toMatch(/^[0-9a-f-]{36}$/i);
  expect(body.name).toBe('Test Person');
  expect(body.email).toBe('test@example.com');
  expect(body.phone).toBe('509-555-0100');
  expect(body.message).toContain('Automated test message');
  expect(body.subject).toBeTruthy();
  expect(body.botcheck).toBeUndefined();
  expect(body.redirect).toBeUndefined();
});

test('tells the visitor and offers the phone number if sending fails', async ({ page }) => {
  await page.route(FORM_ENDPOINT, (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Server error' }) }),
  );
  await page.goto('/contact/');
  await page.getByLabel(/^Name/).fill('Test Person');
  await page.getByLabel(/^Email/).fill('test@example.com');
  await page.getByLabel(/^Message/).fill('Automated test message.');
  await page.getByRole('button', { name: 'Send message' }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert.getByRole('link', { name: '509-903-8595' })).toBeVisible();
  await expect(page).toHaveURL(/\/contact\/$/);
});
