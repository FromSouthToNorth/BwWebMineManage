import router from './router'
import { getToken } from './utils/cookie'
import { decode, encode } from 'js-base64'
import { useUserStore } from './stores/user'

const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  const { token, mine_key } = to.query as Record<string, string | undefined>

  if (mine_key) {
    const query = { ...to.query }
    delete query.mine_key
    try {
      const key = decode(mine_key)
      const number = key.indexOf(';')
      const username = encode(key.substring(0, number - 1))
      const password = encode(key.substring(number + 2, key.length))
      const userInfo = { username, password }
      const userStore = useUserStore()
      await userStore.Login(userInfo)
      next({ path: to.path, query })
    } catch (error) {
      console.error('Login error:', error)
      next({ path: '/404', query })
    }
  } else if (getToken()) {
    next()
  } else if (whiteList.includes(to.path)) {
    next()
  } else {
    if (typeof window.BW_SSO_SDK !== 'undefined') {
      window.BW_SSO_SDK.SSOLogout(window.location.hostname, window.location.port)
    } else {
      next()
    }
  }
})
