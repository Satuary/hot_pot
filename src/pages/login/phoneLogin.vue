<template>
  <view class="phone-login-page">
    <!-- 返回按钮 -->
    <view class="back-btn" @click="goBack">
      <uni-icons type="left" size="22" color="#000000"></uni-icons>
    </view>
    
    <!-- 标题 -->
    <view class="title-area">
      <text class="title">快捷登录</text>
    </view>
    
    <!-- 表单 -->
    <view class="form-area">
      <!-- 手机号 -->
      <view class="input-group">
        <text class="input-label">手机号</text>
        <view class="input-box">
          <input
            class="input-field"
            type="number"
            v-model="phone"
            placeholder="请输入"
            maxlength="11"
            placeholder-class="placeholder"
          />
        </view>
      </view>
      
      <!-- 验证码 -->
      <view class="input-group">
        <text class="input-label">验证码</text>
        <view class="input-box">
          <input
            class="input-field"
            type="number"
            v-model="code"
            placeholder="请输入"
            maxlength="6"
            placeholder-class="placeholder"
          />
          <view
            class="code-trigger"
            :class="{ disabled: countdown > 0 }"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '发送' }}
          </view>
        </view>
      </view>
      
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
    
    <!-- 登录按钮 -->
    <view class="action-area">
      <view
        class="submit-btn"
        :class="{ active: canLogin && agreed }"
        @click="handleLogin"
      >
        <text class="btn-text">登录</text>
      </view>
    </view>
    
    <LoadingOverlay :visible="loading" text="登录中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { setToken, setUserInfo } from '@/utils/auth';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const phone = ref('');
const code = ref('');
const countdown = ref(0);
const loading = ref(false);
const agreed = ref(false);

// 切换协议勾选
const toggleAgreement = () => {
  agreed.value = !agreed.value;
};

// 是否可以登录
const canLogin = computed(() => {
  return phone.value.length === 11 && code.value.length === 6;
});

// 发送验证码
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    uni.showToast({
      title: '验证码已发送 (测试码: 123456)',
      icon: 'success',
      duration: 3000,
    });
    
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

// 登录
const handleLogin = async () => {
  if (!canLogin.value) return;
  
  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
    });
    return;
  }
  
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    
    setToken(mockToken);
    setUserInfo(mockUserInfo);
    
    uni.showToast({
      title: '登录成功',
      icon: 'success',
    });
    
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
.phone-login-page {
  min-height: 100vh;
  background: #FFFFFF;
  padding: 60rpx 50rpx;
}

// 返回按钮
.back-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
}

// 标题区域
.title-area {
  margin-bottom: 80rpx;
  
  .title {
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
  }
}

// 表单区域
.form-area {
  .input-group {
    margin-bottom: 60rpx;
  }
  
  .input-label {
    display: block;
    font-size: 30rpx;
    color: #333333;
    margin-bottom: 20rpx;
  }
  
  .input-box {
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid #E5E5E5;
    padding-bottom: 20rpx;
    
    &:focus-within {
      border-bottom-color: #000000;
    }
  }
  
  .input-field {
    flex: 1;
    font-size: 32rpx;
    color: #000000;
    height: 60rpx;
  }
  
  .placeholder {
    color: #CCCCCC;
  }
  
  .code-trigger {
    padding: 12rpx 36rpx;
    background: #E8E8E8;
    border-radius: 30rpx;
    font-size: 28rpx;
    color: #FFFFFF;
    white-space: nowrap;
    
    &.disabled {
      background: #E8E8E8;
      color: #FFFFFF;
    }
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

// 操作区域
.action-area {
  margin-top: 100rpx;
  
  .submit-btn {
    width: 100%;
    height: 96rpx;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000000;
    
    .btn-text {
      font-size: 32rpx;
      color: #FFFFFF;
      font-weight: 500;
    }
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style>
