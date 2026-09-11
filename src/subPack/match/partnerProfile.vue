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
                    <image class="avatar" :src="profile.avatar || 'https://picsum.photos/200'" mode="aspectFill"></image>
                </view>
                <view class="profile-info">
                    <view class="name-row">
                        <text class="nickname">{{ profile.nickname || '火锅友' }}</text>
                        <view class="taste-tag" v-if="tasteText">{{ tasteText }}</view>
                    </view>
                    <view class="id-address-row">
                        <text class="id-text">ID:{{ profile.userId }}</text>
                        <image class="copy-icon" src="/static/imgs/file-copy-line.png" mode="aspectFit"></image>
                        <text class="address-text" v-if="addressText">地址：{{ addressText }}</text>
                    </view>
                </view>
            </view>

            <view class="info-tags">
                <view class="info-tag" v-if="bodyText">
                    <image class="info-tag-icon" src="/static/imgs/ruler-line.png" mode="aspectFit"></image>
                    <text>{{ bodyText }}</text>
                </view>
                <view class="info-tag" v-if="ageText">
                    <image class="info-tag-icon" src="/static/imgs/lz.png" mode="aspectFit"></image>
                    <text>{{ ageText }}</text>
                </view>
                <view class="info-tag" v-if="genderText">
                    <text>{{ genderText }}</text>
                </view>
            </view>

            <view class="pref-tags">
                <view class="pref-tag white" v-if="hotpotTypeText">{{ hotpotTypeText }}</view>
                <view class="pref-tag white" v-if="motivationText">{{ motivationText }}</view>
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
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app';
import {
    applyPhoneExchange,
    viewPartnerPhone,
    applyWechatExchange,
    viewPartnerWechat,
    approveWechatExchange,
    rejectWechatExchange,
    approvePhoneExchange,
    rejectPhoneExchange,
    getUserInfo,
    getMatchDetail,
} from '@/api/api';
import { hotpotTypeOptions, tasteOptions, motivationOptions } from '@/utils/store';
import { onWsMessage } from '@/utils/websocket';
import { WS_EVENT, setPartnerPageVisible, partnerPageVisible } from '@/common/matchSocket';

const statusBarHeight = ref(0);
const showContactBar = ref(false);
const recordId = ref('');
// 对方用户 id：地址栏透传优先，缺省时用 recordId 拉匹配详情兜底
const otherUserId = ref<number | string>('');

// 对方资料（mini/user/getUserInfo 返回）
const profile = reactive({
    avatar: '',
    nickname: '',
    userId: '' as number | string,
    gender: 0,
    age: 0,
    height: 0,
    weight: 0,
    taste: 0,
    hotpotType: 0,
    motivation: 0,
    address: '',
    province: '',
    city: '',
    district: '',
});

// 电话交换状态：idle-未申请  applied-已申请待对方同意  viewed-已可查看
const phoneStatus = ref<'idle' | 'applied' | 'viewed'>('idle');
// 微信交换状态：idle-未交换  applied-已申请待对方同意  viewed-已可查看
const wechatStatus = ref<'idle' | 'applied' | 'viewed'>('idle');

// 请求进行中标记，防止重复点击
const phoneSubmitting = ref(false);
const wechatSubmitting = ref(false);

// 标签类字段：接口返回 1 起始的数字索引，映射为文案
const tasteText = computed(() => tasteOptions[Number(profile.taste) - 1] || '');
const hotpotTypeText = computed(() => hotpotTypeOptions[Number(profile.hotpotType) - 1] || '');
const motivationText = computed(() => motivationOptions[Number(profile.motivation) - 1] || '');
// gender：1=男 2=女
const genderText = computed(() => (profile.gender === 1 ? '男' : profile.gender === 2 ? '女' : ''));
const bodyText = computed(() => {
    const parts: string[] = [];
    if (profile.height) parts.push(`${profile.height}cm`);
    if (profile.weight) parts.push(`${profile.weight}kg`);
    return parts.join(' ');
});
const ageText = computed(() => (profile.age ? `${profile.age}岁` : ''));
const addressText = computed(
    () => profile.address || [profile.province, profile.city, profile.district].filter(Boolean).join(''),
);

// 状态文本映射
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
            return '请求交换微信';
    }
});

// 获取状态栏高度
const systemInfo = uni.getSystemInfoSync();
statusBarHeight.value = systemInfo.statusBarHeight || 30;

// 全局 socket 消息退订函数
let unsubscribeWs: (() => void) | null = null;

onLoad((options: any) => {
    if (options?.from === 'view') {
        showContactBar.value = true;
    }
    // 联系方式交换接口均以 recordId 为参数，优先取地址栏，其次兜底本地存储的匹配记录ID
    recordId.value = options?.recordId || options?.id || uni.getStorageSync('recordId') || '';
    otherUserId.value = options?.otherUserId || options?.userId || '';
    loadPartnerProfile();
    // 订阅全局 socket：微信/电话交换申请、同意、拒绝事件实时弹窗并更新交换状态
    unsubscribeWs = onWsMessage(handleExchangeWsEvent);
});

onShow(() => {
    // 标记对方资料页在前台：交换类事件由本页处理，全局不再重复弹窗
    setPartnerPageVisible(true);
});

onHide(() => {
    setPartnerPageVisible(false);
});

onUnload(() => {
    setPartnerPageVisible(false);
    if (unsubscribeWs) {
        unsubscribeWs();
        unsubscribeWs = null;
    }
});

// 申请状态映射：0无申请 1申请中 2同意 3拒绝
function mapApplyStatus(status: number): 'idle' | 'applied' | 'viewed' {
    if (status === 2) return 'viewed';
    if (status === 1) return 'applied';
    return 'idle';
}

// 拉取对方资料：查看对方时传 otherUserId
async function loadPartnerProfile() {
    try {
        let uid = otherUserId.value;
        // 地址栏没带 otherUserId 时，用 recordId 拉匹配详情兜底取对方 userId
        if (!uid && recordId.value) {
            try {
                const detail: any = await getMatchDetail({ recordId: recordId.value });
                uid = detail?.otherUserId || detail?.userId || '';
                if (uid) otherUserId.value = uid;
            } catch {
                // 匹配详情失败不阻断资料拉取
            }
        }
        // 无法确定对方用户 id 时不拉取，避免无参调用误取本人信息
        if (!uid) return;
        const res: any = await getUserInfo({ otherUserId: uid });
        // 兼容两种返回结构：直接平铺 或 包在 miniUserInfo 内
        const d = res?.miniUserInfo || res || {};
        profile.avatar = d.avatar || '';
        profile.nickname = d.nickname || '';
        profile.userId = d.userId ?? '';
        profile.gender = Number(d.gender) || 0;
        profile.age = Number(d.age) || 0;
        profile.height = Number(d.height) || 0;
        profile.weight = Number(d.weight) || 0;
        profile.taste = Number(d.taste) || 0;
        profile.hotpotType = Number(d.hotpotType) || 0;
        profile.motivation = Number(d.motivation) || 0;
        profile.address = d.address || '';
        profile.province = d.province || '';
        profile.city = d.city || '';
        profile.district = d.district || '';
        // 联系方式交换状态回显
        phoneStatus.value = mapApplyStatus(Number(d.phoneApplyStatus));
        wechatStatus.value = mapApplyStatus(Number(d.wechatApplyStatus));
        // 接口返回的 recordId 作为联系方式交换参数兜底
        if (!recordId.value && d.recordId) {
            recordId.value = String(d.recordId);
        }
    } catch {
        // 错误提示已由 request 统一处理
    }
}

// 全局 socket 推送的联系方式交换事件：本页在前台时实时弹窗并同步交换状态
function handleExchangeWsEvent(data: any) {
    // 页面被覆盖/离开后不处理（交由全局处理器兜底）
    if (!partnerPageVisible.value) return;
    const type = data?.type || data?.eventType || data?.event;
    if (!type) return;
    // 只处理当前匹配记录的推送（recordId 不一致则忽略）
    const pushRecordId = data?.recordId != null ? String(data.recordId) : '';
    if (pushRecordId && recordId.value && pushRecordId !== String(recordId.value)) return;
    const rid = recordId.value || pushRecordId;

    switch (type) {
        // 有人申请交换微信：弹窗询问是否同意
        case WS_EVENT.WECHAT_APPLY: {
            uni.showModal({
                title: '微信交换申请',
                content: '对方想与你交换微信，是否同意？',
                confirmText: '同意',
                cancelText: '拒绝',
                success: async (res) => {
                    try {
                        if (res.confirm) {
                            await approveWechatExchange({ recordId: rid });
                            uni.showToast({ title: '已同意交换微信', icon: 'success' });
                        } else {
                            await rejectWechatExchange({ recordId: rid });
                            uni.showToast({ title: '已拒绝', icon: 'none' });
                        }
                        // 刷新交换状态回显
                        loadPartnerProfile();
                    } catch {
                        // 错误提示已由 request 统一处理
                    }
                },
            });
            break;
        }
        // 对方已同意交换微信：状态置为可查看，拉取微信号弹窗展示并支持复制
        case WS_EVENT.WECHAT_APPROVED: {
            wechatStatus.value = 'viewed';
            viewPartnerWechat({ recordId: rid })
                .then((res: any) => {
                    showContactModal('对方微信', extractWechat(res));
                })
                .catch(() => {
                    uni.showToast({ title: '对方已同意交换微信，可点击微信项查看', icon: 'none' });
                });
            break;
        }
        // 对方拒绝交换微信：回到未申请状态
        case WS_EVENT.WECHAT_REJECTED: {
            wechatStatus.value = 'idle';
            uni.showToast({ title: '对方拒绝交换微信', icon: 'none' });
            break;
        }
        // 有人申请交换电话：弹窗询问是否同意
        case WS_EVENT.PHONE_APPLY: {
            uni.showModal({
                title: '电话交换申请',
                content: '对方想与你交换电话，是否同意？',
                confirmText: '同意',
                cancelText: '拒绝',
                success: async (res) => {
                    try {
                        if (res.confirm) {
                            await approvePhoneExchange({ recordId: rid });
                            uni.showToast({ title: '已同意交换电话', icon: 'success' });
                        } else {
                            await rejectPhoneExchange({ recordId: rid });
                            uni.showToast({ title: '已拒绝', icon: 'none' });
                        }
                        // 刷新交换状态回显
                        loadPartnerProfile();
                    } catch {
                        // 错误提示已由 request 统一处理
                    }
                },
            });
            break;
        }
        // 对方已同意交换电话：状态置为可查看，拉取电话弹窗展示并支持复制
        case WS_EVENT.PHONE_APPROVED: {
            phoneStatus.value = 'viewed';
            viewPartnerPhone({ recordId: rid })
                .then((res: any) => {
                    showContactModal('对方电话', extractPhone(res));
                })
                .catch(() => {
                    uni.showToast({ title: '对方已同意交换电话，可点击电话项查看', icon: 'none' });
                });
            break;
        }
        // 对方拒绝交换电话：回到未申请状态
        case WS_EVENT.PHONE_REJECTED: {
            phoneStatus.value = 'idle';
            uni.showToast({ title: '对方拒绝交换电话', icon: 'none' });
            break;
        }
        default:
            break;
    }
}

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
    return res?.phone || '';
}

// 从接口返回中提取微信号
function extractWechat(res: any): string {
    return res?.wechat || '';
}

// 点击电话项：未申请则发起申请，已申请/已可查看则尝试查看对方电话
async function handlePhoneClick() {
    if (!recordId.value) {
        uni.showToast({ title: '暂无匹配记录', icon: 'none' });
        return;
    }
    if (phoneSubmitting.value) return;
    phoneSubmitting.value = true;
    try {
        if (phoneStatus.value === 'idle') {
            await applyPhoneExchange({ recordId: recordId.value });
            phoneStatus.value = 'applied';
            uni.showToast({ title: '已发送电话交换申请', icon: 'success' });
        } else {
            const res = await viewPartnerPhone({ recordId: recordId.value });
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
    if (!recordId.value) {
        uni.showToast({ title: '暂无匹配记录', icon: 'none' });
        return;
    }
    if (wechatSubmitting.value) return;
    wechatSubmitting.value = true;
    try {
        if (wechatStatus.value === 'idle') {
            await applyWechatExchange({ recordId: recordId.value });
            wechatStatus.value = 'applied';
            uni.showToast({ title: '已发送微信交换申请', icon: 'success' });
            // showContactModal('对方微信', extractWechat(res));
        } else {
            const res = await viewPartnerWechat({ recordId: recordId.value });
            wechatStatus.value = 'viewed';
            showContactModal('对方微信', extractWechat(res));
        }
    } catch {
        // 查看失败说明对方尚未同意，接口错误已由 request 统一提示
        if (wechatStatus.value !== 'idle') {
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
    overflow: hidden;
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
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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
