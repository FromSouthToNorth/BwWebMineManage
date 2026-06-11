export async function bwSSOSDKLogin(callback: () => void) {
  const MINE_KEY_PARAM = 'mine_key'
  const urlParams = new URLSearchParams(window.location.search)

  // 有 mine_key 参数直接登录，跳过 SSO
  if (urlParams.get(MINE_KEY_PARAM)) {
    callback()
    return
  }

  // SSO SDK 不可用
  if (typeof window.BW_SSO_SDK === 'undefined' || typeof window.BW_SSO_SDK.SSOLogin !== 'function') {
    console.warn('BW_SSO_SDK not available')
    return
  }

  // 执行 SSO 登录
  window.BW_SSO_SDK.SSOLogin(
    window.location.hostname,
    window.location.port,
    (data) => {
      if (!data) {
        console.warn('SSO login failed')
        callback()
        return
      }
      callback()
    }
  )
}
