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

/**
 * 获取用户会话列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getUserSessions(params) {
    return request({
        url: '/app-api/tcmc/client-user/session/page',
        method: 'get',
        params
    })
}

/**
 * 获取会话详情
 * @param {Number} sessionId - 会话编号
 * @returns {Promise}
 */
export function getSessionDetail(sessionId) {
    return request({
        url: `/app-api/tcmc/client-user/session/detail`,
        method: 'get',
        params: { sessionId }
    })
}

/**
 * 更新会话标题
 * @param {Object} data
 * @param {number} data.id - 会话编号
 * @param {string} data.title - 标题
 * @returns {Promise}
 */
export function updateSession(data) {
    return request({
        url: '/app-api/tcmc/client-user/session/update',
        method: 'post',
        data
    })
}