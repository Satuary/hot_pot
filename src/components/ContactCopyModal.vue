<template>
  <view class="overlay" v-if="visible" @touchmove.stop.prevent @click="handleClose">
    <view class="modal-container" @click.stop>
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="handleClose">
        <text class="close-icon">×</text>
      </view>

      <!-- 文案 -->
      <view class="text-group">
        <text class="title">{{ title }}</text>
        <text class="value">{{ value }}</text>
      </view>

      <!-- 复制按钮 -->
      <view class="copy-btn" @click="handleCopy">
        <text class="copy-btn-text">{{ buttonText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  /** 标题，如"对方电话"、"火锅友212的微信号" */
  title: {
    type: String,
    default: '',
  },
  /** 要复制的号码 */
  value: {
    type: String,
    default: '',
  },
  /** 左侧图标，默认电话图标 */
  icon: {
    type: String,
    default: '/static/imgs/dh.png',
  },
  /** 按钮文案 */
  buttonText: {
    type: String,
    default: '复制',
  },
});

const emit = defineEmits(['close', 'copy']);

function handleClose() {
  emit('close');
}

function handleCopy() {
  if (!props.value) {
    uni.showToast({ title: '暂未获取到联系方式', icon: 'none' });
    return;
  }
  uni.setClipboardData({
    data: props.value,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' });
    },
  });
  emit('copy');
}
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  position: relative;
  background: rgba(18, 18, 18, 0.85);
  border: 2rpx solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(24rpx);
  -webkit-backdrop-filter: blur(24rpx);
  border-radius: 36rpx;
  padding: 60rpx 44rpx 50rpx;
  width: 86%;
  max-width: 640rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.close-btn {
  position: absolute;
  top: 24rpx;
  right: 28rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.close-icon {
  color: #ffffff;
  font-size: 40rpx;
  line-height: 1;
  transform: translateY(-6rpx);
}

.text-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 50rpx;
  margin-top: 10rpx;
}

.title {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.value {
  color: rgba(255, 255, 255, 0.85);
  font-size: 36rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  word-break: break-all;
}

.copy-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  background: linear-gradient(270deg, #58b4ff 0%, #c927ff 100%);
  box-shadow: 0 8rpx 24rpx rgba(88, 180, 255, 0.4);
}

.copy-btn-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
}

.copy-btn:active {
  transform: scale(0.97);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
