import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data
 * @returns {Promise}
 */
export function login(data) {
    return request({
        url: '/app-api/tcmc/client-user/login',
        method: 'post',
        data
    })
}

/**
 * 用户注册
 * @param {Object} data
 * @returns {Promise}
 */
export function register(data) {
    return request({
        url: '/app-api/tcmc/client-user/register',
        method: 'post',
        data
    })
}

// 可以在这里添加其他用户相关的 API