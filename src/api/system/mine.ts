import request from '@/utils/request'

export function getCurrentMine() {
  return request({
    url: '/api/Mine/GetCurrentMine',
    method: 'get',
  })
}
