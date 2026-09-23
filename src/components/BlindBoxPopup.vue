<template>
    <view class="overlay" v-if="visible">
        <view class="modal-container">
            <!-- 标题 -->
            <text class="title">恭喜盲盒锅友匹配成功，快来吃火锅吧！</text>

            <!-- 描述文本 -->
            <text class="description"> 每次匹配到新的火锅搭子，都像拆盲盒般惊喜！你永远猜不到，身边的TA，是沉稳可靠的地道大叔，还是阳光帅气的元气男孩；亦或是温柔细腻的邻家姐姐，还是灵动俏皮的甜酷少女。 </text>

            <!-- 用户信息区 -->
            <view class="users-wrapper">
                <!-- 左侧用户：发起方本人 -->
                <view class="user-item">
                    <view class="avatar-area">
                        <image class="flame-bg flame-left" src="/static/imgs/flame2.png" mode="widthFix"></image>
                        <image class="avatar" :src="myAvatar" mode="aspectFill"></image>
                    </view>
                </view>

                <!-- 右侧用户：被选中的锅友 -->
                <view class="user-item">
                    <view class="avatar-area">
                        <image class="flame-bg flame-right" src="/static/imgs/flame.png" mode="widthFix"></image>
                        <view class="avatar-wrapper" @click="handleViewProfile">
                            <image class="avatar" :src="otherAvatar" mode="aspectFill"></image>
                            <view class="view-btn">点击查看</view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 按钮区 -->
            <view class="button-group">
                <button class="btn btn-cancel" @click="handleCancel">不合适</button>
                <button class="btn btn-confirm" @click="handleConfirm">确认匹配</button>
            </view>
        </view>
    </view>
</template>

<script setup>
// 与其他弹窗一致：visible 控制显隐，操作通过事件通知父组件
const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    // 发起方本人头像（createMatch 返回的 matchUserAvatar）
    myAvatar: {
        type: String,
        default: '/static/imgs/default-avatar.jpeg',
    },
    // 被选中方头像（createMatch 返回的 matchedUserAvatar）
    otherAvatar: {
        type: String,
        default: '/static/imgs/default-avatar.jpeg',
    },
    // 被选中方用户id，查看对方资料时透传给资料页
    otherUserId: {
        type: [String, Number],
        default: '',
    },
});

const emit = defineEmits(['cancel', 'confirm']);

/**
 * 处理"不合适"按钮点击
 */
const handleCancel = () => {
    emit('cancel');
};

/**
 * 处理"确认匹配"按钮点击
 */
const handleConfirm = () => {
    emit('confirm');
};

/**
 * 查看对方资料
 */
const handleViewProfile = () => {
    uni.navigateTo({
        url: `/subPack/match/partnerProfile?from=BlindBoxPopup&userId=${props.otherUserId}`,
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
}

.modal-container {
    background: rgba(0, 0, 0, 0.6);
    border: 2rpx solid rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20rpx);
    border-radius: 32rpx;
    padding: 50rpx 40rpx;
    width: 86%;
    max-width: 640rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.title {
    color: #ffffff;
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 50rpx;
    line-height: 1.5;
}

.description {
    color: #cccccc;
    font-size: 24rpx;
    line-height: 1.6;
    text-align: center;
    margin-bottom: 50rpx;
}

.users-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 50rpx;
}

.user-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.avatar-area {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.flame-bg {
    position: absolute;
    width: 294rpx;
    height: 253rpx;
    z-index: 0;
}

.flame-left {
    top: 48%;
    left: 75%;
    transform: translate(-50%, -50%);
}

.flame-right {
    top: 42%;
    left: 16%;
    transform: translate(-50%, -50%);
}

.avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 3rpx solid rgba(255, 255, 255, 0.15);
    position: relative;
    z-index: 1;
    background: #fafafa;
}

.username {
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 500;
    margin-top: 24rpx;
    position: relative;
    z-index: 1;
}

.avatar-wrapper {
    position: relative;
    z-index: 1;
}

.view-btn {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fbbd08;
    color: #fff;
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    white-space: nowrap;
    z-index: 2;
}

.button-group {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 30rpx;
    border: none;
    margin: 0 10rpx;
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
</style>
