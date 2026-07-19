<template>
  <view class="view-page">
    <!-- 背景图 -->
    <image class="bg-image" src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&fit=crop" mode="aspectFill"></image>

    <!-- 内容区域 -->
    <view class="content-wrapper">
      <!-- 头像和连接区域 -->
      <view class="avatar-section">
        <!-- 左侧头像 - 剪影 -->
        <view class="avatar-wrapper">
          <view class="avatar-left silhouette-bg">
            <view class="silhouette-shape"></view>
          </view>
        </view>

        <!-- 中间链接图标 -->
        <view class="link-icon-wrap">
          <image class="link-icon-text" src="/static/imgs/link.png" mode="aspectFit"></image>
        </view>

        <!-- 右侧头像 + 点击查看标签 -->
        <view class="avatar-wrapper right-group">
          <image
            class="avatar-img"
            src="/static/imgs/link.png"
            mode="aspectFit"
          ></image>
          <view class="view-tag">点击查看</view>
        </view>
      </view>

      <!-- 预约信息卡片 -->
      <view class="order-card">
        <!-- 左侧：日期时间 -->
        <view class="card-date-col">
          <text class="date-label">11-18</text>
          <text class="time-value">15:00</text>
        </view>

        <!-- 竖向分割线 -->
        <view class="v-divider"></view>

        <!-- 右侧：详细信息 -->
        <view class="card-info-col">
          <view class="info-title-row">
            <image class="icon-fire" src="/static/imgs/location.png" mode="aspectFit"></image>
            <text class="title-text">重庆老火锅</text>
          </view>
          <view class="info-item-row">
            <text class="item-label">火锅类型：</text>
            <text class="item-val">重庆火锅</text>
          </view>
          <view class="info-item-row last-row">
            <text class="item-label">付费方式：</text>
            <text class="item-val">AA</text>
            <view class="cancel-btn" @click="handleCancel">
              <text class="cancel-txt">取消</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { isLogin, isProfileComplete } from '@/utils/auth';

onShow(() => {
  if (!isLogin()) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }
  if (!isProfileComplete()) {
    uni.reLaunch({ url: '/pages/profile/complete' });
  }
});

const handleCancel = () => {
  uni.showModal({
    title: '取消预约',
    content: '确定要取消此次火锅预约吗？',
    confirmText: '取消预约',
    confirmColor: '#FF4D4F',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已取消预约', icon: 'success' });
      }
    },
  });
};
</script>

<style lang="scss" scoped>
.view-page {
    position: relative;
    min-height: 100vh;
    padding: 0rpx 30rpx;
}

.bg-image {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  filter: blur(8px);
  opacity: 0.45;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 40rpx 60rpx;
  box-sizing: border-box;
  
}

/* ======== 头像区域 ======= */
.avatar-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28rpx;
  margin-bottom: 70rpx;
}

.avatar-wrapper {
  display: flex;
  align-items: center;

  &.right-group {
    flex-direction: column;
    gap: 14rpx;
    position: relative;
    align-items: center;
  }
}

/* 左侧剪影头像 */
.avatar-left {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255,255,255,0.15);

  .silhouette-shape {
    width: 90rpx;
    height: 110rpx;
    background: #000000;
    border-radius: 50% 50% 10% 10%;
    margin-top: 12rpx;
    clip-path: ellipse(50% 48% at 50% 42%);
  }
}

.silhouette-bg {
  background: repeating-linear-gradient(
    135deg,
    #cc2222,
    #cc2222 16rpx,
    #ffffff 16rpx,
    #ffffff 32rpx
  );
}

/* 右侧头像 */
.avatar-img {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255,255,255,0.2);
}

/* 点击查看标签 */
.view-tag {
  position: absolute;
  bottom: 0rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 6rpx 10rpx;
  background: rgba(255,255,255,0.88);
  font-size: 20rpx;
  color: #333333;
  font-weight: 500;
  white-space: nowrap; 
  background: #FFFFFF;
  box-shadow: 0rpx -4rpx 10rpx 0rpx rgba(0,0,0,0.3);
  border-radius: 8rpx 8rpx 8rpx 8rpx;
}

/* 中间链接图标 */
.link-icon-wrap {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(120,100,180,0.35);
  margin-top: -8rpx;
  margin-bottom: -8rpx;

  .link-icon-text {
    width: 44rpx;
    height: 44rpx;
  }
}

/* ======== 预约卡片 ======= */
.order-card {
  width: 100%;
  display: flex;
  align-items: stretch;
  padding: 36rpx 30rpx;
  background: linear-gradient( 45deg, rgba(92,175,255,0.2) 0%, rgba(198,43,255,0.2) 100%);
  border: 2rpx solid rgba(170, 155, 210, 0.22);
  border-radius: 26rpx;
  backdrop-filter: blur(12rpx);
}

/* 左列：日期时间 */
.card-date-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 28rpx;
  border-right: 2rpx solid rgba(255,255,255,0.13);
  min-width: 130rpx;

  .date-label {
    font-size: 26rpx;
    color: rgba(255,255,255,0.58);
    margin-bottom: 10rpx;
  }

  .time-value {
    font-size: 46rpx;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: 1rpx;
    line-height: 1.1;
  }
}

/* 分割线 */
.v-divider {
  width: 2rpx;
  align-self: stretch;
  margin: 20rpx 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255,255,255,0.14) 50%,
    transparent 100%
  );
}

/* 右列：信息详情 */
.card-info-col {
  flex: 1;
  padding-left: 26rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.info-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;

  .icon-fire {
    width: 30rpx;
    height: 30rpx;
  }

  .title-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #FFFFFF;
  }
}

.info-item-row {
  display: flex;
  align-items: baseline;
  gap: 6rpx;

  .item-label {
    font-size: 25rpx;
    color: rgba(255,255,255,0.58);
  }

  .item-val {
    font-size: 25rpx;
    color: rgba(255,255,255,0.88);
  }

  /* 最后一行包含取消按钮 */
  &.last-row {
    align-items: center;

    .cancel-btn {
      margin-left: auto;
      padding: 9rpx 26rpx;
      background: rgba(255,255,255,0.11);
      border: 1rpx solid rgba(255,255,255,0.14);
      border-radius: 26rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &:active {
        background: rgba(255,77,79,0.22);
        transform: scale(0.96);
      }

      .cancel-txt {
        font-size: 23rpx;
        color: rgba(255,255,255,0.72);
        font-weight: 500;
      }
    }
  }
}
</style>
