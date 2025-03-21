import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { refreshToken } from '@/api/user'

// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_API,
    timeout: 15000
})

// 是否正在刷新token
let isRefreshing = false
// 重试队列
let retryRequests = []

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data

        // 根据后端响应的状态码处理不同情况
        if (res.code !== 0) {
            // token 过期的情况
            if (res.code === 401) {
                return handleTokenExpired(response.config)
            }

            ElMessage({
                message: res.msg || '系统错误',
                type: 'error',
                duration: 5 * 1000
            })

            return Promise.reject(new Error(res.msg || '系统错误'))
        } else {
            return res
        }
    },
    error => {
        // 处理 401 错误
        if (error.response && error.response.status === 401) {
            return handleTokenExpired(error.config)
        }

        console.error('请求错误', error)
        ElMessage({
            message: error.message || '请求失败',
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

// 处理令牌过期
async function handleTokenExpired(failedRequest) {
    const userStore = useUserStore()
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (!storedRefreshToken) {
        // 如果没有刷新令牌，直接跳转到登录页
        userStore.logout()
        return Promise.reject(new Error('请重新登录'))
    }

    if (!isRefreshing) {
        isRefreshing = true

        try {
            // 尝试刷新令牌
            const res = await refreshToken(storedRefreshToken)
            const { accessToken, refreshToken: newRefreshToken, expiresTime } = res.data

            // 更新 store 和 localStorage 中的令牌
            userStore.$patch({
                accessToken,
                refreshToken: newRefreshToken,
                expiresTime
            })
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            // 重试所有失败的请求
            retryRequests.forEach(cb => cb(accessToken))
            retryRequests = []

            // 重试当前失败的请求
            failedRequest.headers.Authorization = `Bearer ${accessToken}`
            return service(failedRequest)
        } catch (error) {
            // 刷新令牌失败，清除用户信息并跳转到登录页
            userStore.logout()
            return Promise.reject(error)
        } finally {
            isRefreshing = false
        }
    }

    // 将失败的请求加入重试队列
    return new Promise(resolve => {
        retryRequests.push(token => {
            failedRequest.headers.Authorization = `Bearer ${token}`
            resolve(service(failedRequest))
        })
    })
}

export default service