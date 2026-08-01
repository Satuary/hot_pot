<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="page-bg" src="/static/imgs/index_bg.png" mode="aspectFill"></image>
    <!-- 顶部状态栏占位 -->
    <view class="status-bar"></view>

    <!-- 顶部头像与连接区域 -->
    <view class="header-section">
      <!-- 左侧头像 -->
      <view class="avatar-box left-avatar">
        <image
          src="https://picsum.photos/200"
          mode="aspectFill"
          class="avatar-img"
        ></image>
      </view>

      <!-- 中间连接图标 -->
      <view class="link-icon-box">
        <image class="link-icon-text" src="/static/imgs/link.png" mode="aspectFit"></image>
      </view>

      <!-- 右侧头像 + 标签 -->
      <view class="right-wrapper">
        <view class="avatar-box right-avatar">
          <image
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            mode="aspectFill"
            class="avatar-img"
          ></image>
        </view>
        <!-- 点击查看标签 -->
        <view class="click-tag" @click="goToPartnerProfile">点击查看</view>
      </view>
    </view>

    <!-- 等待对方同意弹窗 -->
    <view class="waiting-mask" v-if="showWaitingPopup" @click="closeWaitingPopup">
      <view class="waiting-popup" @click.stop>
        <text class="waiting-title">等待对方同意</text>
        <view class="countdown">
          <view class="countdown-digit">{{ countdownStr[0] }}</view>
          <view class="countdown-digit">{{ countdownStr[1] }}</view>
          <text class="countdown-colon">:</text>
          <view class="countdown-digit">{{ countdownStr[2] }}</view>
          <view class="countdown-digit">{{ countdownStr[3] }}</view>
        </view>
        <view class="waiting-cancel" @click="closeWaitingPopup">取消</view>
      </view>
    </view>

    <!-- 中间信息卡片 -->
    <view class="info-card">
      <!-- 左侧时间区 -->
      <view class="time-section">
        <text class="date-text">11-18</text>
        <text class="time-text">15:00</text>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 右侧详情区 -->
      <view class="detail-section">
        <view class="title-row">
          <view class="icon-pin">
            <!-- <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff7675" stroke="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="#fff"></circle>
            </svg> -->
            <image class="icon-fire" src="/static/imgs/location.png" mode="aspectFit"></image>
          </view>
          <text class="shop-name">重庆老火锅</text>
        </view>

        <view class="info-row">
          <text class="label">火锅类型：</text>
          <text class="value">重庆火锅</text>
        </view>

        <view class="info-row">
          <text class="label">付费方式：</text>
          <text class="value">AA</text>
        </view>

        <!-- 取消按钮 -->
        <view class="cancel-btn">取消</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { onShow, onHide } from '@dcloudio/uni-app';
import { isLogin, isProfileComplete } from '@/utils/auth';

const showWaitingPopup = ref(false);
const remainingSeconds = ref(10 * 60); // 默认 10 分钟倒计时
let countdownTimer = null;

const countdownStr = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60);
  const seconds = remainingSeconds.value % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}${ss}`;
});

function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  countdownTimer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value -= 1;
    } else {
      clearInterval(countdownTimer);
      showWaitingPopup.value = false;
    }
  }, 1000);
}

function goToPartnerProfile() {
  uni.navigateTo({ url: '/subPack/match/partnerProfile?from=view' });
}

function closeWaitingPopup() {
  showWaitingPopup.value = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

onShow(() => {
  // TabBar 页面守卫：每次显示时检查登录和资料完善状态
  if (!isLogin()) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }
  if (!isProfileComplete()) {
    uni.reLaunch({ url: '/pages/profile/complete' });
    return;
  }

  const shouldShow = uni.getStorageSync('showWaitingPopup');
  if (shouldShow) {
    uni.removeStorageSync('showWaitingPopup');
    remainingSeconds.value = 10 * 60;
    showWaitingPopup.value = true;
    startCountdown();
  }
});

onHide(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style lang="scss" scoped>
/* 全局容器 */
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}

/* 页面背景图 */
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.status-bar {
  height: var(--status-bar-height);
  width: 100%;
  position: relative;
  z-index: 1;
}

/* 顶部头像区域 - 精确间距与层级 */
.header-section {
  margin-top: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  z-index: 1;
}

.avatar-box {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  overflow: hidden;
  background-color: #eee;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.left-avatar {
  margin-right: 60rpx;
}

.right-avatar {
}

.right-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 60rpx;
}

/* 点击查看标签 - 精确位置与样式 */
.click-tag {
  position: absolute;
  bottom: 0rpx;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  color: #333;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 中间连接图标 - 精确尺寸与阴影 */
.link-icon-box {
  width: 60rpx;
  height: 60rpx;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
  z-index: 3;
}

/* 中间信息卡片 - 精确尺寸、毛玻璃与阴影 */
.info-card {
  margin-top: 80rpx;
  width: 640rpx;
  height: 240rpx;
  background: linear-gradient( 45deg, rgba(92,175,255,0.2) 0%, rgba(198,43,255,0.2) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  padding: 30rpx;
  box-sizing: border-box;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

/* 左侧时间区 - 精确间距与字体 */
.time-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 140rpx;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
  margin-right: 30rpx;
}

.date-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.time-text {
  color: #ffffff;
  font-size: 44rpx;
  font-weight: bold;
}

.divider {
  display: none;
}

/* 右侧详情区 - 精确布局与字体 */
.detail-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.icon-pin {
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  .icon-fire{
    width: 32rpx;
    height: 32rpx;
  }
}

.shop-name {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.value {
  color: #ffffff;
  font-size: 24rpx;
}

/* 取消按钮 - 精确位置与样式 */
.cancel-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 24rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

/* 等待对方同意弹窗 */
.waiting-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.waiting-popup {
  width: 560rpx;
  background: rgba(0, 0, 0, 0.8);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(20rpx);
}

.waiting-title {
  font-size: 34rpx;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 40rpx;
}

.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 50rpx;
}

.countdown-digit {
  width: 68rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: linear-gradient(180deg, #58B4FF 0%, #C927FF 100%);
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 600;
  margin: 0 8rpx;
}

.countdown-colon {
  font-size: 44rpx;
  color: #ffffff;
  font-weight: 600;
  margin: 0 8rpx;
}

.waiting-cancel {
  width: 320rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  background: #ffffff;
  color: #333333;
  font-size: 30rpx;
}
</style>