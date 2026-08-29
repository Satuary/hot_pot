<template>
    <view class="page partner-profile-page">
        <!-- 背景图 -->
        <image class="page-bg" src="/static/imgs/index_bg.png" mode="aspectFill"></image>

        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view class="nav-back" @click="goBack">
                    <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 用户信息卡片 -->
        <view class="profile-card">
            <view class="profile-main">
                <view class="avatar-wrap">
                    <image class="avatar" src="https://picsum.photos/200" mode="aspectFill"></image>
                </view>
                <view class="profile-info">
                    <view class="name-row">
                        <text class="nickname">火锅友212</text>
                        <view class="taste-tag">麻辣</view>
                    </view>
                    <view class="id-address-row">
                        <text class="id-text">ID:30145</text>
                        <image class="copy-icon" src="/static/imgs/file-copy-line.png" mode="aspectFit"></image>
                        <text class="address-text">地址：美景大厦</text>
                    </view>
                </view>
            </view>

            <view class="info-tags">
                <view class="info-tag">
                    <image class="info-tag-icon" src="/static/imgs/ruler-line.png" mode="aspectFit"></image>
                    <text>170cm 60kg</text>
                </view>
                <view class="info-tag">
                    <image class="info-tag-icon" src="/static/imgs/lz.png" mode="aspectFit"></image>
                    <text>25岁</text>
                </view>
                <view class="info-tag">
                    <text>男</text>
                </view>
            </view>

            <view class="pref-tags">
                <view class="pref-tag white">重庆火锅</view>
                <view class="pref-tag white">尝鲜打卡</view>
            </view>

            <!-- 交换联系方式 -->
            <view class="contact-bar" v-if="showContactBar">
                <view class="contact-item" @click="handlePhoneClick">
                    <image class="contact-icon" src="/static/imgs/dh.png" mode="aspectFit"></image>
                    <text class="contact-text">{{ phoneText }}</text>
                </view>
                <view class="contact-divider"></view>
                <view class="contact-item" @click="handleWechatClick">
                    <image class="contact-icon" src="/static/imgs/wx.png" mode="aspectFit"></image>
                    <text class="contact-text">{{ wechatText }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import {
    applyPhoneExchange,
    viewPartnerPhone,
    applyWechatExchange,
    viewPartnerWechat,
} from '@/api/api';

const statusBarHeight = ref(0);
const showContactBar = ref(false);
const matchId = ref('');

// 电话交换状态：idle-未申请  applied-已申请待对方同意  viewed-已可查看
const phoneStatus = ref<'idle' | 'applied' | 'viewed'>('idle');
// 微信交换状态：idle-未交换  applied-已申请待对方同意  viewed-已可查看
const wechatStatus = ref<'idle' | 'applied' | 'viewed'>('idle');

// 请求进行中标记，防止重复点击
const phoneSubmitting = ref(false);
const wechatSubmitting = ref(false);

const phoneText = computed(() => {
    switch (phoneStatus.value) {
        case 'applied':
            return '已申请，等待同意';
        case 'viewed':
            return '查看对方电话';
        default:
            return '请求交换电话';
    }
});

const wechatText = computed(() => {
    switch (wechatStatus.value) {
        case 'applied':
            return '已申请，等待同意';
        case 'viewed':
            return '查看对方微信';
        default:
            return '点击查看';
    }
});

// 获取状态栏高度
const systemInfo = uni.getSystemInfoSync();
statusBarHeight.value = systemInfo.statusBarHeight || 30;

onLoad((options: any) => {
    if (options?.from === 'view') {
        showContactBar.value = true;
        // 联系方式交换接口均以 matchId 为参数，优先取地址栏，其次兜底本地存储的匹配记录ID
        matchId.value = options?.matchId || options?.id || uni.getStorageSync('recordId') || '';
    }
});

// 展示联系方式，支持一键复制
function showContactModal(title: string, value: string) {
    if (!value) {
        uni.showToast({ title: '暂未获取到联系方式', icon: 'none' });
        return;
    }
    uni.showModal({
        title,
        content: `${title}：${value}`,
        confirmText: '复制',
        showCancel: false,
        success: () => {
            uni.setClipboardData({ data: value });
        },
    });
}

// 从接口返回中提取手机号
function extractPhone(res: any): string {
    return res?.phone || res?.mobile || res?.phoneNumber || '';
}

// 从接口返回中提取微信号
function extractWechat(res: any): string {
    return res?.wechat || res?.wechatId || res?.wxId || '';
}

// 点击电话项：未申请则发起申请，已申请/已可查看则尝试查看对方电话
async function handlePhoneClick() {
    if (!matchId.value) {
        uni.showToast({ title: '暂无匹配记录', icon: 'none' });
        return;
    }
    if (phoneSubmitting.value) return;
    phoneSubmitting.value = true;
    try {
        if (phoneStatus.value === 'idle') {
            await applyPhoneExchange({ matchId: matchId.value });
            phoneStatus.value = 'applied';
            uni.showToast({ title: '已发送电话交换申请', icon: 'success' });
        } else {
            const res = await viewPartnerPhone({ matchId: matchId.value });
            phoneStatus.value = 'viewed';
            showContactModal('对方电话', extractPhone(res));
        }
    } catch {
        // 查看失败说明对方尚未同意，接口错误已由 request 统一提示
        if (phoneStatus.value !== 'idle') {
            uni.showToast({ title: '对方还未同意，请耐心等待', icon: 'none' });
        }
    } finally {
        phoneSubmitting.value = false;
    }
}

// 点击微信项：未交换时先尝试查看，失败则引导发起交换申请
async function handleWechatClick() {
    if (!matchId.value) {
        uni.showToast({ title: '暂无匹配记录', icon: 'none' });
        return;
    }
    if (wechatSubmitting.value) return;
    wechatSubmitting.value = true;
    try {
        const res = await viewPartnerWechat({ matchId: matchId.value });
        wechatStatus.value = 'viewed';
        showContactModal('对方微信', extractWechat(res));
    } catch {
        // 尚未建立交换：引导用户发起微信交换申请
        if (wechatStatus.value !== 'applied') {
            uni.showModal({
                title: '交换微信',
                content: '尚未交换微信，是否向对方发起交换申请？',
                confirmText: '申请',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            await applyWechatExchange({ matchId: matchId.value });
                            wechatStatus.value = 'applied';
                            uni.showToast({ title: '已发送微信交换申请', icon: 'success' });
                        } catch {
                            // 申请失败错误已由 request 统一提示
                        }
                    }
                },
            });
        } else {
            uni.showToast({ title: '对方还未同意，请耐心等待', icon: 'none' });
        }
    } finally {
        wechatSubmitting.value = false;
    }
}

function goBack() {
    uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.partner-profile-page {
    min-height: 100vh;
    background: #000000;
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

.nav-bar {
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
}

.nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
}

.nav-back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-card {
    padding: 20rpx 32rpx;
    position: relative;
    z-index: 1;
}

.profile-main {
    display: flex;
    align-items: center;
}

.avatar-wrap {
    position: relative;
    width: 140rpx;
    height: 140rpx;
    flex-shrink: 0;
}

.avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 3rpx solid rgba(255, 255, 255, 0.3);
}

.profile-info {
    flex: 1;
    margin-left: 28rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.name-row {
    display: flex;
    align-items: center;
}

.nickname {
    font-size: 38rpx;
    font-weight: 600;
    color: #ffffff;
}

.taste-tag {
    margin-left: 16rpx;
    padding: 4rpx 14rpx;
    border-radius: 8rpx;
    background: rgba(82, 196, 26, 0.2);
    color: #52c41a;
    font-size: 22rpx;
    border: 1rpx solid rgba(82, 196, 26, 0.35);
}

.id-address-row {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
}

.id-text {
    font-size: 24rpx;
    color: #999999;
}

.copy-icon {
    width: 28rpx;
    height: 28rpx;
    margin-left: 8rpx;
    margin-right: 20rpx;
}

.address-text {
    font-size: 24rpx;
    color: #999999;
}

.info-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 36rpx;
}

.info-tag {
    display: inline-flex;
    align-items: center;
    padding: 10rpx 22rpx;
    border-radius: 28rpx;
    background: rgba(255, 255, 255, 0.12);
    color: #cccccc;
    font-size: 24rpx;
}

.info-tag-icon {
    width: 24rpx;
    height: 24rpx;
    margin-right: 6rpx;
}

.pref-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 28rpx;
}

.pref-tag {
    padding: 12rpx 30rpx;
    border-radius: 32rpx;
    font-size: 26rpx;
}

.pref-tag.white {
    background: #ffffff;
    color: #333333;
}

.contact-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 50rpx 0rpx 0;
    padding: 30rpx 0;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.08);
    border: 1rpx solid rgba(255, 255, 255, 0.12);
}

.contact-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.contact-divider {
    width: 1rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.15);
}

.contact-text {
    font-size: 28rpx;
    color: #ffffff;
}

.contact-icon {
    width: 40rpx;
    height: 40rpx;
}
</style>
