<template>
  <view class="me-page">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-inner">
        <text class="nav-title">我的</text>
        <view class="nav-right">
          <view class="settings-btn" @click="goSettings">
            <text class="icon">⚙️</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 主内容 -->
    <scroll-view scroll-y class="main-scroll" :style="{ paddingTop: (statusBarHeight + 88) + 'px' }">
      <!-- 个人信息卡片 -->
      <view class="profile-section">
        <view class="profile-header" @click="goEditProfile">
          <image
            :src="userInfo.avatar || 'https://picsum.photos/200'"
            class="profile-avatar"
            mode="aspectFill"
          ></image>
          <view class="profile-info">
            <text class="profile-name">{{ userInfo.nickname || '未登录' }}</text>
            <text class="profile-desc">{{ getProfileDesc }}</text>
          </view>
          <text class="edit-icon">→</text>
        </view>
        
        <!-- 余额卡 -->
        <view class="balance-box">
          <view class="balance-item">
            <text class="balance-label">余额</text>
            <text class="balance-value">¥{{ (userInfo.balance || 0).toFixed(2) }}</text>
          </view>
          <view class="balance-divider"></view>
          <view class="balance-item">
            <text class="balance-label">拼桌次数</text>
            <text class="balance-value">{{ userInfo.matchCount || 0 }}</text>
          </view>
        </view>
        
        <!-- 快捷操作 -->
        <view class="quick-actions">
          <view class="quick-btn" @click="goRecharge">
            <text class="quick-icon">💰</text>
            <text class="quick-label">充值</text>
          </view>
          <view class="quick-btn" @click="goTransactionHistory">
            <text class="quick-icon">📝</text>
            <text class="quick-label">明细</text>
          </view>
          <view class="quick-btn">
            <text class="quick-icon">⭐</text>
            <text class="quick-label">评价</text>
          </view>
          <view class="quick-btn">
            <text class="quick-icon">💬</text>
            <text class="quick-label">客服</text>
          </view>
        </view>
      </view>
      
      <!-- 功能菜单 -->
      <view class="menu-group">
        <view class="menu-title">账户管理</view>
        <view class="menu-list">
          <view class="menu-row" @click="goEditProfile">
            <view class="menu-left">
              <text class="menu-emoji">📝</text>
              <text class="menu-label">编辑资料</text>
            </view>
            <text class="menu-arrow">→</text>
          </view>
          <view class="menu-row" @click="goTransactionHistory">
            <view class="menu-left">
              <text class="menu-emoji">📊</text>
              <text class="menu-label">使用明细</text>
            </view>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-title">更多</view>
        <view class="menu-list">
          <view class="menu-row">
            <view class="menu-left">
              <text class="menu-emoji">❓</text>
              <text class="menu-label">帮助中心</text>
            </view>
            <text class="menu-arrow">→</text>
          </view>
          <view class="menu-row" @click="goAbout">
            <view class="menu-left">
              <text class="menu-emoji">ℹ️</text>
              <text class="menu-label">关于我们</text>
            </view>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>
      
      <!-- 退出登录 -->
      <view class="logout-section">
        <view class="logout-btn" @click="handleLogout">
          <text class="logout-text">退出登录</text>
        </view>
      </view>
      
      <view class="bottom-pad"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getUserInfo, clearAuth } from '@/utils/auth';

const statusBarHeight = ref(0);
const userInfo = ref<any>({});

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
  
  // 加载用户信息
  const info = getUserInfo();
  if (info) {
    userInfo.value = info;
  }
});

// 个人简介
const getProfileDesc = computed(() => {
  if (!userInfo.value.intro) {
    return '点击编辑个人资料';
  }
  return userInfo.value.intro;
});

// 编辑资料
const goEditProfile = () => {
  uni.navigateTo({
    url: '/subPack/me/editProfile',
  });
};

// 充值
const goRecharge = () => {
  uni.navigateTo({
    url: '/subPack/me/recharge',
  });
};

// 交易明细
const goTransactionHistory = () => {
  uni.navigateTo({
    url: '/subPack/me/transactionHistory',
  });
};

// 设置
const goSettings = () => {
  uni.navigateTo({
    url: '/subPack/me/settings',
  });
};

// 关于我们
const goAbout = () => {
  uni.navigateTo({
    url: '/subPack/me/about',
  });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmText: '退出',
    confirmColor: '#FF4D4F',
    success: (res) => {
      if (res.confirm) {
        // 清除认证信息
        clearAuth();
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login',
        });
      }
    },
  });
};
</script>

<style lang="scss" scoped>
.me-page {
  min-height: 100vh;
  background: #0D0D0D;
}

// 导航栏
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  
  .navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 40rpx;
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #FFFFFF;
  }
  
  .nav-right {
    .settings-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .icon {
        font-size: 36rpx;
      }
    }
  }
}

// 主滚动区
.main-scroll {
  height: 100vh;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

// 个人信息区域
.profile-section {
  margin: 30rpx 40rpx 40rpx;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.03);
  border: 1rpx solid rgba(255, 255, 255, 0.05);
  border-radius: 24rpx;
  
  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    
    &:active {
      opacity: 0.8;
    }
  }
  
  .profile-avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 107, 61, 0.3);
    margin-right: 24rpx;
  }
  
  .profile-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }
  
  .profile-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #FFFFFF;
  }
  
  .profile-desc {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.4);
  }
  
  .edit-icon {
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 300;
  }
  
  // 余额卡
  .balance-box {
    display: flex;
    align-items: center;
    padding: 28rpx 0;
    margin-bottom: 28rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.05);
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  }
  
  .balance-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
  }
  
  .balance-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.4);
  }
  
  .balance-value {
    font-size: 32rpx;
    font-weight: 600;
    color: #FFB946;
  }
  
  .balance-divider {
    width: 1rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.08);
  }
  
  // 快捷操作
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
  }
  
  .quick-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx 0;
    transition: all 0.2s;
    
    &:active {
      transform: scale(0.95);
    }
    
    .quick-icon {
      font-size: 44rpx;
    }
    
    .quick-label {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// 功能菜单组
.menu-group {
  margin: 0 40rpx 32rpx;
  
  .menu-title {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 20rpx;
    padding-left: 4rpx;
  }
  
  .menu-list {
    background: rgba(255, 255, 255, 0.03);
    border: 1rpx solid rgba(255, 255, 255, 0.05);
    border-radius: 20rpx;
    overflow: hidden;
  }
  
  .menu-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 28rpx;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.03);
    transition: all 0.2s;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background: rgba(255, 255, 255, 0.05);
    }
  }
  
  .menu-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }
  
  .menu-emoji {
    font-size: 36rpx;
  }
  
  .menu-label {
    font-size: 28rpx;
    color: #FFFFFF;
  }
  
  .menu-arrow {
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 300;
  }
}

// 退出登录
.logout-section {
  margin: 40rpx 40rpx 0;
  
  .logout-btn {
    padding: 32rpx;
    background: rgba(255, 77, 79, 0.08);
    border: 1rpx solid rgba(255, 77, 79, 0.15);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:active {
      background: rgba(255, 77, 79, 0.12);
    }
    
    .logout-text {
      font-size: 28rpx;
      color: #FF4D4F;
      font-weight: 500;
    }
  }
}

.bottom-pad {
  height: 60rpx;
}
</style>
