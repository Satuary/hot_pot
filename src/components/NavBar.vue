<template>
  <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-content">
      <view class="navbar-left" @click="handleBack">
        <text class="icon" v-if="showBack">&#xe601;</text>
      </view>
      <view class="navbar-title">{{ title }}</view>
      <view class="navbar-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Props {
  title?: string;
  showBack?: boolean;
  backgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  backgroundColor: '#1A1A1A',
});

const emit = defineEmits<{
  back: [];
}>();

const statusBarHeight = ref(0);

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
});

const handleBack = () => {
  if (props.showBack) {
    emit('back');
    uni.navigateBack();
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #1A1A1A;
  
  .navbar-content {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 30rpx;
  }
  
  .navbar-left,
  .navbar-right {
    width: 100rpx;
    display: flex;
    align-items: center;
  }
  
  .navbar-left {
    justify-content: flex-start;
  }
  
  .navbar-right {
    justify-content: flex-end;
  }
  
  .icon {
    font-size: 40rpx;
    color: #FFFFFF;
  }
  
  .navbar-title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: 600;
    color: #FFFFFF;
  }
}
</style>
