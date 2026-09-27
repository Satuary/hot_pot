<template>
  <view class="overlay" v-if="visible" @touchmove.stop.prevent @click="handleClose">
    <view class="modal-container" @click.stop>
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="handleClose">
        <text class="close-icon">×</text>
      </view>

      <!-- 标题 -->
      <text class="title">匹配次数不足</text>

      <!-- 提示文案 -->
      <text class="tip">{{ tip }}</text>

      <!-- 去充值按钮 -->
      <view class="recharge-btn" @click="handleRecharge">
        <text class="recharge-btn-text">去充值</text>
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
  /** 提示文案 */
  tip: {
    type: String,
    default: '您的匹配次数已用完，请先充值后再发起匹配',
  },
});

const emit = defineEmits(['close', 'recharge']);

function handleClose() {
  emit('close');
}

function handleRecharge() {
  emit('recharge');
  emit('close');
  uni.navigateTo({ url: '/subPack/me/recharge' });
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
  padding: 70rpx 44rpx 50rpx;
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

.title {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 28rpx;
}

.tip {
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 56rpx;
}

.recharge-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  background: linear-gradient(270deg, #58b4ff 0%, #c927ff 100%);
  box-shadow: 0 8rpx 24rpx rgba(88, 180, 255, 0.4);
}

.recharge-btn-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
}

.recharge-btn:active {
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
