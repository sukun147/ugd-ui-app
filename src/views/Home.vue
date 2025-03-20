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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const username = ref('sukun147')
const consultationQuery = ref('')

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      ElMessage({
        type: 'success',
        message: '退出登录成功'
      })
      router.push('/login')
    }).catch(() => {})
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    router.push('/settings')
  }
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
</style>
