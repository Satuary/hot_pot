<template>
    <view class="page profile-page">
        <!-- Header -->
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
        </view>

        <!-- Avatar -->
        <view class="avatar-section">
            <view class="avatar-circle">
                <text>👤</text>
            </view>
            <text class="profile-name">{{ profile.nickname }}</text>
            <text class="profile-id">ID: {{ profile.id }}</text>
        </view>

        <!-- Info Card -->
        <view class="dark-card info-card">
            <view class="info-row">
                <text class="info-label">性别</text>
                <text class="info-value">{{ profile.gender }}</text>
            </view>
            <view class="info-row">
                <text class="info-label">年龄</text>
                <text class="info-value">{{ profile.birthday }}</text>
            </view>
            <view class="info-row">
                <text class="info-label">身高</text>
                <text class="info-value">{{ profile.height }}cm</text>
            </view>
            <view class="info-row">
                <text class="info-label">体重</text>
                <text class="info-value">{{ profile.weight }}kg</text>
            </view>
        </view>

        <!-- Preferences -->
        <view class="dark-card">
            <text class="section-title">火锅偏好</text>
            <view class="tag-row">
                <text v-for="t in profile.hotpotType" :key="t" class="pref-tag">{{ t }}</text>
            </view>
            <view class="divider"></view>
            <text class="section-title">口味偏好</text>
            <view class="tag-row">
                <text v-for="t in profile.taste" :key="t" class="pref-tag orange">{{ t }}</text>
            </view>
        </view>

        <!-- Bottom Actions -->
        <view class="bottom-actions">
            <view class="actions-row">
                <view class="action-btn outline" @click="requestWechat">
                    <text>💬 要微信</text>
                </view>
                <view class="action-btn primary" @click="inviteHotpot">
                    <text>🍲 约火锅</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const profile = reactive({
    id: 'U20230628',
    nickname: '火锅小公主',
    gender: '女',
    birthday: '1998年6月',
    height: '165',
    weight: '50',
    hotpotType: ['重庆火锅', '潮汕牛肉', '串串香'],
    taste: ['麻辣', '微辣'],
});

function goBack() {
    uni.navigateBack();
}

function requestWechat() {
    uni.showModal({
        title: '确认',
        content: '确认发送微信请求？',
        success: (res) => {
            if (res.confirm) {
                uni.showToast({ title: '请求已发送', icon: 'success' });
            }
        },
    });
}

function inviteHotpot() {
    uni.showToast({ title: '已发送约锅邀请', icon: 'success' });
}
</script>

<style lang="scss" scoped>
.profile-page {
    background: #1A1A1A;
    min-height: 100vh;
    padding: 0 30rpx;
}

.nav-header {
    padding: 20rpx 0;
    padding-top: calc(60rpx + var(--status-bar-height, 0px));
}

.back-btn {
    width: 60rpx; height: 60rpx;
    display: flex; align-items: center; justify-content: center;
}

.back-icon {
    font-size: 48rpx; color: #FFF;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
}

.avatar-circle {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 72rpx;
    margin-bottom: 20rpx;
}

.profile-name {
    font-size: 36rpx;
    color: #FFF;
    font-weight: 700;
    margin-bottom: 8rpx;
}

.profile-id {
    font-size: 24rpx;
    color: #808080;
}

.info-card {
    margin: 0 0 20rpx 0;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1px solid #2A2A2A;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-size: 28rpx;
    color: #808080;
}

.info-value {
    font-size: 28rpx;
    color: #FFF;
}

.section-title {
    font-size: 28rpx;
    color: #808080;
    margin-bottom: 16rpx;
    display: block;
}

.tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.pref-tag {
    background: rgba(255,107,61,0.15);
    color: #FF8C66;
    padding: 8rpx 24rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
}

.pref-tag.orange {
    background: rgba(255,149,0,0.15);
    color: #FF9500;
}

.divider {
    height: 1px;
    background: #2A2A2A;
    margin: 24rpx 0;
}

.bottom-actions {
    padding: 30rpx 0;
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.actions-row {
    display: flex;
    gap: 20rpx;
}

.action-btn {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    border-radius: 50rpx;
    font-size: 30rpx;
    font-weight: 600;
}

.action-btn.primary {
    background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
    color: #FFF;
}

.action-btn.outline {
    border: 2rpx solid #4A4A4A;
    color: #B0B0B0;
}
</style>
