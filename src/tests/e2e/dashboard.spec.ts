import { test, expect } from '@playwright/test';
import { resetDb } from '../resetDatabase';

test.beforeEach(async ({ page }) => {
  await resetDb();
  await page.goto('http://localhost:3001/');
  await page.getByTestId('username').fill('test');
  await page.getByTestId('login-btn').click();
  await page.waitForSelector('.navbar');
  await page.goto('/');
});


test.describe('Basic Functionality', () => {
  test('Display dashboard', async ({ page }) => {
    console.log(page);
    expect(1 + 1).toEqual(2);
  });
});
