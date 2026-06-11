import { test, expect } from '../utils/setup'

test.describe('人员定位', () => {
  test('PC 端首页应显示标题', async ({ page }) => {
    await page.goto('/WebMineManage/personnelLocation.cpt')
    const title = page.locator('.location-title')
    await expect(title).toContainText('人员定位')
  })

  test('应显示下井人数', async ({ page }) => {
    await page.goto('/WebMineManage/personnelLocation.cpt')
    const numbers = page.locator('.downhole-numbers')
    await expect(numbers).toBeVisible()
  })

  test('移动端页面应显示 Tab 栏', async ({ page }) => {
    await page.goto('/WebMineManage/personnelLocation_phone.cpt/index_app')
    const tabbar = page.locator('.van-tabbar')
    await expect(tabbar).toBeVisible()
  })
})
