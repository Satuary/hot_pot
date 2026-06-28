<template>
    <view class="page about-page">
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">关于我们</text>
        </view>

        <view class="content">
            <view class="logo-area">
                <view class="logo-circle">
                    <text class="logo-text">月最近</text>
                    <text class="logo-main">火锅</text>
                </view>
                <text class="version">v1.0.0</text>
            </view>

            <text class="description">
                月最近火锅是一款专注于火锅社交的应用，
                帮助用户找到志同道合的火锅搭子，
                让吃火锅不再孤单。
            </text>

            <view class="dark-card">
                <view class="info-row">
                    <text class="info-label">官方网站</text>
                    <text class="info-value">www.hotpotbuddy.com</text>
                </view>
                <view class="info-row">
                    <text class="info-label">联系邮箱</text>
                    <text class="info-value">contact@hotpotbuddy.com</text>
                </view>
                <view class="info-row">
                    <text class="info-label">客服电话</text>
                    <text class="info-value">400-888-9999</text>
                </view>
            </view>

            <text class="copyright">Copyright © 2023 HotPotBuddy. All rights reserved.</text>
        </view>
    </view>
</template>

<script setup lang="ts">
function goBack() { uni.navigateBack(); }
</script>

<style lang="scss" scoped>
.about-page{background:#1A1A1A;min-height:100vh;}
.nav-header{display:flex;align-items:center;padding:20rpx 30rpx 30rpx;padding-top:calc(60rpx + var(--status-bar-height,0px));}
.back-btn{width:60rpx;height:60rpx;display:flex;align-items:center;justify-content:center;margin-right:20rpx;}
.back-icon{font-size:48rpx;color:#FFF;}
.nav-title{font-size:34rpx;color:#FFF;font-weight:600;}
.content{padding:0 30rpx;}
.logo-area{display:flex;flex-direction:column;align-items:center;padding:60rpx 0 40rpx;}
.logo-circle{width:160rpx;height:160rpx;border-radius:50%;background:linear-gradient(135deg,#FF6B3D,#FF3D3D);display:flex;flex-direction:column;align-items:center;justify-content:center;}
.logo-text{font-size:24rpx;color:rgba(255,255,255,.8);}
.logo-main{font-size:40rpx;color:#FFF;font-weight:700;letter-spacing:8rpx;}
.version{font-size:24rpx;color:#808080;margin-top:16rpx;}
.description{font-size:26rpx;color:#B0B0B0;line-height:1.8;text-align:center;padding:0 20rpx;margin-bottom:30rpx;}
.dark-card{margin:0 0 30rpx 0;}
.info-row{display:flex;justify-content:space-between;padding:20rpx 0;border-bottom:1px solid #2A2A2A;}
.info-row:last-child{border-bottom:none;}
.info-label{font-size:26rpx;color:#808080;}
.info-value{font-size:26rpx;color:#FFF;}
.copyright{text-align:center;font-size:22rpx;color:#555;padding:40rpx 0;}
</style>
