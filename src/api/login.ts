import request from '@/utils/request'

export function login(username: string, password: string) {
  return request({
    url: '/api/OAuth/Login',
    method: 'post',
    data: { username, password },
  })
}
