<template>
  <view class="setup-page">
    <NavBar title="完善资料" :show-back="false" />
    
    <view class="content">
      <!-- 进度指示 -->
      <view class="progress-bar">
        <view class="progress" :style="{ width: progress + '%' }"></view>
      </view>
      
      <scroll-view scroll-y class="form-scroll">
        <!-- 头像 -->
        <view class="form-section">
          <text class="section-title">设置头像</text>
          <view class="avatar-upload" @click="chooseAvatar">
            <image
              v-if="formData.avatar"
              :src="formData.avatar"
              class="avatar-img"
              mode="aspectFill"
            ></image>
            <view v-else class="avatar-placeholder">
              <text class="icon">📷</text>
              <text class="hint">点击上传</text>
            </view>
          </view>
        </view>
        
        <!-- 基本信息 -->
        <view class="form-section">
          <text class="section-title">基本信息</text>
          
          <view class="form-item" @click="showNicknamePicker">
            <text class="label">昵称</text>
            <text class="value" :class="{ placeholder: !formData.nickname }">
              {{ formData.nickname || '请输入昵称' }}
            </text>
            <text class="arrow">›</text>
          </view>
          
          <view class="form-item" @click="showGenderPicker">
            <text class="label">性别</text>
            <text class="value" :class="{ placeholder: !formData.gender }">
              {{ formData.gender || '请选择' }}
            </text>
            <text class="arrow">›</text>
          </view>
          
          <view class="form-item" @click="showAgePicker">
            <text class="label">年龄</text>
            <text class="value" :class="{ placeholder: !formData.age }">
              {{ formData.age || '请选择' }}
            </text>
            <text class="arrow">›</text>
          </view>
        </view>
        
        <!-- 火锅偏好 -->
        <view class="form-section">
          <text class="section-title">火锅偏好 (可多选)</text>
          <TagSelector
            v-model="formData.hotpotTypes"
            :options="hotpotTypeOptions"
            :multiple="true"
            :max="5"
          />
        </view>
        
        <!-- 口味偏好 -->
        <view class="form-section">
          <text class="section-title">口味偏好 (可多选)</text>
          <TagSelector
            v-model="formData.tastes"
            :options="tasteOptions"
            :multiple="true"
            :max="3"
          />
        </view>
        
        <!-- 匹配动机 -->
        <view class="form-section">
          <text class="section-title">匹配动机</text>
          <TagSelector
            v-model="motivationArr"
            :options="motivationOptions"
            :multiple="false"
          />
        </view>
        
        <!-- 个人简介 -->
        <view class="form-section">
          <text class="section-title">个人简介</text>
          <textarea
            v-model="formData.intro"
            class="textarea"
            placeholder="介绍一下自己吧..."
            maxlength="100"
          ></textarea>
          <text class="char-count">{{ formData.intro.length }}/100</text>
        </view>
      </scroll-view>
      
      <!-- 底部按钮 -->
      <view class="bottom-actions">
        <button
          class="gradient-btn"
          :class="{ disabled: !canSubmit }"
          @click="handleSubmit"
        >
          完成
        </button>
      </view>
    </view>
    
    <LoadingOverlay :visible="loading" text="保存中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { updatePersonInfo } from '@/api/api';
import { getUserInfo, setUserInfo } from '@/utils/auth';
import { hotpotTypeOptions, tasteOptions, motivationOptions } from '@/utils/store';
import NavBar from '@/components/NavBar.vue';
import TagSelector from '@/components/TagSelector.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const loading = ref(false);

const formData = ref({
  avatar: '',
  nickname: '',
  gender: '',
  age: '',
  hotpotTypes: [] as string[],
  tastes: [] as string[],
  motivation: '',
  intro: '',
});

// 动机选择（单选转数组）
const motivationArr = computed({
  get: () => (formData.value.motivation ? [formData.value.motivation] : []),
  set: (val: string[]) => {
    formData.value.motivation = val[0] || '';
  },
});

// 进度百分比
const progress = computed(() => {
  let count = 0;
  if (formData.value.avatar) count++;
  if (formData.value.nickname) count++;
  if (formData.value.gender) count++;
  if (formData.value.age) count++;
  if (formData.value.hotpotTypes.length > 0) count++;
  if (formData.value.tastes.length > 0) count++;
  if (formData.value.motivation) count++;
  return Math.floor((count / 7) * 100);
});

// 是否可以提交
const canSubmit = computed(() => {
  return (
    formData.value.avatar &&
    formData.value.nickname &&
    formData.value.gender &&
    formData.value.age
  );
});

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      formData.value.avatar = res.tempFilePaths[0];
      // TODO: 上传到服务器
    },
  });
};

// 显示昵称输入
const showNicknamePicker = () => {
  uni.showModal({
    title: '输入昵称',
    editable: true,
    placeholderText: '请输入昵称',
    content: formData.value.nickname,
    success: (res) => {
      if (res.confirm && res.content) {
        formData.value.nickname = res.content;
      }
    },
  });
};

// 显示性别选择
const showGenderPicker = () => {
  uni.showActionSheet({
    itemList: ['男', '女'],
    success: (res) => {
      formData.value.gender = ['男', '女'][res.tapIndex];
    },
  });
};

// 显示年龄选择
const showAgePicker = () => {
  const ages = Array.from({ length: 63 }, (_, i) => (18 + i).toString());
  uni.showActionSheet({
    itemList: ages,
    success: (res) => {
      formData.value.age = ages[res.tapIndex];
    },
  });
};

// 提交 - 使用假数据
const handleSubmit = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请完善必填信息',
      icon: 'none',
    });
    return;
  }
  
  loading.value = true;
  
  try {
    // 模拟 API 请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 构造完整的用户信息
    const updatedUserInfo = {
      id: 'user_' + Date.now(),
      nickname: formData.value.nickname,
      avatar: formData.value.avatar || 'https://picsum.photos/200',
      phone: '138****8888',
      gender: formData.value.gender as any,
      age: parseInt(formData.value.age),
      tags: [...formData.value.hotpotTypes, ...formData.value.tastes],
      intro: formData.value.intro,
      balance: 0,
      matchCount: 0,
      isProfileComplete: true,
    };
    
    const mockToken = 'mock_token_' + Date.now();
    
    // 更新本地用户信息
    setToken(mockToken);
    setUserInfo(updatedUserInfo);
    
    uni.showToast({
      title: '资料保存成功',
      icon: 'success',
    });
    
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/tabBar/match',
      });
    }, 1500);
  } catch (error: any) {
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.setup-page {
  min-height: 100vh;
  background: #1A1A1A;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 88rpx;
}

// 进度条
.progress-bar {
  height: 6rpx;
  background: #333333;
  margin: 30rpx 60rpx;
  border-radius: 3rpx;
  overflow: hidden;
  
  .progress {
    height: 100%;
    background: linear-gradient(90deg, #FF6B3D, #FF3D3D);
    transition: width 0.3s;
  }
}

// 表单滚动区
.form-scroll {
  flex: 1;
  padding: 0 60rpx 200rpx;
}

// 表单区块
.form-section {
  margin-bottom: 60rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #FFFFFF;
    margin-bottom: 30rpx;
  }
}

// 头像上传
.avatar-upload {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #242424;
  border: 4rpx solid #333333;
  margin: 0 auto;
  
  .avatar-img {
    width: 100%;
    height: 100%;
  }
  
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .icon {
      font-size: 60rpx;
      margin-bottom: 10rpx;
    }
    
    .hint {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

// 表单项
.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: #242424;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .label {
    font-size: 30rpx;
    color: #FFFFFF;
  }
  
  .value {
    flex: 1;
    text-align: right;
    font-size: 28rpx;
    color: #FFFFFF;
    margin: 0 20rpx;
    
    &.placeholder {
      color: #666666;
    }
  }
  
  .arrow {
    font-size: 40rpx;
    color: #666666;
  }
}

// 文本域
.textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 30rpx;
  background: #242424;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  box-sizing: border-box;
  
  &::placeholder {
    color: #666666;
  }
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #666666;
  margin-top: 10rpx;
}

// 底部操作
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 60rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent, #1A1A1A 30%);
}
</style>
