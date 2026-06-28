<template>
  <view class="login-page">
    <!-- 背景蒸汽效果 -->
    <view class="steam-bg">
      <view class="steam steam-1"></view>
      <view class="steam steam-2"></view>
      <view class="steam steam-3"></view>
    </view>
    
    <!-- 顶部装饰 -->
    <view class="top-deco">
      <image class="hotpot-img" src="https://picsum.photos/seed/hotpot1/400/300" mode="aspectFill"></image>
      <view class="gradient-mask"></view>
    </view>
    
    <!-- Logo 区域 -->
    <view class="logo-section">
      <view class="logo-wrapper">
        <text class="logo-emoji">🍲</text>
        <view class="logo-glow"></view>
      </view>
      <text class="brand-name">火锅拼桌</text>
      <text class="brand-slogan">一个人也能吃火锅</text>
    </view>
    
    <!-- 登录区域 -->
    <view class="login-section">
      <view class="login-card">
        <!-- 微信登录 -->
        <view class="login-btn primary-btn" @click="handleWechatLogin">
          <view class="btn-content">
            <text class="btn-text">微信登录</text>
            <text class="btn-arrow">→</text>
          </view>
        </view>
        
        <!-- 分割线 -->
        <view class="divider-line">
          <view class="line"></view>
          <text class="divider-text">或</text>
          <view class="line"></view>
        </view>
        
        <!-- 手机号登录 -->
        <view class="login-btn secondary-btn" @click="goToPhoneLogin">
          <text class="btn-text">手机号登录</text>
        </view>
      </view>
      
      <!-- 协议 -->
      <view class="agreement-box">
        <text class="agreement-text">登录即同意</text>
        <text class="link" @click="showUserAgreement">用户协议</text>
        <text class="agreement-text">及</text>
        <text class="link" @click="showPrivacy">隐私政策</text>
      </view>
    </view>
    
    <!-- 底部装饰 -->
    <view class="bottom-deco">
      <text class="deco-text">已有 <text class="highlight">10000+</text> 人成功拼桌</text>
    </view>
    
    <LoadingOverlay :visible="loading" text="登录中..." />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { wechatLogin } from '@/api/api';
import { setToken, setUserInfo } from '@/utils/auth';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const loading = ref(false);

// 微信登录 - 使用假数据
const handleWechatLogin = async (e: any) => {
  loading.value = true;
  
  try {
    // 模拟 API 请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 假数据 - 已完善资料的用户
    const mockUserInfo = {
      id: 'user_001',
      nickname: '火锅达人',
      avatar: 'https://picsum.photos/200',
      phone: '138****8888',
      gender: 'male' as const,
      age: 28,
      tags: ['重庆火锅', '麻辣', '吃货交友'],
      intro: '超爱吃火锅，寻找志同道合的火锅伙伴！',
      balance: 100,
      matchCount: 5,
      isProfileComplete: true,
    };
    
    const mockToken = 'mock_token_' + Date.now();
    
    // 保存登录信息
    setToken(mockToken);
    setUserInfo(mockUserInfo);
    
    uni.showToast({
      title: '登录成功',
      icon: 'success',
    });
    
    // 跳转到主页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/tabBar/match',
      });
    }, 1500);
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};

// 跳转手机号登录
const goToPhoneLogin = () => {
  uni.navigateTo({
    url: '/pages/login/phoneLogin',
  });
};

// 显示隐私政策
const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '这里是隐私政策内容...',
    showCancel: false,
  });
};

// 显示用户协议
const showUserAgreement = () => {
  uni.showModal({
    title: '用户协议',
    content: '这里是用户协议内容...',
    showCancel: false,
  });
};
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  background: #0D0D0D;
  overflow: hidden;
}

// 蒸汽背景
.steam-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  .steam {
    position: absolute;
    background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    animation: steam-rise 8s ease-in-out infinite;
  }
  
  .steam-1 {
    width: 300rpx;
    height: 400rpx;
    left: 10%;
    bottom: -200rpx;
    animation-delay: 0s;
  }
  
  .steam-2 {
    width: 250rpx;
    height: 350rpx;
    right: 15%;
    bottom: -200rpx;
    animation-delay: 2.5s;
  }
  
  .steam-3 {
    width: 280rpx;
    height: 380rpx;
    left: 50%;
    transform: translateX(-50%);
    bottom: -200rpx;
    animation-delay: 5s;
  }
}

// 顶部装饰
.top-deco {
  position: relative;
  width: 100%;
  height: 500rpx;
  overflow: hidden;
  
  .hotpot-img {
    width: 100%;
    height: 100%;
    opacity: 0.15;
    filter: blur(2rpx);
  }
  
  .gradient-mask {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 300rpx;
    background: linear-gradient(to bottom, transparent, #0D0D0D);
  }
}

// Logo区域
.logo-section {
  position: relative;
  text-align: center;
  margin-top: -180rpx;
  margin-bottom: 100rpx;
  z-index: 2;
  
  .logo-wrapper {
    position: relative;
    width: 180rpx;
    height: 180rpx;
    margin: 0 auto 40rpx;
    
    .logo-emoji {
      position: relative;
      font-size: 120rpx;
      z-index: 2;
      display: block;
      animation: float-gentle 3s ease-in-out infinite;
    }
    
    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200rpx;
      height: 200rpx;
      background: radial-gradient(circle, rgba(255, 107, 61, 0.3), transparent 70%);
      animation: glow-pulse 2s ease-in-out infinite;
    }
  }
  
  .brand-name {
    display: block;
    font-size: 60rpx;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 16rpx;
    letter-spacing: 2rpx;
  }
  
  .brand-slogan {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 400;
  }
}

// 登录区域
.login-section {
  padding: 0 50rpx;
  margin-bottom: 80rpx;
  
  .login-card {
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(20rpx);
    border-radius: 32rpx;
    padding: 50rpx 40rpx 40rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.4);
    border: 1rpx solid rgba(255, 255, 255, 0.05);
  }
  
  .login-btn {
    height: 96rpx;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 32rpx;
    font-weight: 500;
    
    &:active {
      transform: scale(0.97);
    }
  }
  
  .primary-btn {
    background: linear-gradient(135deg, #FF6B3D 0%, #E5533D 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 61, 0.35);
    margin-bottom: 32rpx;
    
    .btn-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0 30rpx;
    }
    
    .btn-text {
      color: #FFFFFF;
    }
    
    .btn-arrow {
      font-size: 40rpx;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 300;
    }
  }
  
  .divider-line {
    display: flex;
    align-items: center;
    margin: 32rpx 0;
    
    .line {
      flex: 1;
      height: 1rpx;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .divider-text {
      padding: 0 24rpx;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.3);
    }
  }
  
  .secondary-btn {
    background: transparent;
    border: 1rpx solid rgba(255, 255, 255, 0.15);
    
    .btn-text {
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  .agreement-box {
    text-align: center;
    margin-top: 40rpx;
    line-height: 40rpx;
    
    .agreement-text {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.3);
    }
    
    .link {
      font-size: 22rpx;
      color: #FF6B3D;
      margin: 0 6rpx;
    }
  }
}

// 底部装饰
.bottom-deco {
  position: fixed;
  bottom: 80rpx;
  left: 0;
  right: 0;
  text-align: center;
  
  .deco-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.25);
    
    .highlight {
      color: #FF6B3D;
      font-weight: 600;
    }
  }
}

// 动画
@keyframes steam-rise {
  0% {
    bottom: -200rpx;
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.3;
  }
  100% {
    bottom: 100%;
    opacity: 0;
  }
}

@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12rpx);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>
