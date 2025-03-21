import request from '@/utils/request'

/**
 * 创建问答
 * @param {Object} data
 * @param {number} data.sessionId - 会话id
 * @param {string} data.question - 问题内容
 * @returns {Promise}
 */
export function createQA(data) {
    return request({
        url: '/app-api/tcmc/qa/create',
        method: 'post',
        data
    })
}