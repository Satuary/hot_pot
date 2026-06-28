<template>
  <view class="phone-login-page">
    <NavBar title="" />
    
    <view class="content">
      <!-- 返回按钮 -->
      <view class="back-btn" @click="goBack">
        <text class="arrow">←</text>
      </view>
      
      <!-- 标题 -->
      <view class="title-area">
        <text class="title">手机号登录</text>
        <text class="subtitle">新用户自动注册</text>
      </view>
      
      <!-- 表单 -->
      <view class="form-area">
        <!-- 手机号 -->
        <view class="input-group">
          <view class="input-box">
            <text class="prefix">+86</text>
            <input
              class="input-field"
              type="number"
              v-model="phone"
              placeholder="输入手机号"
              maxlength="11"
              placeholder-class="placeholder"
            />
          </view>
        </view>
        
        <!-- 验证码 -->
        <view class="input-group">
          <view class="input-box">
            <input
              class="input-field"
              type="number"
              v-model="code"
              placeholder="输入验证码"
              maxlength="6"
              placeholder-class="placeholder"
            />
            <view
              class="code-trigger"
              :class="{ disabled: countdown > 0 }"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </view>
          </view>
          <text v-if="countdown === 0" class="hint-text">测试验证码: 123456</text>
        </view>
      </view>
      
      <!-- 登录按钮 -->
      <view class="action-area">
        <view
          class="submit-btn"
          :class="{ active: canLogin }"
          @click="handleLogin"
        >
          <text class="btn-text">登录</text>
        </view>
      </view>
    </view>
    
    <LoadingOverlay :visible="loading" text="登录中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { phoneLogin, sendSmsCode } from '@/api/api';
import { setToken, setUserInfo } from '@/utils/auth';
import NavBar from '@/components/NavBar.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const phone = ref('');
const code = ref('');
const countdown = ref(0);
const loading = ref(false);

// 是否可以登录
const canLogin = computed(() => {
  return phone.value.length === 11 && code.value.length === 6;
});

// 发送验证码 - 使用假数据
const sendCode = async () => {
  if (countdown.value > 0) return;
  
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
    });
    return;
  }
  
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500));
    
    uni.showToast({
      title: '验证码已发送 (测试码: 123456)',
      icon: 'success',
      duration: 3000,
    });
    
    // 开始倒计时
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    uni.showToast({
      title: error.message || '发送失败',
      icon: 'none',
    });
  }
};

// 登录 - 使用假数据
const handleLogin = async () => {
  if (!canLogin.value) return;
  
  // 验证测试验证码
  if (code.value !== '123456') {
    uni.showToast({
      title: '验证码错误 (请输入: 123456)',
      icon: 'none',
      duration: 3000,
    });
    return;
  }
  
  loading.value = true;
  
  try {
    // 模拟 API 请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 假数据 - 已完善资料的用户
    const mockUserInfo = {
      id: 'user_002',
      nickname: '手机用户',
      avatar: 'https://picsum.photos/201',
      phone: phone.value,
      gender: 'female' as const,
      age: 25,
      tags: ['海底捞', '清汤', '随便逛逛'],
      intro: '喜欢清淡口味的火锅',
      balance: 50,
      matchCount: 3,
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

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 返回微信登录
const goToWechatLogin = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.phone-login-page {
  min-height: 100vh;
  background: #0D0D0D;
}

.content {
  padding: 100rpx 50rpx 60rpx;
  min-height: 100vh;
}

// 返回按钮
.back-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  margin-bottom: 60rpx;
  
  .arrow {
    font-size: 36rpx;
    color: rgba(255, 255, 255, 0.8);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.08);
  }
}

// 标题区域
.title-area {
  margin-bottom: 80rpx;
  
  .title {
    display: block;
    font-size: 52rpx;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 16rpx;
    letter-spacing: 1rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.4);
  }
}

// 表单区域
.form-area {
  margin-bottom: 60rpx;
  
  .input-group {
    margin-bottom: 36rpx;
  }
  
  .input-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1rpx solid rgba(255, 255, 255, 0.08);
    border-radius: 20rpx;
    padding: 0 32rpx;
    height: 100rpx;
    transition: all 0.3s;
    
    &:focus-within {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 107, 61, 0.5);
    }
  }
  
  .prefix {
    font-size: 30rpx;
    color: rgba(255, 255, 255, 0.6);
    margin-right: 20rpx;
    padding-right: 20rpx;
    border-right: 1rpx solid rgba(255, 255, 255, 0.1);
  }
  
  .input-field {
    flex: 1;
    font-size: 30rpx;
    color: #FFFFFF;
    height: 100%;
  }
  
  .placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
  
  .code-trigger {
    padding: 16rpx 28rpx;
    background: rgba(255, 107, 61, 0.15);
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #FF6B3D;
    white-space: nowrap;
    transition: all 0.2s;
    
    &:active:not(.disabled) {
      background: rgba(255, 107, 61, 0.25);
    }
    
    &.disabled {
      opacity: 0.5;
      color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.05);
    }
  }
  
  .hint-text {
    display: block;
    margin-top: 16rpx;
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.3);
    padding-left: 32rpx;
  }
}

// 操作区域
.action-area {
  margin-top: 80rpx;
  
  .submit-btn {
    height: 96rpx;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    transition: all 0.3s;
    
    .btn-text {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.3);
      font-weight: 500;
    }
    
    &.active {
      background: linear-gradient(135deg, #FF6B3D 0%, #E5533D 100%);
      box-shadow: 0 8rpx 24rpx rgba(255, 107, 61, 0.35);
      
      .btn-text {
        color: #FFFFFF;
      }
      
      &:active {
        transform: scale(0.97);
      }
    }
  }
}
</style>
