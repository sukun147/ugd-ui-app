import { defineStore } from 'pinia'
import { login, register } from '@/api/user'
import router from '@/router'

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: null,
        username: localStorage.getItem('username') || '',
        accessToken: localStorage.getItem('accessToken') || '',
        refreshToken: localStorage.getItem('refreshToken') || '',
        expiresTime: null
    }),

    getters: {
        isLoggedIn: (state) => !!state.accessToken
    },

    actions: {
        // 用户登录
        async login(userInfo) {
            try {
                const { username, password } = userInfo
                const res = await login({ username: username.trim(), password })
                const { userId, accessToken, refreshToken, expiresTime } = res.data

                // 保存到 store
                this.userId = userId
                this.username = username // 保存用户名
                this.accessToken = accessToken
                this.refreshToken = refreshToken
                this.expiresTime = expiresTime

                // 保存到 localStorage
                localStorage.setItem('userId', userId)
                localStorage.setItem('username', username) // 保存用户名到 localStorage
                localStorage.setItem('accessToken', accessToken)
                localStorage.setItem('refreshToken', refreshToken)

                // 登录成功后跳转到首页
                router.push('/home')

                return res
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 用户注册
        async register(userInfo) {
            try {
                const res = await register(userInfo)
                return res
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 退出登录
        logout() {
            this.userId = null
            this.username = ''
            this.accessToken = ''
            this.refreshToken = ''
            this.expiresTime = null

            // 清除 localStorage
            localStorage.removeItem('userId')
            localStorage.removeItem('username')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')

            // 跳转到登录页
            router.push('/login')
        }
    }
})