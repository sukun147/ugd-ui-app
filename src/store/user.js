import {defineStore} from 'pinia'
import {getUserInfo, login, logout, register, updatePassword, updateUserInfo} from '@/api/user'
import router from '@/router'

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: localStorage.getItem('userId') || null,
        username: localStorage.getItem('username') || '',
        email: localStorage.getItem('email') || '',
        accessToken: localStorage.getItem('accessToken') || '',
        refreshToken: localStorage.getItem('refreshToken') || '',
        createTime: null,
        expiresTime: null
    }),

    getters: {
        isLoggedIn: (state) => !!state.accessToken
    },

    actions: {
        // 确保 login action 中正确保存了 refreshToken
        async login(userInfo) {
            try {
                const { username, password } = userInfo
                const res = await login({ username: username.trim(), password })
                const { userId, accessToken, refreshToken, expiresTime } = res.data

                // 保存到 store
                this.userId = userId
                this.username = username
                this.accessToken = accessToken
                this.refreshToken = refreshToken  // 确保保存刷新令牌
                this.expiresTime = expiresTime

                // 保存到 localStorage
                localStorage.setItem('userId', userId)
                localStorage.setItem('username', username)
                localStorage.setItem('accessToken', accessToken)
                localStorage.setItem('refreshToken', refreshToken)  // 确保保存刷新令牌

                // 登录成功后获取用户详细信息
                await this.getUserInfo()

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
                return await register(userInfo)
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 退出登录
        async logout() {
            try {
                // 调用登出接口
                await logout()

                // 清除状态
                this.userId = null
                this.username = ''
                this.email = ''
                this.accessToken = ''
                this.refreshToken = ''
                this.createTime = null
                this.expiresTime = null

                // 清除 localStorage
                localStorage.removeItem('userId')
                localStorage.removeItem('username')
                localStorage.removeItem('email')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')

                // 跳转到登录页
                router.push('/login')

                return true
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 获取用户信息
        async getUserInfo() {
            try {
                const res = await getUserInfo()
                const { id, username, email, createTime } = res.data

                // 保存到 store
                this.userId = id
                this.username = username
                this.email = email
                this.createTime = createTime

                // 保存到 localStorage
                localStorage.setItem('userId', id)
                localStorage.setItem('username', username)
                localStorage.setItem('email', email)

                return res.data
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 更新用户信息
        async updateUserInfo(data) {
            try {
                const res = await updateUserInfo(data)

                if (res.data) {
                    // 更新 store
                    this.username = data.username
                    this.email = data.email

                    // 更新 localStorage
                    localStorage.setItem('username', data.username)
                    localStorage.setItem('email', data.email)
                }

                return res
            } catch (error) {
                return Promise.reject(error)
            }
        },

        // 修改密码
        async updatePassword(data) {
            try {
                return await updatePassword(data)
            } catch (error) {
                return Promise.reject(error)
            }
        }
    }
})