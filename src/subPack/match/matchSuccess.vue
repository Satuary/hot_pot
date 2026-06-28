<template>
    <view class="page success-page">
        <view class="success-content">
            <view class="fireworks-area">
                <text class="firework">🎉</text>
                <text class="firework-small left">🎊</text>
                <text class="firework-small right">✨</text>
            </view>
            <text class="success-title">恭喜匹配成功！</text>
            <text class="success-subtitle">找到一位火锅搭子</text>

            <!-- Matched User -->
            <view class="matched-card">
                <view class="matched-avatar">
                    <text>👤</text>
                </view>
                <text class="matched-name">火锅小公主</text>
                <text class="matched-bio">女 · 25岁 · 165cm</text>
                <view class="matched-tags">
                    <text class="m-tag">重庆火锅</text>
                    <text class="m-tag">麻辣</text>
                    <text class="m-tag">吃货交友</text>
                </view>
                <view class="matched-detail">
                    <text class="md-item">⏰ 今晚 19:00</text>
                    <text class="md-item">📍 海底捞(闵行店)</text>
                    <text class="md-item">💰 AA</text>
                </view>
            </view>

            <!-- Actions -->
            <view class="success-actions">
                <view class="gradient-btn active_btn" @click="contactNow">
                    查看联系方式
                </view>
                <view class="outline-btn" @click="goBack">
                    返回首页
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
function contactNow() {
    uni.showToast({ title: '已发送联系方式', icon: 'success' });
    setTimeout(() => {
        uni.switchTab({ url: '/pages/tabBar/view' });
    }, 1500);
}

function goBack() {
    uni.switchTab({ url: '/pages/tabBar/match' });
}
</script>

<style lang="scss" scoped>
.success-page {
    background: #1A1A1A;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60rpx;
}

.success-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.fireworks-area {
    position: relative;
    margin-bottom: 20rpx;
}

.firework {
    font-size: 100rpx;
}

.firework-small {
    font-size: 60rpx;
    position: absolute;
    top: 0;
}

.firework-small.left { left: -60rpx; }
.firework-small.right { right: -60rpx; }

.success-title {
    font-size: 40rpx;
    color: #FFD700;
    font-weight: 700;
    margin-bottom: 10rpx;
}

.success-subtitle {
    font-size: 28rpx;
    color: #B0B0B0;
    margin-bottom: 40rpx;
}

.matched-card {
    width: 100%;
    background: #242424;
    border-radius: 24rpx;
    padding: 50rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2rpx solid rgba(255,107,61,0.3);
    margin-bottom: 40rpx;
}

.matched-avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64rpx;
    margin-bottom: 20rpx;
}

.matched-name {
    font-size: 36rpx;
    color: #FFF;
    font-weight: 600;
    margin-bottom: 8rpx;
}

.matched-bio {
    font-size: 26rpx;
    color: #808080;
    margin-bottom: 20rpx;
}

.matched-tags {
    display: flex;
    gap: 16rpx;
    margin-bottom: 24rpx;
}

.m-tag {
    background: rgba(255,107,61,0.15);
    color: #FF8C66;
    padding: 8rpx 24rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
}

.matched-detail {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    width: 100%;
    padding-top: 24rpx;
    border-top: 1px solid #333;
}

.md-item {
    font-size: 26rpx;
    color: #B0B0B0;
}

.success-actions {
    width: 100%;
}

.outline-btn {
    width: 100%;
    text-align: center;
    padding: 24rpx;
    border: 2rpx solid #4A4A4A;
    border-radius: 50rpx;
    color: #B0B0B0;
    font-size: 30rpx;
    margin-top: 20rpx;
}
</style>
