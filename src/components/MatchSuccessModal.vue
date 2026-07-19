<template>
    <view class="overlay" v-if="visible">
        <view class="modal-container">
            <text class="title">恭喜盲盒影友匹配成功，点击解锁影友吧~</text>

            <view class="user-list">
                <view v-for="(user, index) in userList" :key="index" class="user-item" @click="handleUserClick(user)">
                    <view class="avatar-wrapper" :class="{ locked: user.status === 'locked' }">
                        <image :src="user.avatar" mode="aspectFill" class="avatar"></image>
                        <image v-if="user.status === 'locked'" src="/static/imgs/lock-icon.png" mode="aspectFit" class="lock-icon"></image>
                    </view>

                    <text class="status-text">{{ user.statusText }}</text>
                    <text v-if="user.subStatusText" class="sub-status-text">{{ user.subStatusText }}</text>
                </view>
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
    userList: {
        type: Array,
        default: () => [
            {
                avatar: '/static/default-avatar-1.png',
                status: 'locked',
                statusText: '点击解锁',
            },
            {
                avatar: '/static/default-avatar-2.png',
                status: 'pending',
                statusText: '已发送申请',
                subStatusText: '等待对方同意',
            },
            {
                avatar: '/static/default-avatar-3.png',
                status: 'locked',
                statusText: '点击解锁',
            },
        ],
    },
});

const emit = defineEmits(['close', 'unlock']);

const handleUserClick = (user) => {
    if (user.status === 'locked') {
        emit('unlock', user);
    }
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
    align-items: center;
    animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.title {
    color: #ffffff;
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 50rpx;
    line-height: 1.5;
}

.user-list {
    display: flex;
    justify-content: space-around;
    width: 100%;
}

.user-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.avatar-wrapper {
    position: relative;
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 24rpx;
    border: 3rpx solid rgba(255, 255, 255, 0.15);
}

.avatar-wrapper.locked {
    /* border-color: rgba(168, 85, 247, 0.5); */
    border: 3rpx solid rgba(255, 255, 255, 0.15);
}

.avatar-wrapper.locked .avatar {
    filter: blur(8px);
}

.avatar {
    width: 100%;
    height: 100%;
    transition: filter 0.3s ease;
}

.lock-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50rpx;
    height: 50rpx;
    z-index: 10;
}

.status-text {
    color: #ffffff;
    font-size: 26rpx;
    text-align: center;
    font-weight: 500;
}

.sub-status-text {
    color: #8e8e93;
    font-size: 22rpx;
    text-align: center;
    margin-top: 8rpx;
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
