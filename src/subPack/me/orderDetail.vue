<template>
    <view class="page-container">
        <!-- 背景图 -->
        <image class="page-bg" src="/static/imgs/index_bg.png" mode="aspectFill"></image>

        <!-- 1. 顶部导航栏 -->
        <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="navbar-content">
                <!-- 返回按钮图标 -->
                <view class="nav-btn" @click="goBack">
                    <text class="icon-back"></text>
                </view>
                <view class="nav-title">订单详情</view>
                <!-- 占位符，保持标题居中 -->
                <view class="nav-placeholder"></view>
            </view>
        </view>

        <!-- 2. 主体内容区 -->
        <view class="main-content">
            <!-- 订单卡片 -->
            <view class="order-card">
                <!-- 第一行：金额与时间 -->
                <view class="card-row header-row">
                    <view class="title-group">
                        <text class="label-text">按次充值金额</text>
                        <text class="highlight-price">20元</text>
                    </view>
                    <text class="time-text">2025.10.29 10:25</text>
                </view>

                <!-- 分割线 -->
                <view class="divider"></view>

                <!-- 第二行：订单状态标签 -->
                <view class="card-row simple-row">
                    <text class="row-label">订单状态</text>
                </view>

                <!-- 第三行：具体状态值 -->
                <view class="card-row status-row">
                    <text class="status-val left">未使用</text>
                    <text class="status-val right">退款完成</text>
                </view>
            </view>

            <!-- 3. 底部温馨提示 -->
            <view class="tips-section">
                <view class="tips-title">温馨提醒：</view>
                <view class="tips-list">
                    <text class="tip-item">1.已使用不可退款（申请退款为灰色不可点击）</text>
                    <text class="tip-item">2.未使用，可申请退款</text>
                    <text class="tip-item">3.退款方式，原路返回</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 获取系统状态栏高度，适配刘海屏
const statusBarHeight = ref(0);

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
});

const goBack = () => {
    uni.navigateBack({
        delta: 1,
    });
};
</script>

<style lang="scss" scoped>
/* --- 全局变量定义 --- */
$bg-color: #050508; /* 页面整体背景 */
$card-bg: #161618; /* 卡片背景 */
$text-primary: #ffffff; /* 主要文字 */
$text-secondary: #9e9e9e; /* 次要文字/灰色 */
$accent-green: #00d672; /* 金额绿色 */
$border-color: #2c2c2e; /* 分割线颜色 */
$font-size-base: 30rpx;

.page-container {
    min-height: 100vh;
    background-color: $bg-color;
    color: $text-primary;
    display: flex;
    flex-direction: column;
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

/* --- 1. 导航栏样式 --- */
.custom-navbar {
    width: 100%;
    background-color: transparent; /* 透明背景，融入页面 */
    position: relative;
    z-index: 1;

    .navbar-content {
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30rpx;
        position: relative;
    }

    .nav-title {
        font-size: 34rpx;
        font-weight: 500;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .icon-back {
        display: inline-block;
        width: 20rpx;
        height: 20rpx;
        border-left: 4rpx solid #fff;
        border-bottom: 4rpx solid #fff;
        transform: rotate(45deg);
        margin-top: 6rpx;
    }

    .nav-placeholder {
        width: 20rpx; /* 占位平衡 */
    }
}

/* --- 2. 主体内容 --- */
.main-content {
    flex: 1;
    padding: 20rpx 30rpx;
    display: flex;
    flex-direction: column;
    border-radius: 30rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    margin: 30rpx;
    position: relative;
    z-index: 1;
}

/* 卡片样式 */
.order-card {  
    overflow: hidden;
    margin-bottom: 60rpx; /* 与底部的距离 */
}

.card-row {
    padding: 30rpx;
    display: flex;
    align-items: center;
}

/* 头部行：金额和时间 */
.header-row {
    justify-content: space-between;
    padding-bottom: 35rpx;

    .title-group {
        display: flex;
        align-items: baseline; /* 文字底部对齐 */

        .label-text {
            font-size: 32rpx;
            font-weight: bold;
            margin-right: 10rpx;
        }

        .highlight-price {
            color: $accent-green;
            font-size: 32rpx;
            font-weight: bold;
        }
    }

    .time-text {
        color: $text-secondary;
        font-size: 26rpx;
    }
}

/* 分割线 */
.divider {
    height: 1rpx;
    background-color: $border-color;
    width: 100%;
}

/* 简单行：只有左侧标题 */
.simple-row {
    padding-top: 35rpx;
    padding-bottom: 20rpx;

    .row-label {
        color: $text-secondary;
        font-size: 28rpx;
    }
}

/* 状态行：左右分布 */
.status-row {
    padding-top: 10rpx;
    padding-bottom: 40rpx;
    justify-content: space-between;

    .status-val {
        font-size: 32rpx;
        color: $text-primary;

        &.right {
            /* 右侧文字如果需要不同颜色可在此修改，目前图示为白色 */
        }
    }
}

/* --- 3. 底部提示 --- */
.tips-section {
    margin-top: auto; /* 推到底部 */
    padding-bottom: 40rpx;

    .tips-title {
        color: $text-secondary;
        font-size: 26rpx;
        margin-bottom: 16rpx;
    }

    .tips-list {
        display: flex;
        flex-direction: column;

        .tip-item {
            color: #666668; /* 比次要文字更暗一点 */
            font-size: 24rpx;
            line-height: 1.8;
            margin-bottom: 4rpx;
        }
    }
}
</style>
