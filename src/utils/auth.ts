import { TOKEN_KEY } from './constants'

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? token.replace(/"/g, '') : null
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}
