<template>
    <view class="overlay" v-if="visible">
        <view class="modal-container">
            <!-- 关闭按钮 -->
            <view class="close-btn" @click="handleClose">
                <uni-icons type="closeempty" size="20" color="#FFFFFF"></uni-icons>
            </view>

            <text class="title">温馨提示&平台简介</text>

            <text class="description">
                本平台专注线下火锅搭子匹配服务，一键匹配同城 5 公里内同好，相约线下结伴开涮。主打低压力轻社交，帮你找到合拍火锅友，尽享火锅美食乐趣。
            </text>

            <text class="subtitle">收费规则</text>

            <view class="rules">
                <text class="rule-item">1. 平台匹配服务按次计费，单次匹配费用为1元。</text>
                <text class="rule-item">2. 匹配盲盒支持三选一，点击解锁即视为发起服务，将正常扣除对应次数/费用。</text>
                <text class="rule-item">3. 无论对方是否同意邀约，或是您主动取消匹配，本次匹配均会正常扣费。</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const handleClose = () => {
    emit('close');
};
</script>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    animation: fadeIn 0.3s ease-out;
}

.modal-container {
    background: rgba(0, 0, 0, 0.6);
    border: 2rpx solid rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20rpx);
    border-radius: 32rpx;
    padding: 50rpx 40rpx;
    width: 90%;
    max-width: 640rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
}

.close-btn {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}

.title {
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 24rpx;
    line-height: 1.5;
}

.description {
    color: #cccccc;
    font-size: 28rpx;
    line-height: 1.8;
    margin-bottom: 40rpx;
}

.subtitle {
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 16rpx;
    line-height: 1.5;
}

.rules {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.rule-item {
    color: #cccccc;
    font-size: 28rpx;
    line-height: 1.6;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes scaleIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}
</style>
