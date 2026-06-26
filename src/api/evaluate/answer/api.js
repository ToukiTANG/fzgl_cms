import request from '@/utils/request'

// 查询评议题答案
export function receiptDetail(receiptId) {
    return request({
        url: '/evaluate/receipt/detail',
        method: 'get',
        params: {receiptId: receiptId},
    })
}

