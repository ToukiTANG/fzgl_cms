import request from '@/utils/request'

// 查询评议单列表
export function listOrder(query) {
    return request({
        url: '/evaluate/order/list',
        method: 'get',
        params: query
    })
}

//新增评议单
export function addOrder(data) {
    return request({
        url: '/evaluate/order/add',
        method: 'post',
        data: data
    })
}

//删除评议单
export function removeOrder(ids) {
    return request({
        url: '/evaluate/order/remove',
        method: 'post',
        data: ids
    })
}

//查询评议单详情
export function getOrder(orderId) {
    return request({
        url: '/evaluate/order/getByOrderId',
        method: 'get',
        params: {orderId: orderId}
    })
}

//更新评议单
export function updateOrder(order) {
    return request({
        url: '/evaluate/order/update',
        method: 'post',
        data: order
    })
}

//发布评议单
export function publishOrder(orderId) {
    return request({
        url: '/evaluate/order/publish',
        method: 'post',
        params: {orderId: orderId}
    })
}