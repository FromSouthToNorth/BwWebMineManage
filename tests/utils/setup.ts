import { test as base } from '@playwright/test'
import { setupSSOMock, setupAllApiMocks } from './mock'

/** 扩展的 Fixture：自动 Mock SSO 和 API */
export const test = base.extend({
  page: async ({ page }, use) => {
    await setupSSOMock(page)
    await setupAllApiMocks(page)
    await page.goto('/WebMineManage/')
    await page.waitForLoadState('networkidle')
    await use(page)
  },
})

export { expect } from '@playwright/test'
