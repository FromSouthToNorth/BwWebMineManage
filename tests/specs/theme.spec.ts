import { test, expect } from '../utils/setup'

test.describe('主题切换', () => {
  test('默认应为暗黑主题', async ({ page }) => {
    await page.goto('/WebMineManage/')
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('theme-dark')
  })

  test('URL 参数可切换主题', async ({ page }) => {
    await page.goto('/WebMineManage/?data-theme=theme-light')
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('theme-light')
  })
})
