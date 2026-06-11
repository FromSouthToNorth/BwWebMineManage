import { test, expect } from '../utils/setup'

test.describe('安全监测', () => {
  test('安全监测首页应显示表格', async ({ page }) => {
    await page.goto('/WebMineManage/index.cpt')
    await page.waitForSelector('.el-table', { timeout: 10000 })
    const table = page.locator('.el-table')
    await expect(table).toBeVisible()
  })

  test('应显示实时报警面板', async ({ page }) => {
    await page.goto('/WebMineManage/index.cpt')
    await page.waitForSelector('.alarm-card', { timeout: 10000 })
    const alarmCard = page.locator('.alarm-card')
    await expect(alarmCard).toBeVisible()
  })

  test('表格分页应正常工作', async ({ page }) => {
    await page.goto('/WebMineManage/index.cpt')
    await page.waitForSelector('.el-pagination', { timeout: 10000 })
    const pagination = page.locator('.el-pagination')
    await expect(pagination).toBeVisible()
  })
})
