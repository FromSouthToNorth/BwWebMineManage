import { Page } from '@playwright/test'

/** 模拟 BW_SSO_SDK，绕过 SSO 登录 */
export async function setupSSOMock(page: Page) {
  await page.addInitScript(() => {
    ;(window as any).BW_SSO_SDK = {
      SSOLogin: (_hostname: string, _port: string, callback: (data: any) => void) => {
        callback({ success: true })
      },
      SSOLogout: () => {},
    }
  })
}

/** 拦截 API 请求并返回 Mock 数据 */
export async function mockApiResponse(page: Page, urlPattern: string | RegExp, data: any, code = 100) {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code, data, mesg: 'success' }),
    })
  })
}

/** 模拟所有常见的后端 API 端点 */
export async function setupAllApiMocks(page: Page) {
  // 安全监测数据
  await mockApiResponse(page, /\/api\/PoininfoSmartValid\/GetPageStrategyData/, {
    rows: [
      { devName: '瓦斯传感器#1', devValue: 0.85, devStatus: '正常', alarmStatus: '' },
      { devName: '风速传感器#2', devValue: 4.2, devStatus: '正常', alarmStatus: '' },
      { devName: '温度传感器#3', devValue: 28.5, devStatus: '正常', alarmStatus: '报警' },
    ],
    total: 3,
  })

  // 策略数据
  await mockApiResponse(page, /\/api\/PoininfoSmartValid\/GetStrategyData/, [
    { txt: '选项1', value: '1' },
    { txt: '选项2', value: '2' },
  ])

  // 策略 JSON 数据
  await mockApiResponse(page, /\/api\/PoininfoSmartValid\/GetStrategyJsonData/, {})

  // 矿井信息
  await mockApiResponse(page, /\/api\/Mine\/GetCurrentMine/, { mineName: '测试煤矿' })

  // 登录接口
  await mockApiResponse(page, /\/api\/OAuth\/Login/, 'mock-token-12345')

  // 人员定位数据
  await mockApiResponse(page, /ExecStrategy/, {})

  // ExecuteStrategyCom
  await mockApiResponse(page, /ExecuteStrategyCom/, {})
}
