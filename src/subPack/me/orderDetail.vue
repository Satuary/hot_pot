<template>
    <view class="page order-page">
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view class="nav-back" @click="goBack">
                    <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
                </view>
                <view class="nav-title">订单详情</view>
            </view>
        </view>

        <view class="content">
            <view class="dark-card">
                <view class="order-header">
                    <text class="order-title">{{ order.desc }}</text>
                    <text class="order-amount">{{ order.amountText }}</text>
                </view>

                <view class="divider"></view>

                <view class="order-time">{{ order.time }}</view>

                <view class="divider"></view>

                <view class="order-status">
                    <view class="info-row">
                        <text class="info-label">订单状态</text>
                        <text class="info-value">{{ order.statusText }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">退款状态</text>
                        <text class="info-value">{{ order.refundStatusText }}</text>
                    </view>
                </view>

                <view class="divider"></view>

                <view class="reminder">
                    <text class="section-title">温馨提醒</text>
                    <text class="info-text">1.已使用不可退款（申请退款为灰色不可点击）</text>
                    <text class="info-text">2.未使用，可申请退款</text>
                    <text class="info-text">3.退款方式，原路返回</text>
                </view>
            </view>
        </view>

        <view v-if="order.statusText === '未使用'" class="bottom-btn">
            <view class="gradient-btn active_btn" @click="goRefund">申请退款</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const statusBarHeight = ref(0);

const order = reactive({
    id: '',
    desc: '按次充值金额',
    amount: 20,
    amountText: '20元',
    time: '2025.10.29 10:25',
    statusText: '未使用',
    refundStatusText: '退款完成',
});

onLoad((options: any) => {
    if (options.desc && options.amount !== undefined) {
        order.id = options.id || '';
        order.desc = decodeURIComponent(options.desc) + '金额';
        order.amount = parseFloat(options.amount) || 0;
        order.amountText = `${order.amount}元`;
        order.time = decodeURIComponent(options.time) || '2025.10.29 10:25';
    }
});

function goBack() {
    uni.navigateBack();
}

function goRefund() {
    uni.navigateTo({
        url: `/subPack/me/refund?id=${order.id}`,
    });
}

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
});
</script>

<style lang="scss" scoped>
.order-page {
    min-height: 100vh;
    background: #000;
}

.nav-bar {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background: #000;
    z-index: 100;

    .nav-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 88rpx;
        padding: 0 30rpx;
        position: relative;
    }

    .nav-back {
        position: absolute;
        left: 20rpx;
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .nav-title {
        font-size: 34rpx;
        color: #fff;
        font-weight: 500;
    }
}

.content {
    padding: 30rpx;
}

.dark-card {
    margin: 0;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20rpx;
}

.order-title {
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
}

.order-amount {
    font-size: 32rpx;
    color: #4cd964;
    font-weight: 600;
}

.order-time {
    font-size: 26rpx;
    color: #808080;
    padding: 20rpx 0;
}

.divider {
    height: 1rpx;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 -30rpx;
}

.order-status {
    padding: 20rpx 0;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 14rpx 0;
}

.info-label {
    font-size: 28rpx;
    color: #808080;
}

.info-value {
    font-size: 28rpx;
    color: #fff;
}

.reminder {
    padding-top: 20rpx;
}

.section-title {
    font-size: 28rpx;
    color: #808080;
    margin-bottom: 16rpx;
    display: block;
}

.info-text {
    font-size: 24rpx;
    color: #666;
    line-height: 1.8;
    display: block;
}

.bottom-btn {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    padding: 30rpx;
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
    z-index: 10;
}
</style>
