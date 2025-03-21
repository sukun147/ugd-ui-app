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
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '260px'" class="sidebar">
        <div class="session-header">
          <span v-show="!isCollapse">历史会话</span>
          <el-button
              type="primary"
              link
              class="collapse-btn"
              @click="isCollapse = !isCollapse"
          >
            <el-icon>
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </el-button>
        </div>
        <div class="session-container">
          <el-menu
              class="session-menu"
              :collapse="isCollapse"
          >
            <el-menu-item
                v-for="session in sessionList"
                :key="session.id"
                :index="String(session.id)"
                @click="selectSession(session)"
            >
              <el-icon><ChatDotRound /></el-icon>
              <template #title>
                <div class="session-item-content">
                <span class="session-title" :title="session.title">
                  {{ session.title }}
                </span>
                  <el-dropdown
                      trigger="click"
                      @click.stop
                      v-if="!isCollapse"
                  >
                    <el-button
                        type="primary"
                        link
                        class="session-more-btn"
                        @click.stop
                    >
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="startEditTitle(session, $event)">
                          <el-icon><Edit /></el-icon>
                          编辑标题
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleDeleteSession(session)">
                          <el-icon><Delete /></el-icon>
                          删除会话
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>

      <!-- 标题编辑对话框 -->
      <el-dialog
          v-model="editingSession"
          title="编辑会话标题"
          width="400px"
          :show-close="true"
          :close-on-click-modal="false"
      >
        <el-input
            v-model="editingTitle"
            placeholder="请输入新的会话标题"
            maxlength="50"
            show-word-limit
        />
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="editingSession = null">取消</el-button>
          <el-button
              type="primary"
              @click="handleUpdateSessionTitle(editingSession)"
          >
            确认
          </el-button>
        </span>
        </template>
      </el-dialog>

      <el-main class="main">
        <!-- 无选中会话时显示默认问诊输入框 -->
        <div v-if="!currentSession" class="consultation-center">
          <el-card class="consultation-card">
            <div class="consultation-input">
              <el-input
                  v-model="consultationQuery"
                  type="textarea"
                  :rows="6"
                  placeholder="例如：我最近感觉头晕、疲惫，有时会出现轻微头痛，这可能是什么原因引起的？"
                  resize="none"
                  @keyup.enter.ctrl="handleSendQuestion"
              />
              <div class="consultation-footer">
                <span class="input-tip">按 Ctrl + Enter 发送</span>
                <el-button
                    type="primary"
                    :loading="sending"
                    @click="handleSendQuestion"
                >
                  发送提问
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 有选中会话时显示问答列表和输入框 -->
        <div v-else class="qa-container">
          <!-- 头部 -->
          <div class="qa-header">
            <span class="qa-title">会话记录</span>
            <el-button type="primary" link @click="handleNewChat">
              <el-icon><Plus /></el-icon>新对话
            </el-button>
          </div>

          <!-- 聊天内容区域 -->
          <div class="qa-content">
            <div class="qa-list" ref="qaListRef">
              <div v-if="loadingQA" class="loading-container">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>加载中...</span>
              </div>
              <template v-else>
                <div v-if="qaList.length === 0" class="no-data">
                  <el-empty description="暂无对话记录" />
                </div>
                <div v-else v-for="qa in qaList" :key="qa.id" class="qa-item">
                  <!-- 问题消息（右侧） -->
                  <div class="message-item right">
                    <div class="content">
                      <div class="bubble">{{ qa.question }}</div>
                      <div class="time">{{ formatTime(qa.createTime) }}</div>
                    </div>
                  </div>
                  <!-- 回答消息（左侧） -->
                  <div class="message-item left">
                    <div class="content">
                      <div class="bubble">{{ qa.answer }}</div>
                      <div class="time">{{ formatTime(qa.createTime) }}</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- 底部输入框 -->
          <div class="qa-input-container">
            <div class="qa-input-wrapper">
              <el-input
                  v-model="questionInput"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入您的问题..."
                  resize="none"
                  @keyup.enter.ctrl="handleSendQuestionInSession"
              />
              <div class="qa-input-footer">
                <span class="qa-input-tip">按 Ctrl + Enter 发送</span>
                <el-button
                    type="primary"
                    :loading="sending"
                    @click="handleSendQuestionInSession"
                >
                  发送
                </el-button>
              </div>
            </div>
          </div>
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
import {ref, reactive, onMounted, nextTick} from 'vue'
import {ChatDotRound, Delete, Edit, Loading, MoreFilled, Plus} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {getUserSessions, getSessionDetail, getUserSession, updateSession, deleteSession} from '@/api/user'
import { createQA } from '@/api/qa'

const userStore = useUserStore()

const username = ref(userStore.username || '')

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

// 会话列表相关状态变量
const sessionList = ref([])           // 会话列表数据
const sessionTotal = ref(0)           // 会话总数
const pageNo = ref(1)                 // 当前页码
const pageSize = ref(10)              // 每页数量改回10
const isCollapse = ref(false)         // 侧边栏是否折叠
const isLoading = ref(false)          // 是否正在加载数据
const noMore = ref(false)             // 是否还有更多数据
const currentSession = ref(null)      // 当前选中的会话
const qaList = ref([])                // 问答列表
const loadingQA = ref(false)          // 加载问答列表状态
const consultationQuery = ref('')     // 首页问诊输入
const questionInput = ref('')         // 会话内问题输入
const sending = ref(false)            // 发送状态

const editingSession = ref(null) // 当前正在编辑的会话
const editingTitle = ref('') // 编辑中的标题

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
      validator: (value, callback) => {
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
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

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

/**
 * 获取会话列表数据
 * 采用追加模式，新数据会添加到现有列表末尾
 */
const fetchSessionList = async () => {
  // 如果正在加载或没有更多数据，直接返回
  if (isLoading.value || noMore.value) return

  try {
    isLoading.value = true
    // 调用API获取会话数据
    const response = await getUserSessions({
      pageNo: pageNo.value,
      pageSize: pageSize.value
    })

    // 将新获取的会话追加到现有列表中
    sessionList.value = [...sessionList.value, ...response.data.list]
    sessionTotal.value = response.data.total

    // 检查是否还有更多数据可以加载
    noMore.value = sessionList.value.length >= sessionTotal.value

    // 页码加1，为下次加载做准备
    pageNo.value++
  } catch (error) {
    ElMessage.error('获取会话列表失败')
    console.error('获取会话列表失败:', error)
  } finally {
    // 无论成功失败，都将加载状态设为false
    isLoading.value = false
  }
}

/**
 * 获取会话详情（问答列表）
 * @param {Object} session 会话对象
 */
const fetchSessionDetail = async (session) => {
  if (!session || !session.id) return

  loadingQA.value = true
  try {
    const response = await getSessionDetail( session.id)
    if (response.code === 0 && response.data) {
      qaList.value = response.data
    } else {
      ElMessage.error(response.msg || '获取会话详情失败')
    }
  } catch (error) {
    console.error('获取会话详情失败:', error)
    ElMessage.error('获取会话详情失败')
  } finally {
    loadingQA.value = false
  }
}

/**
 * 选择会话
 * @param {Object} session 会话对象
 */
const selectSession = async (session) => {
  currentSession.value = session
  // 清空当前问答列表
  qaList.value = []
  // 获取新的问答列表
  await fetchSessionDetail(session)
}

/**
 * 处理新对话按钮点击
 */
const handleNewChat = () => {
  currentSession.value = null
  qaList.value = []
  consultationQuery.value = ''
  questionInput.value = ''
}

/**
 * 更新会话列表
 * @param {Object} newSession - 新会话对象
 */
const updateSessionList = (newSession) => {
    sessionList.value.unshift(newSession)
}

/**
 * 发送问题（首页）
 */
const handleSendQuestion = async () => {
  if (!consultationQuery.value.trim()) {
    ElMessage.warning('请输入问题内容')
    return
  }

  sending.value = true
  try {
    const response = await createQA({
      question: consultationQuery.value.trim(),
      sessionId: null // 首页使用 null 作为会话ID
    })

    if (response.code === 0 && response.data) {
      const newQA = response.data

      // 如果返回的数据中包含会话信息，则切换到该会话
      if (newQA.sessionId) {
        // 构造会话对象
        const response = (await getUserSession(newQA.sessionId))

        // 更新会话列表
        updateSessionList(response.data)

        // 切换到新会话
        await selectSession(response.data)

        // 清空首页输入框
        consultationQuery.value = ''

        // 滚动到最新消息
        await nextTick(() => {
          const qaListEl = document.querySelector('.qa-list')
          if (qaListEl) {
            qaListEl.scrollTop = qaListEl.scrollHeight
          }
        })

        ElMessage.success('问题已发送')
      } else {
        ElMessage.warning('创建会话失败')
      }
    } else {
      ElMessage.error(response.msg || '发送失败')
    }
  } catch (error) {
    console.error('发送问题失败:', error)
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

/**
 * 发送问题（会话内）
 */
const handleSendQuestionInSession = async () => {
  if (!questionInput.value.trim()) {
    ElMessage.warning('请输入问题内容')
    return
  }

  if (!currentSession.value?.id) {
    ElMessage.warning('当前会话异常')
    return
  }

  sending.value = true
  try {
    const response = await createQA({
      question: questionInput.value.trim(),
      sessionId: currentSession.value.id
    })

    if (response.code === 0 && response.data) {
      // 清空输入框
      questionInput.value = ''
      // 添加到问答列表
      qaList.value.push(response.data)
      // 滚动到最新消息
      await nextTick(() => {
        const qaListEl = document.querySelector('.qa-list')
        if (qaListEl) {
          qaListEl.scrollTop = qaListEl.scrollHeight
        }
      })
      ElMessage.success('问题已发送')
    } else {
      ElMessage.error(response.msg || '发送失败')
    }
  } catch (error) {
    console.error('发送问题失败:', error)
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}


// 组件挂载时初始化数据
onMounted(async () => {
  try {
    if (userStore.isLoggedIn) {
      await fetchUserInfo()
      // 重置分页相关状态
      sessionList.value = []        // 清空会话列表
      pageNo.value = 1             // 重置页码
      noMore.value = false         // 重置更多数据标志
      await fetchSessionList()      // 获取第一页数据
    }
  } catch (error) {
    console.error('初始化失败', error)
  }
})

/**
 * 处理会话标题更新
 */
const handleUpdateSessionTitle = async (session) => {
  if (!editingTitle.value.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }

  try {
    const response = await updateSession({
      id: session.id,
      title: editingTitle.value.trim()
    })

    if (response.code === 0 && response.data) {
      // 更新本地会话列表
      const index = sessionList.value.findIndex(s => s.id === session.id)
      if (index !== -1) {
        sessionList.value[index] = {
          ...session,
          title: editingTitle.value.trim(),
          updateTime: new Date().toISOString()
        }
      }

      // 如果是当前选中的会话，也要更新currentSession
      if (currentSession.value?.id === session.id) {
        currentSession.value = {
          ...currentSession.value,
          title: editingTitle.value.trim()
        }
      }

      ElMessage.success('标题已更新')
      editingSession.value = null // 关闭编辑状态
    } else {
      ElMessage.error(response.msg || '更新失败')
    }
  } catch (error) {
    console.error('更新会话标题失败:', error)
    ElMessage.error('更新失败')
  }
}

/**
 * 打开编辑标题
 */
const startEditTitle = (session, event) => {
  event.stopPropagation() // 阻止事件冒泡，防止触发选中会话
  editingSession.value = session
  editingTitle.value = session.title
}

// 处理删除会话的方法
const handleDeleteSession = async (session) => {
  try {
    // 显示删除确认对话框
    await ElMessageBox.confirm('确定要删除此会话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用删除会话的API
    const response = await deleteSession(session.id)

    // 处理API响应
    if (response.code === 0 && response.data === true) {
      // 删除成功，显示成功提示
      ElMessage.success('会话删除成功')
      // 从会话列表中移除被删除的会话
      sessionList.value = sessionList.value.filter(item => item.id !== session.id)
      // 如果删除的是当前选中的会话，清除当前会话
      if (currentSession.value?.id === session.id) {
        currentSession.value = null
      }
    } else {
      // 删除失败，显示错误信息
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    // 如果用户取消删除操作，直接返回
    if (error === 'cancel') {
      return
    }
    // 处理其他错误情况
    console.error('删除会话失败:', error)
    ElMessage.error('删除会话失败')
  }
}
</script>

<style>
/* 布局容器样式 */
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部样式 */
.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  height: 40px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }
}

/* 主容器样式 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e6e6e6;
    font-weight: 500;
    font-size: 16px;
    color: #333;

    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 8px;
    }

    .collapse-btn {
      height: 32px;
      width: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background-color: #f0f2f5;
      }

    }
  }

  .session-container {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(144, 147, 153, 0.3);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }

  .session-menu {
    border-right: none;
  }
}

/* 会话项内容布局 */
.session-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

/* 会话标题样式 */
.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #333;
  margin-right: 8px;
}

/* 更多按钮样式 */
.session-more-btn {
  padding: 4px 8px;
  font-size: 16px;
  opacity: 0;
  transition: all 0.2s ease;
  border-radius: 4px;
  color: #606266;
  margin-left: 4px;

  &:hover {
    background-color: #f0f0f0;
    color: #409eff;
  }

}

/* 在会话项hover时显示更多按钮 */
.el-menu-item:hover .session-more-btn {
  opacity: 1;
}

/* 主区域样式 */
.main {
  flex: 1;
  overflow: hidden;
  background-color: #f5f7fa;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 问诊中心样式 */
.consultation-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  .consultation-card {
    width: 800px;
    max-width: calc(100% - 40px);
    margin: 0 auto;

  }

  .consultation-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 0 4px;

    .input-tip {
      color: #909399;
      font-size: 13px;
      background-color: #f5f7fa;
      padding: 4px 12px;
      border-radius: 4px;
    }

  }
}

/* QA容器样式 */
.qa-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #fff;
}

/* 头部样式 */
.qa-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
  flex-shrink: 0;

  .qa-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

}

/* 内容区域样式 */
.qa-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 列表区域样式 */
.qa-list {
  height: 100%;
  overflow-y: auto;
  padding: 24px 24px 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(144, 147, 153, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

/* 问答项样式 */
.qa-item {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 24px;
  }
}

/* 消息样式 */
.message-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  .content {
    max-width: 70%;

    .bubble {
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.6;
      word-break: break-word;
      font-size: 14px;
      white-space: pre-wrap;
    }

    .time {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      padding: 0 4px;
    }
  }

  &.right {
    justify-content: flex-end;

    .content {
      margin-left: 20%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .bubble {
        background-color: #409eff;
        color: #fff;
        border-top-right-radius: 4px;
      }

      .time {
        text-align: right;
      }
    }
  }

  &.left {
    justify-content: flex-start;

    .content {
      margin-right: 20%;

      .bubble {
        background-color: #fff;
        color: #333;
        border-top-left-radius: 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }
    }
  }
}

/* 输入区域样式 */
.qa-input-container {
  border-top: 1px solid #e6e6e6;
  background-color: #fff;
  padding: 16px 24px;
  flex-shrink: 0;
}

.qa-input-wrapper {
  max-width: 800px;
  margin: 0 auto;

}

.qa-input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 0 4px;

  .qa-input-tip {
    color: #909399;
    font-size: 13px;
    background-color: #f5f7fa;
    padding: 4px 12px;
    border-radius: 4px;
  }
}

/* 加载和空状态样式 */
.loading-container,
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;

}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .consultation-center {
    padding: 16px;

    .consultation-card {
      max-width: calc(100% - 32px);
    }
  }

  .qa-input-container {
    padding: 12px 16px;
  }

  .message-item .content {
    max-width: 85%;
  }

}
</style>