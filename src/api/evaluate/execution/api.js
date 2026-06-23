import request from '@/utils/request'

// 查询评议题
export function evaluateContent(query) {
    return request({
        url: '/evaluate/execution/content',
        method: 'get',
        params: query
    })
}

// 提交评议题答案
export function submitAnswer(receipt) {
    return request({
        url: '/evaluate/execution/submitAnswer',
        method: 'post',
        data: receipt
    })
}