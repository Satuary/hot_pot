<template>
    <uni-popup ref="popup" type="center" :mask-click="false">
        <view class="popup-container">
            <!-- 标题 -->
            <text class="title">恭喜盲盒影友匹配成功，快来观影吧！</text>

            <!-- 描述文本 -->
            <text class="description"> 每次匹配到新的观影搭子，都像拆盲盒般惊喜！你永远猜不到，身边的TA，是沉稳可靠的地道大叔，还是阳光帅气的元气男孩；亦或是温柔细腻的邻家姐姐，还是灵动俏皮的甜酷少女。 </text>

            <!-- 用户信息区 -->
            <view class="users-wrapper">
                <!-- 左侧用户 -->
                <view class="user-item">
                    <image class="avatar" src="/static/images/avatar1.png" mode="aspectFill"></image>
                    <text class="username">好汉共</text>
                </view>

                <!-- 中间连接符 -->
                <view class="connector">
                    <image class="connector-img" src="/static/images/lightning-bolt.png" mode="widthFix"></image>
                </view>

                <!-- 右侧用户 -->
                <view class="user-item">
                    <view class="avatar-wrapper" @click="handleViewProfile">
                        <image class="avatar" src="/static/images/avatar2.png" mode="aspectFill"></image>
                        <view class="view-btn">点击查看</view>
                    </view>
                    <text class="username">大吉大</text>
                </view>
            </view>

            <!-- 按钮区 -->
            <view class="button-group">
                <button class="btn btn-cancel" @click="handleCancel">不合适</button>
                <button class="btn btn-confirm" @click="handleConfirm">确认匹配</button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref } from 'vue';

// 定义事件，用于向父组件通信
const emit = defineEmits(['cancel', 'confirm']);

// 获取 uni-popup 组件实例
const popup = ref(null);

/**
 * 打开弹框
 */
const open = () => {
    if (popup.value) {
        popup.value.open();
    }
};

/**
 * 关闭弹框
 */
const close = () => {
    if (popup.value) {
        popup.value.close();
    }
};

/**
 * 处理"不合适"按钮点击
 */
const handleCancel = () => {
    close();
    // 通知父组件
    emit('cancel');
};

/**
 * 处理"确认匹配"按钮点击
 */
const handleConfirm = () => {
    close();
    // 通知父组件
    emit('confirm');
    // 跳转到查看页并标记显示等待弹窗
    uni.setStorageSync('showWaitingPopup', true);
    uni.switchTab({
        url: '/pages/tabBar/view',
    });
};

/**
 * 查看对方资料
 */
const handleViewProfile = () => {
    uni.navigateTo({
        url: '/subPack/match/partnerProfile',
    });
};

// 将方法暴露给父组件调用
defineExpose({
    open,
    close,
});
</script>

<style>
/* uni-popup type="center" 内部容器 overflow:hidden 会裁掉边框 */
.uni-popup__wrapper-box,
.uni-popup__wrapper {
  overflow: visible !important;
}

.popup-container {
    background: rgba(0, 0, 0, 0.6);
    border: 2rpx solid rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20rpx);
    border-radius: 32rpx;
    padding: 50rpx 40rpx;
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

.avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 3rpx solid rgba(255, 255, 255, 0.15);
}

.username {
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 500;
    margin-top: 24rpx;
}

.connector {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 120rpx;
}

.connector-img {
    width: 100rpx;
    opacity: 0.8;
}

.avatar-wrapper {
    position: relative;
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
