<template>
  <view class="match-page">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-inner">
        <!-- 左侧位置 -->
        <view class="location-picker" @click="chooseLocation">
          <uni-icons type="location-filled" size="20" color="#FFFFFF"></uni-icons>
          <text class="location-text">{{ location }}</text>
        </view>
        
        <!-- 右侧开关 -->
        <view class="toggle-switch" :class="{ active: isToggleOn }" @click="toggleSwitch">
          <view class="toggle-circle"></view>
        </view>
      </view>
    </view>
    
    <!-- 主内容区 -->
    <view class="main-content" :style="{ top: topOffset + 'px' }">
      <!-- 两个旋转的火锅图片 -->
      <view class="match-circles">
        <!-- 左侧精准匹配 -->
        <view class="circle-item">
          <view class="circle-image-wrapper">
            <image 
              class="circle-image neon-blue" 
              src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop" 
              mode="aspectFill"
            ></image>
          </view>
          <view class="match-btn precise" @click="goToPreciseMatch">
            <text>精准匹配</text>
          </view>
        </view>
        
        <!-- 右侧盲配 -->
        <view class="circle-item">
          <view class="circle-image-wrapper">
            <image 
              class="circle-image neon-pink" 
              src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop" 
              mode="aspectFill"
            ></image>
          </view>
          <view class="match-btn blind" @click="goToBlindMatch">
            <text>盲配</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { isLogin, isProfileComplete } from '@/utils/auth';

const statusBarHeight = ref(0);
const topOffset = ref(0);
const location = ref('万达广场');
const isToggleOn = ref(true);

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
  // 导航栏总高度 = 状态栏 + 88rpx（转换为px）
  topOffset.value = statusBarHeight.value + (88 * systemInfo.windowWidth / 750);
});

// TabBar 页面守卫：每次显示时检查登录和资料完善状态
onShow(() => {
  if (!isLogin()) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }
  if (!isProfileComplete()) {
    uni.reLaunch({ url: '/pages/profile/complete' });
  }
});

// 选择位置
const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.name || res.address || '万达广场';
    },
  });
};

// 切换开关
const toggleSwitch = () => {
  isToggleOn.value = !isToggleOn.value;
};

// 精准匹配
const goToPreciseMatch = () => {
  uni.navigateTo({
    url: '/subPack/match/postRequirement?mode=precise',
  });
};

// 盲配
const goToBlindMatch = () => {
  uni.navigateTo({
    url: '/subPack/match/postRequirement?mode=blind',
  });
};
</script>

<style lang="scss" scoped>
.match-page {
  min-height: 100vh;
  background: #000000;
}

// 导航栏
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: transparent;
  
  .navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 40rpx;
  }
  
  // 左侧位置
  .location-picker {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .location-text {
      font-size: 30rpx;
      font-weight: 500;
      color: #FFFFFF;
    }
  }
  
  // 右侧开关
  .toggle-switch {
    width: 100rpx;
    height: 52rpx;
    border-radius: 26rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    transition: all 0.3s ease;
    
    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      
      .toggle-circle {
        transform: translateX(48rpx);
      }
    }
    
    &:not(.active) {
      background: rgba(255, 255, 255, 0.3);
      
      .toggle-circle {
        transform: translateX(4rpx);
      }
    }
    
    .toggle-circle {
      position: absolute;
      top: 4rpx;
      left: 0;
      width: 44rpx;
      height: 44rpx;
      border-radius: 50%;
      background: #FFFFFF;
      transition: transform 0.3s ease;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    }
  }
}

// 主内容区
.main-content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

// 匹配圆圈区域
.match-circles {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 60rpx;
}

.circle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}

// 圆形图片包装器
.circle-image-wrapper {
  position: relative;
  width: 280rpx;
  height: 280rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .circle-image {
    width: 250rpx;
    height: 250rpx;
    border-radius: 50%;
    object-fit: cover;
    border: 4rpx solid rgba(255, 255, 255, 0.1);
    
    // 霓虹边框 - 蓝色
    &.neon-blue {
      border: 3rpx solid rgba(0, 212, 255, 0.5);
      box-shadow: 
        0 0 40rpx rgba(0, 212, 255, 0.3),
        0 0 80rpx rgba(0, 212, 255, 0.15),
        0 0 140rpx rgba(0, 212, 255, 0.08);
    }
    
    // 霓虹边框 - 粉色
    &.neon-pink {
      border: 3rpx solid rgba(255, 45, 149, 0.5);
      box-shadow: 
        0 0 40rpx rgba(255, 45, 149, 0.3),
        0 0 80rpx rgba(255, 45, 149, 0.15),
        0 0 140rpx rgba(255, 45, 149, 0.08);
    }
  }
}

// 匹配按钮
.match-btn {
width: 192rpx;
height: 72rpx;
border-radius: 420rpx 420rpx 420rpx 420rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    font-size: 30rpx;
    font-weight: 500;
  }
  
  // 精准匹配按钮 - 紫色渐变
  &.precise {
    background: linear-gradient(270deg, #58B4FF 0%, #C927FF 100%);
    border-radius: 420rpx;
    box-shadow: 0 8rpx 24rpx rgba(88, 180, 255, 0.4);
    
    text {
      color: #FFFFFF;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  // 盲配按钮 - 白色
  &.blind {
    background: #FFFFFF;
    box-shadow: 0 4rpx 16rpx rgba(255, 255, 255, 0.2);
    
    text {
      color: #333333;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
