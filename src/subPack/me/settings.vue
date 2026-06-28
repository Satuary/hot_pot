<template>
    <view class="page settings-page">
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">设置</text>
        </view>

        <view class="content">
            <view class="dark-card setting-menu">
                <view class="menu-item">
                    <text class="menu-text">消息通知</text>
                    <text class="arrow">›</text>
                </view>
                <view class="menu-item">
                    <text class="menu-text">隐私设置</text>
                    <text class="arrow">›</text>
                </view>
                <view class="menu-item">
                    <text class="menu-text">清除缓存</text>
                    <text class="menu-value">12.5MB</text>
                </view>
                <view class="menu-item">
                    <text class="menu-text">当前版本</text>
                    <text class="menu-value">v1.0.0</text>
                </view>
            </view>

            <view class="dark-card setting-menu">
                <view class="menu-item">
                    <text class="menu-text">用户协议</text>
                    <text class="arrow">›</text>
                </view>
                <view class="menu-item">
                    <text class="menu-text">隐私政策</text>
                    <text class="arrow">›</text>
                </view>
                <view class="menu-item" @click="goAbout">
                    <text class="menu-text">关于我们</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <view class="logout-btn" @click="handleLogout">退出登录</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { appState } from '@/utils/store';

function goBack() { uni.navigateBack(); }

function goAbout() {
    uni.navigateTo({ url: '/subPack/me/about' });
}

function handleLogout() {
    uni.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: (res) => {
            if (res.confirm) {
                appState.isLoggedIn = false;
                uni.reLaunch({ url: '/pages/login/login' });
            }
        },
    });
}
</script>

<style lang="scss" scoped>
.settings-page{background:#1A1A1A;min-height:100vh;}
.nav-header{display:flex;align-items:center;padding:20rpx 30rpx 30rpx;padding-top:calc(60rpx + var(--status-bar-height,0px));}
.back-btn{width:60rpx;height:60rpx;display:flex;align-items:center;justify-content:center;margin-right:20rpx;}
.back-icon{font-size:48rpx;color:#FFF;}
.nav-title{font-size:34rpx;color:#FFF;font-weight:600;}
.content{padding:0 30rpx;}
.setting-menu{margin:0 0 20rpx 0;}
.menu-item{display:flex;align-items:center;justify-content:space-between;padding:28rpx 0;border-bottom:1px solid #2A2A2A;}
.menu-item:last-child{border-bottom:none;}
.menu-text{font-size:28rpx;color:#FFF;}
.menu-value{font-size:26rpx;color:#808080;}
.arrow{font-size:36rpx;color:#808080;}
.logout-btn{text-align:center;color:#FF3B30;font-size:28rpx;padding:40rpx 0;}
</style>
