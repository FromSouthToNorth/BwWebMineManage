import { test, expect } from '../utils/setup'

test.describe('基础设施', () => {
  test('应用应正常加载并显示标题', async ({ page }) => {
    await expect(page).toHaveTitle(/安全监测/)
  })

  test('路由应重定向到 /index.cpt', async ({ page }) => {
    await page.waitForURL('**/index.cpt')
    expect(page.url()).toContain('/index.cpt')
  })

  test('应加载 Element Plus 组件', async ({ page }) => {
    await page.waitForSelector('.el-card', { timeout: 10000 })
    const cards = await page.locator('.el-card').count()
    expect(cards).toBeGreaterThan(0)
  })
})

test.describe('SSO 和权限', () => {
  test('mine_key 参数应自动登录', async ({ page }) => {
    // 用 mine_key 参数访问
    await page.goto('/WebMineManage/?mine_key=U1hCQU1ZXztfQncxMjM0NTY3OEA=')
    await page.waitForLoadState('networkidle')
    // 应成功跳转，不卡在 SSO
    expect(page.url()).not.toContain('/login')
  })
})
