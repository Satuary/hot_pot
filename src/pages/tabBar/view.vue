<template>
  <view class="page-container">
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
        <view class="click-tag">点击查看</view>
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
// 页面逻辑
</script>

<style lang="scss" scoped>
/* 全局容器 */
.page-container {
  min-height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}

.status-bar {
  height: var(--status-bar-height);
  width: 100%;
}

/* 顶部头像区域 - 精确间距与层级 */
.header-section {
  margin-top: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
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
</style>