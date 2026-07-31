<template>
    <view class="me-page">
        <!-- 背景图 -->
        <image class="bg-image" src="/static/imgs/index_bg.png" mode="aspectFill"></image>
        <!-- 顶部到底部的暗色蒙层，让文字更清晰 -->
        <view class="bg-mask"></view>

        <!-- 顶部个人区域 -->
        <view class="profile-section" :style="{ paddingTop: statusBarHeight + 20 + 'px' }">
            <view class="profile-row">
                <view class="avatar-wrap">
                    <image :src="userInfo.avatar || defaultAvatar" class="profile-avatar" mode="aspectFill"></image>
                    <view class="edit-badge" @click="goEditProfile">
                        <uni-icons type="compose" size="14" color="#333333"></uni-icons>
                    </view>
                </view>

                <view class="profile-info">
                    <view class="name-row">
                        <text class="profile-name">{{ userInfo.nickname || '火锅友212' }}</text>
                        <view class="tag-spicy">
                            <text class="tag-spicy-txt">麻辣</text>
                        </view>
                    </view>
                    <view class="desc-row">
                        <text class="desc-text">ID:{{ userInfo.id || '30145' }}</text>
                        <view class="copy-btn" @click="copyId">
                            <image class="copy-icon" src="/static/imgs/file-copy-line.png" mode="aspectFit"></image>
                        </view>
                        <text class="desc-text">地址：{{ userInfo.address || '美景大厦' }}</text>
                    </view>
                </view>
            </view>

            <!-- 信息标签组：身高/年龄/性别 -->
            <view class="tags-row">
                <view class="tag-item">
                    <image class="tag-icon" src="/static/imgs/ruler-line.png" mode="aspectFit"></image>
                    <text class="tag-txt">{{ userInfo.height || '170' }}cm {{ userInfo.weight || '60' }}kg</text>
                </view>
                <view class="tag-item">
                    <image class="tag-icon" src="/static/imgs/lz.png" mode="aspectFit"></image>
                    <text class="tag-txt">{{ userInfo.age || '25' }}岁</text>
                </view>
                <view class="tag-item">
                    <text class="tag-txt">{{ userInfo.gender || '男' }}</text>
                </view>
            </view>

            <!-- 火锅类型/偏好标签 -->
            <view class="tags-row">
                <view class="pill-tag" v-for="(t, i) in tasteTags" :key="'t' + i">
                    <text class="pill-txt">{{ t }}</text>
                </view>
            </view>
        </view>

        <!-- 充值入口 -->
        <view class="recharge-card" @click="goRecharge">
            <view class="recharge-left">
                <view class="recharge-icon-wrap">
                    <uni-icons type="wallet" size="20" color="#FFFFFF"></uni-icons>
                </view>
                <text class="recharge-label">充值</text>
            </view>
            <uni-icons type="right" size="20" color="#ffffff"></uni-icons>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { isLogin, isProfileComplete, getUserInfo } from '@/utils/auth';

const statusBarHeight = ref(0);
const userInfo = ref<any>({});
const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop';

// 顶部"重庆火锅"、"尝鲜打卡"等标签
const tasteTags = ref<string[]>(['重庆火锅', '尝鲜打卡']);

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;

    const info = getUserInfo();
    if (info) {
        userInfo.value = info;
    }
});

// TabBar 页面守卫：每次显示时检查登录和资料完善状态
onShow(() => {
    if (!isLogin()) {
        uni.reLaunch({ url: '/pages/login/login' });
        return;
    }
    if (!isProfileComplete()) {
        uni.reLaunch({ url: '/pages/profile/complete' });
    }
});

// 复制 ID
const copyId = () => {
    const id = userInfo.value.id || '30145';
    uni.setClipboardData({
        data: id,
        success: () => {
            uni.showToast({ title: 'ID 已复制', icon: 'success', duration: 1500 });
        },
    });
};

// 充值
const goRecharge = () => {
    uni.navigateTo({
        url: '/subPack/me/recharge',
    });
};

// 编辑个人资料
const goEditProfile = () => {
    uni.navigateTo({
        url: '/subPack/me/editProfile',
    });
};
</script>

<style lang="scss" scoped>
.me-page {
    position: relative;
    min-height: 100vh;
    background: #0d0d0d;
    padding: 0 40rpx 60rpx;
    box-sizing: border-box;
}

/* 铺满全屏背景图 */
.bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    // filter: blur(8px);
    // opacity: 0.45;
}

/* 暗色蒙层 */
.bg-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    // background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(13, 13, 13, 0.6) 100%);
}

/* ======== 个人信息 ======== */
.profile-section {
    position: relative;
    z-index: 1;
    padding-bottom: 30rpx;
}

.profile-row {
    display: flex;
    align-items: center;
    gap: 28rpx;
    margin-bottom: 36rpx;
}

.avatar-wrap {
    position: relative;
    width: 150rpx;
    height: 150rpx;
    flex-shrink: 0;

    .profile-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 4rpx solid #ffffff;
        background: #2a2a2a;
    }

    .edit-badge {
        position: absolute;
        right: 0;
        bottom: 4rpx;
        width: 36rpx;
        height: 36rpx;
        background: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.4);
    }
}

.profile-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding-top: 8rpx;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
}

.profile-name {
    font-size: 40rpx;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 1rpx;
}

.tag-spicy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10rpx 14rpx;
    // background: rgba(72, 115, 20, 0.2);
    background: rgb(104 181 11 / 20%);
    border-radius: 8rpx;
    .tag-spicy-txt {
        font-size: 22rpx;
        color: #6de18f;
        line-height: 1;
    }
}

.desc-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.75);
    flex-wrap: nowrap;
}

.desc-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.75);
    white-space: nowrap;
}

.copy-btn {
    flex-shrink: 0;

    &:active {
        opacity: 0.5;
    }
}

.copy-icon {
    width: 32rpx;
    height: 32rpx;
}

.desc-divider {
    width: 1rpx;
    height: 22rpx;
    background: rgba(255, 255, 255, 0.25);
    margin: 0 6rpx;
}

/* ======== 标签组 ======== */
.tags-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14rpx;
    margin-bottom: 18rpx;
}

/* 半透明深色标签（170cm、25岁、男） */
.tag-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    height: 52rpx;
    padding: 0 20rpx;
    background: rgba(0, 0, 0, 0.35);
    border: 1rpx solid rgba(255, 255, 255, 0.12);
    border-radius: 30rpx;
    box-sizing: border-box;

    .tag-icon {
        width: 28rpx;
        height: 28rpx;
    }

    .tag-txt {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.92);
        line-height: 1;
    }
}

/* 白色胶囊标签（重庆火锅、尝鲜打卡） */
.pill-tag {
    height: 52rpx;
    padding: 0 26rpx;
    background: #ffffff;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    box-sizing: border-box;

    .pill-txt {
        font-size: 24rpx;
        color: #000000;
        font-weight: 600;
        line-height: 1;
    }
}

/* ======== 充值卡 ======== */
.recharge-card {
    background: rgba(0, 0, 0, 0.6);
    position: relative;
    z-index: 1;
    margin-top: 40rpx;
    padding: 30rpx 36rpx;
    background: #1a1a1a;
    border: 1rpx solid #ffffff;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s;

    &:active {
        background: #222;
        transform: scale(0.99);
    }
}

.recharge-left {
    display: flex;
    align-items: center;
    gap: 24rpx;
}

/* 充值图标：蓝紫渐变（实际项目可换 SVG/PNG） */
.recharge-icon-wrap {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50rpx;
    background: linear-gradient(135deg, #4d8bff 0%, #b04dff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6rpx 18rpx rgba(77, 139, 255, 0.35);
    overflow: hidden;
}

.recharge-label {
    font-size: 32rpx;
    // font-weight: 600;
    color: #ffffff;
}
</style>
