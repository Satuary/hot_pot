<template>
  <view class="login-page">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <image class="logo-img" :src="logoImg" ></image>
      <text class="brand-name">月最近火锅</text>
    </view>
    
    <!-- 登录按钮 -->
    <view class="login-btn-wrapper">
      <view class="login-btn" @click="goToPhoneLogin">
        <text class="btn-text">快捷登录</text>
      </view>
      <text class="register-hint">登录即注册</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import logoImg from '@/static/imgs/logo@3x.png';

// 跳转手机号登录
const goToPhoneLogin = () => {
  uni.navigateTo({
    url: '/pages/login/phoneLogin',
  });
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 60rpx;
}

// Logo区域
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 280rpx;
  
  .logo-img {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 30rpx;
  }
  
  .brand-name {
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    letter-spacing: 4rpx;
  }
}

// 登录按钮区域
.login-btn-wrapper {
  margin-top: 200rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .login-btn {
    width: 100%;
    height: 96rpx;
    background: #000000;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:active {
      opacity: 0.9;
    }
    
    .btn-text {
      font-size: 32rpx;
      color: #FFFFFF;
      font-weight: 500;
    }
  }
  
  .register-hint {
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #999999;
  }
}
</style>
