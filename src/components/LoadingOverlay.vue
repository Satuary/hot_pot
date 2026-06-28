<template>
  <view v-if="visible" class="loading-overlay">
    <view class="loading-content">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
  text?: string;
}

withDefaults(defineProps<Props>(), {
  visible: false,
  text: '加载中...',
});
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx;
    background: #242424;
    border-radius: 20rpx;
  }
  
  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid rgba(255, 107, 61, 0.2);
    border-top-color: #FF6B3D;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #FFFFFF;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
