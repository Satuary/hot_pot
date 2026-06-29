<template>
  <view class="login-page">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <image class="logo-img" :src="logoImg" ></image>
      <text class="brand-name">月最近火锅</text>
    </view>
    
    <!-- 登录按钮 -->
    <view class="login-btn-wrapper">
      <view class="login-btn" @click="handleWechatLogin">
        <text class="btn-text">快捷登录</text>
      </view>
      <text class="register-hint" @click="goToPhoneLogin">使用验证码登录</text>
    </view>

    <LoadingOverlay :visible="loading" text="登录中..." />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import logoImg from '@/static/imgs/logo@3x.png';
import { isLogin, setToken, setUserInfo } from '@/utils/auth';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const loading = ref(false);

// 已登录则直接跳转首页，防止刷新后停留在登录页
onLoad(() => {
  if (isLogin()) {
    uni.switchTab({ url: '/pages/tabBar/match' });
  }
});

// 模拟后端返回的登录数据（后续接入真实 API 后替换）
const mockLoginApi = async (_code: string) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    token: 'mock_token_' + Date.now(),
    userInfo: {
      id: 'user_001',
      nickname: '火锅爱好者',
      avatar: 'https://picsum.photos/200',
      gender: 'male' as const,
      age: 28,
      tags: ['海底捞', '麻辣', '无肉不欢'],
      intro: '喜欢和朋友们一起吃火锅',
      balance: 100,
      matchCount: 5,
      isProfileComplete: true,
    },
  };
};

// 微信快捷登录
const handleWechatLogin = async () => {
  loading.value = true;

  try {
    // 1. 调用微信登录接口获取 code
    const loginRes = await uni.login({
      provider: 'weixin',
    });

    if (!loginRes.code) {
      throw new Error('获取微信授权失败');
    }

    // 2. 模拟后端接口：用 code 换取 token 和用户信息
    //    正式环境替换为: const result = await wechatLogin({ code: loginRes.code });
    const result = await mockLoginApi(loginRes.code);

    // 3. 保存认证信息
    setToken(result.token);
    setUserInfo(result.userInfo);

    uni.showToast({
      title: '登录成功',
      icon: 'success',
    });

    // 4. 跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/tabBar/match',
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
}
</style>
