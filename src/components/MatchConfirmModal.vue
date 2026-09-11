<template>
    <view class="overlay" v-if="visible">
        <view class="modal-container">
            <view class="avatar-wrapper">
                <image :src="avatar" mode="aspectFill" class="avatar"></image>
                <view class="view-btn" @click.stop="goPartnerProfile">点击查看</view>
            </view>

            <text class="description">{{ description }}</text>

            <view class="button-group">
                <button class="btn btn-cancel" @click="handleCancel">不合适</button>
                <button class="btn btn-confirm" @click="handleConfirm">同意</button>
            </view>
        </view>
    </view>
</template>

<script setup>
const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: String,
        default: 'https://picsum.photos/200',
    },
    description: {
        type: String,
        default: '系统把你推给我啦，咱俩的观影偏好超搭！这感觉就像拆盲盒开出了心心念念的隐藏款~要不要约一部片，沉浸式体验一场只属于我们的观影时光？',
    },
    recordId: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['cancel', 'confirm']);

// 纯 UI 组件：同意/拒绝接口由父页面（match.vue）统一调用，这里只负责抛出事件
const handleCancel = () => {
    emit('cancel');
};

const handleConfirm = () => {
    emit('confirm');
};

const goPartnerProfile = () => {
    uni.navigateTo({
        url: `/subPack/match/partnerProfile?id=${props.recordId}`,
    });
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
    background: rgba(18, 18, 18, 0.85);
    border: 2rpx solid rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(24rpx);
    border-radius: 36rpx;
    padding: 56rpx 44rpx;
    width: 86%;
    max-width: 640rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.avatar-wrapper {
    position: relative;
    margin-bottom: 40rpx;
}

.avatar {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.2);
}

.view-btn {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
    font-size: 22rpx;
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    white-space: nowrap;
}

.description {
    color: #ffffff;
    font-size: 28rpx;
    line-height: 1.8;
    text-align: center;
    margin-bottom: 50rpx;
}

.button-group {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    margin: 0 15rpx;
}

.btn::after {
    border: none;
}

.btn-cancel {
    background-color: #ffffff;
    color: #333333;
}

.btn-confirm {
    background: linear-gradient(270deg, #58b4ff 0%, #c927ff 100%);
    color: #ffffff;
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
