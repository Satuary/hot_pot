<template>
  <view class="phone-login-page">
    <!-- 返回按钮 -->
    <view class="back-btn" @click="goBack">
      <uni-icons type="left" size="22" color="#000000"></uni-icons>
    </view>
    
    <!-- 标题 -->
    <view class="title-area">
      <text class="title">验证码登录</text>
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
            placeholder="请输入手机号"
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
            placeholder="请输入验证码"
            maxlength="6"
            placeholder-class="placeholder"
          />
          <view
            class="code-trigger"
            :class="{ disabled: countdown > 0 || sending }"
            @click="sendCode"
          >
            {{ sending ? '发送中' : countdown > 0 ? `${countdown}s` : '发送' }}
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
const sending = ref(false);
const agreed = ref(false);

// 模拟后端：发送短信验证码
const mockSendSms = async (_phoneNumber: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // 模拟：所有手机号均可发送，返回成功
  return { code: 0, message: '验证码已发送' };
};

// 模拟后端：手机号登录/注册
const mockPhoneLogin = async (phoneNumber: string, smsCode: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 模拟：验证码固定为 123456
  if (smsCode !== '123456') {
    throw new Error('验证码错误');
  }

  // 根据手机号模拟是新用户还是老用户
  const isNewUser = phoneNumber.startsWith('139');

  return {
    token: 'mock_token_' + Date.now(),
    isNewUser,
    userInfo: {
      id: 'user_' + phoneNumber.slice(-4),
      nickname: isNewUser ? '新朋友' : '手机用户' + phoneNumber.slice(-4),
      avatar: 'https://picsum.photos/201',
      phone: phoneNumber,
      gender: 'male' as const,
      age: 0,
      tags: [] as string[],
      intro: '',
      balance: isNewUser ? 0 : 50,
      matchCount: 0,
      isProfileComplete: !isNewUser,
    },
  };
};

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
  if (countdown.value > 0 || sending.value) return;
  
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
    });
    return;
  }
  
  sending.value = true;
  try {
    // 正式环境替换为: await sendSmsCode({ phone: phone.value });
    await mockSendSms(phone.value);
    
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
  } finally {
    sending.value = false;
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
  
  loading.value = true;
  
  try {
    // 正式环境替换为: const result = await phoneLogin({ phone: phone.value, code: code.value });
    const result = await mockPhoneLogin(phone.value, code.value);
    
    setToken(result.token);
    setUserInfo(result.userInfo);
    
    const msg = result.isNewUser ? '注册成功，请完善个人资料' : '登录成功';
    uni.showToast({
      title: msg,
      icon: 'success',
    });
    
    setTimeout(() => {
      if (result.isNewUser) {
        // 新用户：跳转到资料完善页
        uni.navigateTo({
          url: '/pages/profile/setup',
        });
      } else {
        // 老用户：跳转到首页
        uni.switchTab({
          url: '/pages/tabBar/match',
        });
      }
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
    background: #000000;
    border-radius: 30rpx;
    font-size: 28rpx;
    color: #FFFFFF;
    white-space: nowrap;
    
    &.disabled {
      background: #E8E8E8;
      color: #999999;
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
