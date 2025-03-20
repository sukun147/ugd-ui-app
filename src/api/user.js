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

/**
 * 用户登出
 * @returns {Promise}
 */
export function logout() {
    return request({
        url: '/app-api/tcmc/client-user/logout',
        method: 'get'
    })
}

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
    return request({
        url: '/app-api/tcmc/client-user/get',
        method: 'get'
    })
}

/**
 * 更新用户个人信息
 * @param {Object} data
 * @returns {Promise}
 */
export function updateUserInfo(data) {
    return request({
        url: '/app-api/tcmc/client-user/update',
        method: 'put',
        data
    })
}

/**
 * 修改用户密码
 * @param {Object} data
 * @returns {Promise}
 */
export function updatePassword(data) {
    return request({
        url: '/app-api/tcmc/client-user/updatePassword',
        method: 'post',
        data
    })
}