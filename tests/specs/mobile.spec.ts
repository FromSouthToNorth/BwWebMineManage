import { test, expect } from '@playwright/test'
import { setupSSOMock, setupAllApiMocks } from '../utils/mock'

test.describe('移动端适配', () => {
  test.beforeEach(async ({ page }) => {
    await setupSSOMock(page)
    await setupAllApiMocks(page)
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('移动端安全监测应显示底部 Tab', async ({ page }) => {
    await page.goto('/WebMineManage/index_phone.cpt')
    await page.waitForLoadState('networkidle')
    const tabbar = page.locator('.van-tabbar')
    await expect(tabbar).toBeVisible()
    const tabs = await page.locator('.van-tabbar-item').count()
    expect(tabs).toBeGreaterThanOrEqual(2)
  })

  test('移动端页面视口应正确适配', async ({ page }) => {
    await page.goto('/WebMineManage/personnelLocation_phone.cpt/index_app')
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(375)
    expect(viewport?.height).toBe(812)
  })
})
