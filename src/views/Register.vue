<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <div class="register-header">
        <h2>诊疗系统</h2>
        <p>欢迎注册</p>
      </div>

      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
        <el-form-item prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="用户名"
              prefix-icon="el-icon-user"
              clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="registerForm.password"
              placeholder="密码"
              prefix-icon="el-icon-lock"
              show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              placeholder="确认密码"
              prefix-icon="el-icon-lock"
              show-password
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
              v-model="registerForm.email"
              placeholder="邮箱"
              prefix-icon="el-icon-message"
              clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
              :loading="loading"
              type="primary"
              class="register-button"
              @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

// 用户 store
const userStore = useUserStore()
const router = useRouter()

// 注册表单引用
const registerFormRef = ref(null)

// 表单数据
const registerForm = reactive({
  id: 0, // 后端会自动生成，这里先设置为0
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 验证密码是否一致
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证邮箱格式
const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

// 验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ]
}

// 加载状态
const loading = ref(false)

// 处理注册
const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // 提交前删除确认密码字段，因为 API 不需要
      const registerData = {
        id: Date.now(), // 使用时间戳作为临时 ID，后端会覆盖
        username: registerForm.username,
        password: registerForm.password,
        email: registerForm.email
      }

      const res = await userStore.register(registerData)

      ElMessage({
        message: '注册成功，请登录',
        type: 'success'
      })

      // 注册成功后跳转到登录页
      router.push('/login')
    } catch (error) {
      console.error('注册失败', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;

  .register-form-wrapper {
    width: 400px;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    background-color: white;

    .register-header {
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

    .register-form {
      .register-button {
        width: 100%;
      }

      .register-footer {
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