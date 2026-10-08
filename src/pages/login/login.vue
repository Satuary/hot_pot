<template>
  <view class="login-page">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <image class="logo-img" :src="logoImg" ></image>
      <text class="brand-name">月最新火锅</text>
    </view>
    
    <!-- 登录按钮 -->
    <view class="login-btn-wrapper">
      <!-- 未勾选协议：普通按钮仅提示，不能触发微信手机号授权弹窗 -->
      <button v-if="!agreed" class="login-btn" @click="handleAgreementFirst">
        <text class="btn-text">手机号快捷登录</text>
      </button>
      <!-- 勾选协议后：微信手机号授权按钮（open-type 必须由用户点击直接触发） -->
      <button
        v-else
        class="login-btn"
        open-type="getPhoneNumber"
        @getphonenumber="onGetPhoneNumber"
      >
        <text class="btn-text">手机号快捷登录</text>
      </button>
      <!-- <text class="register-hint" @click="goToPhoneLogin">使用验证码登录</text> -->

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
import logoImg from '@/static/imgs/logo.png';
import { isLogin, isProfileComplete, setToken, setUserInfo, setProfileComplete } from '@/utils/auth';
import { startMatchSocket } from '@/common/matchSocket';
import { wechatLogin, bindPhoneByCode } from '@/api/api';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const loading = ref(false);
const agreed = ref(false);

// 切换协议勾选
const toggleAgreement = () => {
  agreed.value = !agreed.value;
};

// 查看隐私政策
const showPrivacy = () => {
  uni.navigateTo({ url: '/subPack/me/agreement?type=privacy' });
};

// 查看用户协议
const showUserAgreement = () => {
  uni.navigateTo({ url: '/subPack/me/agreement?type=user' });
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

// 未勾选协议时点击登录：只做提示，不触发微信授权（open-type 按钮此时根本不渲染）
const handleAgreementFirst = () => {
  uni.showToast({
    title: '请先同意用户协议和隐私政策',
    icon: 'none',
  });
};

// 微信手机号授权回调（errMsg 是判断同意/拒绝的唯一可信依据）
const onGetPhoneNumber = async (e: any) => {
  // 用户拒绝授权或获取失败：中止流程，停留登录页，不调任何后端接口
  if (e?.detail?.errMsg !== 'getPhoneNumber:ok' || !e.detail.code) {
    uni.showToast({ title: '已取消授权，需手机号授权才能登录', icon: 'none' });
    return;
  }
  const phoneCode = e.detail.code;

  loading.value = true;

  try {
    // 1. uni.login 获取登录 code（后端换 openid），在授权回调内调用保证 code 新鲜
    const loginRes = await uni.login({
      provider: 'weixin',
    });

    if (!loginRes.code) {
      throw new Error('获取微信授权失败');
    }

    // 2. 调用现有微信登录接口，用 loginCode 换 token 和用户信息
    const result = await wechatLogin({ code: loginRes.code });
    setToken(result.token);
    setUserInfo(result.miniUserInfo);
    const isNewUser = !!result.isNew;

    // 3. 调用完善资料接口，只传手机号授权凭证（后端解密 phoneCode 后入库）
    const phoneResult = await bindPhoneByCode({ code: phoneCode });
    if (phoneResult?.miniUserInfo) {
      setUserInfo(phoneResult.miniUserInfo);
    } else if (phoneResult?.phone) {
      setUserInfo({ ...result.miniUserInfo, phone: phoneResult.phone });
    }

    // 新用户需继续完善资料，老用户资料已完善
    setProfileComplete(!isNewUser);
    // 登录成功后启动全局 WebSocket 单例
    startMatchSocket();

    uni.showToast({
      title: '登录成功',
      icon: 'success',
    });

    // 4. 新用户去完善资料页，老用户直接进匹配主页
    setTimeout(() => {
      if (isNewUser) {
        uni.redirectTo({
          url: '/pages/profile/complete',
        });
      } else {
        uni.switchTab({
          url: '/pages/tabBar/match',
        });
      }
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
    // 去除小程序 button 默认样式
    margin: 0;
    padding: 0;
    line-height: normal;

    &::after {
      border: none;
    }

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
