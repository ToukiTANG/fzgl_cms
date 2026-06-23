import request from '@/utils/request'

// 查询回执单列表
export function listReceipt(query) {
    return request({
        url: '/evaluate/receipt/list',
        method: 'get',
        params: query
    })
}