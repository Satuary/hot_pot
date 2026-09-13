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

            <!-- 当前为匹配方即当前userId = myUserId 并且 匹配状态是匹配上即 matchStatus 为 1 时 显示交换联系方式 -->
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

            <!-- 当前为被匹配方 即当前userId = otherUserId 并且 匹配状态是待确认即 matchStatus 为 0 时 显示匹配信息 -->
            <view class="info-card" v-if="showMatchInfoCard">
                <!-- 左侧时间区 -->
                <view class="time-section">
                    <text class="date-text">{{ displayDate || '2023-01-01' }}</text>
                    <text class="time-text">{{ displayTime || '12:00' }}</text>
                </view>

                <!-- 分割线 -->
                <view class="divider"></view>

                <!-- 右侧详情区 -->
                <view class="detail-section">
                    <view class="title-row">
                        <view class="icon-pin">
                            <image class="icon-fire" src="/static/imgs/location.png" mode="aspectFit"></image>
                        </view>
                        <text class="shop-name">{{ shopName || '火锅店' }}</text>
                    </view>

                    <view class="info-row">
                        <text class="label">火锅类型：</text>
                        <text class="value">{{ matchHotpotTypeText || '火锅类型' }}</text>
                    </view>

                    <view class="info-row">
                        <text class="label">付费方式：</text>
                        <text class="value">{{ payTypeText || '付费方式' }}</text>
                    </view>
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
import type { MatchDetailItem } from '@/api/api';
import { hotpotTypeOptions, tasteOptions, motivationOptions } from '@/utils/store';
import { hotpotTypeText as hotpotTypeTextMap, payTypeCodeText } from '@/config/matchOptions';
import { getUserInfo as getLocalUserInfo } from '@/utils/auth';
import { onWsMessage } from '@/utils/websocket';
import { WS_EVENT, setPartnerPageVisible, partnerPageVisible } from '@/common/matchSocket';

const statusBarHeight = ref(0);
const recordId = ref('');
// 对方用户 id：地址栏透传优先，缺省时用 recordId 拉匹配详情兜底
const otherUserId = ref<number | string>('');
// 匹配记录详情：用于判断当前用户角色（匹配方/被匹配方）、matchStatus 及渲染匹配信息卡
const matchDetail = ref<MatchDetailItem | null>(null);

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

// 当前登录用户 id（本地缓存，字段兼容 id/userId）
const currentUserId = computed(() => {
    const u: any = getLocalUserInfo();
    return u?.id ?? u?.userId ?? '';
});

// 角色判断：匹配记录中 myUserId 为发起匹配方，otherUserId 为被匹配方
const isMatcher = computed(
    () => !!matchDetail.value && String(currentUserId.value) === String(matchDetail.value.myUserId),
);
const isMatchedParty = computed(
    () => !!matchDetail.value && String(currentUserId.value) === String(matchDetail.value.otherUserId),
);

// 当前为匹配方（userId = myUserId）且 matchStatus 为 1（已匹配）时，显示交换联系方式
const showContactBar = computed(
    () => isMatcher.value && Number(matchDetail.value?.matchStatus) === 1,
);
// 当前为被匹配方（userId = otherUserId）且 matchStatus 为 0（待确认）时，显示匹配信息卡
const showMatchInfoCard = computed(
    () => isMatchedParty.value && Number(matchDetail.value?.matchStatus) === 0,
);

// 匹配信息卡展示字段（数据源为匹配记录详情，区别于上方对方资料标签）
const shopName = computed(() => matchDetail.value?.shopName || '');
// meetingTime 如 "2026-09-03 15:30"，拆成左侧日期（MM-DD）与时间展示
const displayDate = computed(() => {
    const date = (matchDetail.value?.meetingTime || '').split(' ')[0] || '';
    return date.length >= 10 ? date.slice(5) : date;
});
const displayTime = computed(() => (matchDetail.value?.meetingTime || '').split(' ')[1] || '');
// 匹配记录 hotpotType 为 0 起始索引，兼容逗号分隔多选
const matchHotpotTypeText = computed(() => {
    const raw = matchDetail.value?.hotpotType;
    if (raw == null) return '';
    return String(raw)
        .split(',')
        .map((idx) => hotpotTypeTextMap[Number(idx)] || '')
        .filter(Boolean)
        .join('、');
});
// 付费方式：0=我请客 1=AA 2=对方请客
const payTypeText = computed(() => {
    const t = matchDetail.value?.payType;
    return t != null ? payTypeCodeText[Number(t)] || '' : '';
});

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

onLoad(async (options: any) => {
    // 联系方式交换接口均以 recordId 为参数，优先取地址栏，其次兜底本地存储的匹配记录ID
    recordId.value = options?.recordId || options?.id || uni.getStorageSync('recordId') || '';
    otherUserId.value = options?.otherUserId || options?.userId || '';
    // 先拉匹配详情：角色判断、联系方式栏/匹配信息卡显隐都依赖它，同时兜底解析对方 userId
    await fetchMatchDetail();
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

// 拉取匹配记录详情：角色判断、联系方式栏/匹配信息卡的渲染均依赖该数据
async function fetchMatchDetail() {
    if (!recordId.value) return;
    try {
        const detail = await getMatchDetail({ recordId: recordId.value });
        matchDetail.value = detail || null;
        // 详情返回的 recordId 作为后续联系方式交换接口参数兜底
        if (!recordId.value && detail?.recordId) {
            recordId.value = String(detail.recordId);
        }
    } catch {
        matchDetail.value = null;
    }
}

// 按当前登录用户角色取匹配记录中"对方"的 userId：
// 我是被匹配方（otherUserId）时对方是 myUserId，否则对方是 otherUserId
function getCounterpartUserId(detail: MatchDetailItem): number | string {
    const cur = String(currentUserId.value);
    if (cur && String(detail.otherUserId) === cur) return detail.myUserId;
    return detail.otherUserId || (detail as any).userId || '';
}

// 拉取对方资料：查看对方时传 otherUserId
async function loadPartnerProfile() {
    try {
        let uid = otherUserId.value;
        // 地址栏没带 otherUserId 时，用匹配详情按当前登录角色兜底取对方 userId
        if (!uid && recordId.value) {
            let detail: MatchDetailItem | null = matchDetail.value;
            try {
                if (!detail) {
                    detail = await getMatchDetail({ recordId: recordId.value });
                    matchDetail.value = detail || null;
                }
                if (detail) {
                    uid = getCounterpartUserId(detail);
                    if (uid) otherUserId.value = uid;
                }
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
        // 对方已确认匹配（matchStatus 0→1）：刷新详情，自动切换信息卡/联系方式栏显隐
        case WS_EVENT.MATCH_CONFIRMED: {
            fetchMatchDetail();
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

/* 中间信息卡片 - 精确尺寸、毛玻璃与阴影 */
.info-card {
  margin-top: 80rpx;
  width: 100%;
  height: 240rpx;
  background: linear-gradient( 45deg, rgba(92,175,255,0.2) 0%, rgba(198,43,255,0.2) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  padding: 30rpx;
  box-sizing: border-box;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

/* 左侧时间区 - 精确间距与字体 */
.time-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 140rpx;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
  margin-right: 30rpx;
}

.date-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.time-text {
  color: #ffffff;
  font-size: 44rpx;
  font-weight: bold;
}

.divider {
  display: none;
}

/* 右侧详情区 - 精确布局与字体 */
.detail-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative; 
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.icon-pin {
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  .icon-fire{
    width: 32rpx;
    height: 32rpx;
  }
}

.shop-name {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.value {
  color: #ffffff;
  font-size: 24rpx;
}
</style>
