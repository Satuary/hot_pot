<template>
    <view class="page partner-profile-page">
        <!-- 背景图 -->
        <image class="page-bg" src="/static/imgs/index_bg.png" mode="aspectFill"></image>

        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view class="nav-back" @click="goBack">
                    <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 用户信息卡片 -->
        <view class="profile-card">
            <view class="profile-main">
                <view class="avatar-wrap">
                    <image class="avatar" src="https://picsum.photos/200" mode="aspectFill"></image>
                </view>
                <view class="profile-info">
                    <view class="name-row">
                        <text class="nickname">火锅友212</text>
                        <view class="taste-tag">麻辣</view>
                    </view>
                    <view class="id-address-row">
                        <text class="id-text">ID:30145</text>
                        <image class="copy-icon" src="/static/imgs/file-copy-line.png" mode="aspectFit"></image>
                        <text class="address-text">地址：美景大厦</text>
                    </view>
                </view>
            </view>

            <view class="info-tags">
                <view class="info-tag">
                    <image class="info-tag-icon" src="/static/imgs/ruler-line.png" mode="aspectFit"></image>
                    <text>170cm 60kg</text>
                </view>
                <view class="info-tag">
                    <image class="info-tag-icon" src="/static/imgs/lz.png" mode="aspectFit"></image>
                    <text>25岁</text>
                </view>
                <view class="info-tag">
                    <text>男</text>
                </view>
            </view>

            <view class="pref-tags">
                <view class="pref-tag white">重庆火锅</view>
                <view class="pref-tag white">尝鲜打卡</view>
            </view>

            <!-- 交换联系方式 -->
            <view class="contact-bar" v-if="showContactBar">
                <view class="contact-item">
                    <image class="contact-icon" src="/static/imgs/dh.png" mode="aspectFit"></image>
                    <text class="contact-text">请求交换电话</text>
                </view>
                <view class="contact-divider"></view>
                <view class="contact-item">
                    <image class="contact-icon" src="/static/imgs/wx.png" mode="aspectFit"></image>
                    <text class="contact-text">点击查看</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const statusBarHeight = ref(0);
const showContactBar = ref(false);

// 获取状态栏高度
const systemInfo = uni.getSystemInfoSync();
statusBarHeight.value = systemInfo.statusBarHeight || 30;

onLoad((options: any) => {
    if (options?.from === 'view') {
        showContactBar.value = true;
    }
});

function goBack() {
    uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.partner-profile-page {
    min-height: 100vh;
    background: #000000;
    position: relative;
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

.nav-bar {
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
}

.nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
}

.nav-back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-card {
    padding: 20rpx 32rpx;
    position: relative;
    z-index: 1;
}

.profile-main {
    display: flex;
    align-items: center;
}

.avatar-wrap {
    position: relative;
    width: 140rpx;
    height: 140rpx;
    flex-shrink: 0;
}

.avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 3rpx solid rgba(255, 255, 255, 0.3);
}

.profile-info {
    flex: 1;
    margin-left: 28rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.name-row {
    display: flex;
    align-items: center;
}

.nickname {
    font-size: 38rpx;
    font-weight: 600;
    color: #ffffff;
}

.taste-tag {
    margin-left: 16rpx;
    padding: 4rpx 14rpx;
    border-radius: 8rpx;
    background: rgba(82, 196, 26, 0.2);
    color: #52c41a;
    font-size: 22rpx;
    border: 1rpx solid rgba(82, 196, 26, 0.35);
}

.id-address-row {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
}

.id-text {
    font-size: 24rpx;
    color: #999999;
}

.copy-icon {
    width: 28rpx;
    height: 28rpx;
    margin-left: 8rpx;
    margin-right: 20rpx;
}

.address-text {
    font-size: 24rpx;
    color: #999999;
}

.info-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 36rpx;
}

.info-tag {
    display: inline-flex;
    align-items: center;
    padding: 10rpx 22rpx;
    border-radius: 28rpx;
    background: rgba(255, 255, 255, 0.12);
    color: #cccccc;
    font-size: 24rpx;
}

.info-tag-icon {
    width: 24rpx;
    height: 24rpx;
    margin-right: 6rpx;
}

.pref-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 28rpx;
}

.pref-tag {
    padding: 12rpx 30rpx;
    border-radius: 32rpx;
    font-size: 26rpx;
}

.pref-tag.white {
    background: #ffffff;
    color: #333333;
}

.contact-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 50rpx 0rpx 0;
    padding: 30rpx 0;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.08);
    border: 1rpx solid rgba(255, 255, 255, 0.12);
}

.contact-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.contact-divider {
    width: 1rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.15);
}

.contact-text {
    font-size: 28rpx;
    color: #ffffff;
}

.contact-icon {
    width: 40rpx;
    height: 40rpx;
}
</style>
