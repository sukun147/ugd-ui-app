<template>
  <div class="home-container">
    <el-header class="header">
      <div class="logo">
        <h1>中医问诊系统</h1>
      </div>
      <div class="user-info">
        <el-dropdown @command="handleCommand">
          <span class="dropdown-link">
            {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 添加左侧会话列表侧边栏 -->
      <el-aside width="250px" class="sidebar" :class="{ 'is-collapsed': isCollapse }">
        <div class="session-header">
          <span>历史会话</span>
          <el-button type="text" @click="isCollapse = !isCollapse">
            <i :class="isCollapse ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"></i>
          </el-button>
        </div>
        <el-menu
            :collapse="isCollapse"
            :collapse-transition="false"
            class="session-menu"
        >
          <el-empty v-if="sessionList.length === 0" description="暂无会话记录"></el-empty>
          <el-menu-item
              v-for="session in sessionList"
              :key="session.id"
              :index="session.id.toString()"
              @click="selectSession(session)"
          >
            <div class="session-item">
              <span class="session-title">{{ session.title }}</span>
              <span class="session-time">{{ formatTime(session.createTime, 'short') }}</span>
            </div>
          </el-menu-item>
        </el-menu>
        <div class="pagination-container" v-if="sessionList.length > 0">
          <el-pagination
              small
              layout="prev, pager, next"
              :total="sessionTotal"
              :page-size="pageSize"
              :current-page="pageNo"
              @current-change="handlePageChange"
          />
        </div>
      </el-aside>

      <el-main class="main">
        <div class="consultation-center">
          <el-card class="consultation-card">
            <div class="consultation-input">
              <el-input
                  v-model="consultationQuery"
                  type="textarea"
                  :rows="6"
                  placeholder="例如：我最近感觉头晕、疲惫，有时会出现轻微头痛，这可能是什么原因引起的？"
                  resize="none"
              ></el-input>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>

    <!-- 个人信息弹窗 -->
    <el-dialog
        title="个人信息"
        v-model="profileDialogVisible"
        width="30%"
        :close-on-click-modal="false"
    >
      <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="注册时间">
          <div>{{ formatTime(profileForm.createTime) }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="profileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProfile" :loading="submitLoading">保存</el-button>
          <el-button type="warning" @click="openPasswordDialog">修改密码</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog
        title="修改密码"
        v-model="passwordDialogVisible"
        width="30%"
        :close-on-click-modal="false"
    >
      <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="80px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
              v-model="passwordForm.oldPassword"
              placeholder="请输入旧密码"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordForm.newPassword"
              placeholder="请输入新密码"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="passwordForm.confirmPassword"
              placeholder="请再次输入新密码"
              type="password"
              show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPassword" :loading="passwordLoading">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const username = ref(userStore.username || '')
const consultationQuery = ref('')

// 个人信息弹窗相关变量
const profileDialogVisible = ref(false)
const profileFormRef = ref(null)
const submitLoading = ref(false)
const profileForm = reactive({
  id: userStore.userId || '',
  username: userStore.username || '',
  email: userStore.email || '',
  createTime: userStore.createTime || ''
})

// 修改密码弹窗相关变量
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordLoading = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  try {
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return time || '-'
  }
}

// 初始化时获取用户信息
onMounted(async () => {
  try {
    if (userStore.isLoggedIn) {
      await fetchUserInfo()
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const userInfo = await userStore.getUserInfo()
    // 更新表单数据
    profileForm.id = userInfo.id
    profileForm.username = userInfo.username
    profileForm.email = userInfo.email
    profileForm.createTime = userInfo.createTime
    // 更新显示的用户名
    username.value = userInfo.username
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

// 菜单命令处理
const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await userStore.logout()
        ElMessage({
          type: 'success',
          message: '退出登录成功'
        })
      } catch (error) {
        ElMessage({
          type: 'error',
          message: error.message || '退出登录失败'
        })
      }
    }).catch(() => {})
  } else if (command === 'profile') {
    // 先尝试重新获取最新的用户信息
    fetchUserInfo().then(() => {
      // 打开个人信息弹窗
      profileDialogVisible.value = true
    }).catch(() => {
      // 如果获取失败，使用当前 store 中的信息
      profileForm.id = userStore.userId
      profileForm.username = userStore.username
      profileForm.email = userStore.email
      profileForm.createTime = userStore.createTime
      profileDialogVisible.value = true
    })
  }
}

// 提交个人信息表单
const submitProfile = () => {
  if (!profileFormRef.value) return

  profileFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await userStore.updateUserInfo({
          id: profileForm.id,
          username: profileForm.username,
          email: profileForm.email
        })

        // 更新显示的用户名
        username.value = profileForm.username

        ElMessage({
          type: 'success',
          message: '个人信息更新成功'
        })
        profileDialogVisible.value = false
      } catch (error) {
        ElMessage({
          type: 'error',
          message: error.message || '个人信息更新失败'
        })
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 打开修改密码弹窗
const openPasswordDialog = () => {
  // 重置表单
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''

  // 打开弹窗
  passwordDialogVisible.value = true

  // 关闭个人信息弹窗
  profileDialogVisible.value = false
}

// 提交修改密码表单
const submitPassword = () => {
  if (!passwordFormRef.value) return

  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await userStore.updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })

        ElMessage({
          type: 'success',
          message: '密码修改成功'
        })

        // 关闭弹窗
        passwordDialogVisible.value = false

        // 提示用户重新登录
        ElMessageBox.confirm(
            '密码已修改成功，需要重新登录，是否立即跳转到登录页？',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'info'
            }
        ).then(() => {
          // 清除登录信息并跳转到登录页
          userStore.logout()
        }).catch(() => {})

      } catch (error) {
        ElMessage({
          type: 'error',
          message: error.message || '密码修改失败'
        })
      } finally {
        passwordLoading.value = false
      }
    }
  })
}
</script>

<style>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .header {
    background-color: #409EFF;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .logo {
      h1 {
        margin: 0;
        font-size: 22px;
      }
    }

    .user-info {
      .dropdown-link {
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }

  .main-container {
    flex: 1;
    overflow: hidden;

    /* 侧边栏样式 */
    .sidebar {
      background-color: #fff;
      border-right: 1px solid #e6e6e6;
      transition: width 0.3s;

      &.is-collapsed {
        width: 64px !important;
      }

      .session-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #e6e6e6;
        font-weight: bold;
      }

      .session-menu {
        border-right: none;

        .session-item {
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .session-title {
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .session-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }

      .pagination-container {
        padding: 10px 0;
        display: flex;
        justify-content: center;
        border-top: 1px solid #e6e6e6;
      }
    }

    .main {
      padding: 20px;
      overflow-y: auto;
      background-color: #f5f7fa;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 60px);

      .consultation-card {
        border-radius: 8px;
        background: #fff;
        width: 1000px;
        border: 1px solid #ebeef5;
        margin: 20px auto;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        .consultation-input {
          width: 100%;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>