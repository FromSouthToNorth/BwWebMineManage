import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, setToken } from '@/utils/auth'
import { login } from '@/api/login'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const name = ref('')

  function Login(userInfo: { username: string; password: string }) {
    return login(userInfo.username, userInfo.password).then((res: any) => {
      setToken(res.data)
      token.value = res.data
    })
  }

  return { token, name, Login }
})
