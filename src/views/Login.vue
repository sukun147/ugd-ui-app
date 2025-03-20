<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <h2>诊疗系统</h2>
        <p>欢迎使用</p>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              prefix-icon="el-icon-user"
              clearable
              @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              placeholder="密码"
              prefix-icon="el-icon-lock"
              show-password
              @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              :loading="loading"
              type="primary"
              class="login-button"
              @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <!-- 添加注册入口 -->
        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import router from "@/router";

// 用户 store
const userStore = useUserStore()

// 登录表单引用
const loginFormRef = ref(null)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
}

// 加载状态
const loading = ref(false)

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await userStore.login(loginForm)
      ElMessage({
        message: '登录成功',
        type: 'success'
      })
      // 登录成功后直接跳转到首页
      router.push('/home')
    } catch (error) {
      console.error('登录失败', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;

  .login-form-wrapper {
    width: 400px;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    background-color: white;

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      h2 {
        margin: 0 0 10px;
        font-size: 28px;
        color: #409EFF;
      }

      p {
        margin: 0;
        color: #909399;
      }
    }

    .login-form {
      .login-button {
        width: 100%;
      }

      .login-footer {
        text-align: center;
        margin-top: 16px;
        color: #909399;

        a {
          color: #409EFF;
          text-decoration: none;
          margin-left: 8px;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>