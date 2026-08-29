<template>
  <view class="login-page">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <image class="logo-img" :src="logoImg" ></image>
      <text class="brand-name">月最新</text>
    </view>
    
    <!-- 登录按钮 -->
    <view class="login-btn-wrapper">
      <view class="login-btn" @click="handleWechatLogin">
        <text class="btn-text">快捷登录</text>
      </view>
      <text class="register-hint" @click="goToPhoneLogin">使用验证码登录</text>

      <!-- 用户协议 -->
      <view class="agreement-box" @click="toggleAgreement">
        <view class="checkbox" :class="{ checked: agreed }">
          <text v-if="agreed" class="check-icon">✓</text>
        </view>
        <text class="agreement-text">已阅读并同意</text>
        <text class="link" @click.stop="showUserAgreement">用户协议</text>
        <text class="agreement-text">和</text>
        <text class="link" @click.stop="showPrivacy">隐私政策</text>
      </view>
    </view>

    <LoadingOverlay :visible="loading" text="登录中..." />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import logoImg from '@/static/imgs/logo@3x.png';
import { isLogin, isProfileComplete, setToken, setUserInfo, setProfileComplete } from '@/utils/auth';
import { wechatLogin } from '@/api/api';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const loading = ref(false);
const agreed = ref(false);

// 切换协议勾选
const toggleAgreement = () => {
  agreed.value = !agreed.value;
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

// 已登录 -> 未完善资料则去完善页，已完善则去首页
onLoad(() => {
  if (isLogin()) {
    if (!isProfileComplete()) {
      uni.redirectTo({ url: '/pages/profile/complete' });
    } else {
      uni.switchTab({ url: '/pages/tabBar/match' });
    }
  }
});

// 微信快捷登录
const handleWechatLogin = async () => {
  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
    });
    return;
  }

  loading.value = true;

  try {
    // 1. 调用微信登录接口获取 code
    const loginRes = await uni.login({
      provider: 'weixin',
    });

    if (!loginRes.code) {
      throw new Error('获取微信授权失败');
    }

    // 2. 用 code 换取 token 和用户信息
    const result = await wechatLogin({ code: loginRes.code });

    // 3. 保存认证信息
    setToken(result.token);
    setUserInfo(result.miniUserInfo);
    setProfileComplete(false);

    uni.showToast({
      title: '登录成功',
      icon: 'success',
    });

    // 4. 跳转到完善资料页
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/profile/complete',
      });
    }, 1500);
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};

// 跳转验证码登录/注册
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

  // 用户协议
  .agreement-box {
    display: flex;
    align-items: center;
    margin-top: 40rpx;

    .checkbox {
      width: 32rpx;
      height: 32rpx;
      border: 2rpx solid #CCCCCC;
      border-radius: 50%;
      margin-right: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.checked {
        background: #000000;
        border-color: #000000;
      }

      .check-icon {
        font-size: 20rpx;
        color: #FFFFFF;
      }
    }

    .agreement-text {
      font-size: 24rpx;
      color: #666666;
    }

    .link {
      font-size: 24rpx;
      color: #1890FF;
      margin: 0 4rpx;
    }
  }
}
</style>
