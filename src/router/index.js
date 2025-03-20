import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Home from '@/views/Home.vue'

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { title: '登录' }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { title: '注册' }
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: {
            title: '首页',
            requiresAuth: true
        }
    },
    // 其他路由
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由前置守卫，处理页面标题和权限控制
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 诊疗系统` : '诊疗系统'

    // 如果页面需要认证且没有 token，则跳转到登录页
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            next({ path: '/login', query: { redirect: to.fullPath } })
            return
        }
    }

    next()
})

export default router