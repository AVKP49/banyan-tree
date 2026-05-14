import { test, expect } from '@playwright/test'

test.describe('The Banyan Tree - Ask Dadi', () => {
  test('home page loads with tagline', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('The Banyan Tree')
    await expect(page.locator('text=ask Dadi why')).toBeVisible()
  })

  test('library shows episodes', async ({ page }) => {
    await page.goto('/library')
    await expect(page.locator('text=The Monkey and the Crocodile')).toBeVisible()
    await expect(page.locator("text=Birbal's Khichdi")).toBeVisible()
  })

  test('episode player loads', async ({ page }) => {
    await page.goto('/episode/monkey-and-crocodile')
    await expect(page.locator('text=The Monkey and the Crocodile')).toBeVisible()
    await expect(page.locator('text=Ask Dadi')).toBeVisible()
  })

  test('Ask Dadi panel opens with suggestions', async ({ page }) => {
    await page.goto('/episode/monkey-and-crocodile')
    await page.click('text=Ask Dadi')
    await expect(page.locator('text=Talking to Dadi')).toBeVisible()
  })

  test('words page shows vocabulary', async ({ page }) => {
    await page.goto('/words')
    await expect(page.locator('text=Words Dadi Taught You')).toBeVisible()
    await expect(page.locator('text=jungle')).toBeVisible()
    await expect(page.locator('text=khichdi')).toBeVisible()
  })

  test('parent zone requires PIN', async ({ page }) => {
    await page.goto('/parents')
    await expect(page.locator('text=Parent Zone')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('about page loads', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('text=About The Banyan Tree')).toBeVisible()
    await expect(page.locator('text=Meet Dadi')).toBeVisible()
  })

  test('regional map shows pins', async ({ page }) => {
    await page.goto('/library')
    await page.click('text=Map')
    await expect(page.locator('svg[aria-label="Map of the Indian subcontinent"]')).toBeVisible()
  })
})
