import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_API,
    timeout: 15000
})

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
            ElMessage({
                message: res.msg || '系统错误',
                type: 'error',
                duration: 5 * 1000
            })

            // token 过期或无效的情况
            if (res.code === 401) {
                router.push('/login')
            }

            return Promise.reject(new Error(res.msg || '系统错误'))
        } else {
            return res
        }
    },
    error => {
        console.error('请求错误', error)
        ElMessage({
            message: error.message || '请求失败',
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

export default service