<template>
    <view class="match-page">
        <!-- 缓慢浮动的主题色炫光背景 -->
        <view class="aurora-bg">
            <view class="aurora-blob blob-1"></view>
            <view class="aurora-blob blob-2"></view>
            <view class="aurora-blob blob-3"></view>
        </view>
        <!-- 自定义导航栏 -->
        <view class="navbar" :style="{ height: navbarHeight + 'px', paddingTop: navbarPaddingTop + 'px' }">
            <view class="navbar-inner" :style="{ height: capsuleHeight + 'px' }">
                <!-- 左侧位置 -->
                <view class="location-picker" @click="chooseLocation">
                    <image class="location-icon" src="/static/imgs/map-pin-2-line.png" mode="aspectFit" />
                    <text class="location-text">{{ location }}</text>
                </view>
            </view>

            <!-- 右侧匹配开关（胶囊：状态点 + 文字 + 开关） -->
            <view class="match-toggle" :class="{ active: isToggleOn }" @click="toggleSwitch">
                <view class="status-dot"></view>
                <text class="status-text">{{ isToggleOn ? '匹配中' : '已关闭' }}</text>
                <view class="toggle-switch">
                    <view class="toggle-circle"></view>
                </view>
            </view>
        </view>

        <!-- 主内容区 -->
        <view class="main-content" :style="{ top: topOffset + 'px' }">
            <!-- 两个旋转的火锅图片 -->
            <view class="match-circles">
                <!-- 左侧精准匹配 -->
                <view class="circle-item">
                    <view class="circle-image-wrapper">
                        <image class="circle-image neon-blue" src="@/static/imgs/pot2.png" mode="aspectFill"></image>
                    </view>
                    <view class="match-btn precise" @click="goToPreciseMatch">
                        <text>精准匹配</text>
                    </view>
                </view>

                <!-- 右侧快速匹配 -->
                <view class="circle-item">
                    <view class="circle-image-wrapper">
                        <image class="circle-image neon-pink" src="@/static/imgs/pot1.png" mode="aspectFill"></image>
                    </view>
                    <view class="match-btn blind" @click="goToBlindMatch">
                        <text>快速匹配</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
    <!-- 匹配成功弹窗 -->
    <MatchSuccessModal 
    :visible="showMatchModal" 
    :demand-id="matchedDemandId" 
    @close="handleCloseModal" 
    @unlock="handleUnlock" />
    <!-- 盲盒弹窗：点击头像解锁后展示，点"确认匹配"才发起 createMatch -->
    <BlindBoxPopup
        :visible="showBlindBox"
        :my-avatar="blindMyAvatar"
        :other-avatar="blindOtherAvatar"
        :other-user-id="blindMatchUserId"
        @cancel="handleBlindBoxCancel"
        @confirm="handleBlindBoxConfirm"
    />
    <!-- 匹配介绍弹窗 -->
    <MatchIntroModal :visible="showIntroModal" @close="handleCloseIntroModal" />
    <!-- 匹配请求弹窗：状态与按钮逻辑由全局 matchSocket 模块管理 -->
    <MatchConfirmModal
        :visible="showFriendRequest"
        :avatar="currentRequest.avatar"
        :description="currentRequest.description"
        :recordId="currentRequest.requestId"
        @cancel="rejectCurrentRequest"
        @confirm="acceptCurrentRequest"
    />
    <!-- 定位选择弹窗 -->
    <LocationPickerPopup
        :visible="showLocationPicker"
        @update:visible="showLocationPicker = $event"
        @select="handleLocationSelect"
    />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { onShow, onHide, onUnload } from '@dcloudio/uni-app';
// 登录和完善资料检查
import { isLogin, isProfileComplete } from '@/utils/auth';
// 匹配到的三个用户，适配快速匹配和精准匹配
import MatchSuccessModal from '@/components/MatchSuccessModal.vue';
// 盲盒弹窗vs两个
import BlindBoxPopup from '@/components/BlindBoxPopup.vue';
// 匹配介绍弹窗
import MatchIntroModal from '@/components/MatchIntroModal.vue';
// 好友请求弹窗
import MatchConfirmModal from '@/components/MatchConfirmModal.vue';
// 定位选择弹窗
import LocationPickerPopup from '@/components/LocationPickerPopup.vue';
// 定位选择弹窗
import type { LocationItem } from '@/components/LocationPickerPopup.vue';
import { postRequirement, saveAutoMatch, createMatch, cancelDemand } from '@/api/api';
import { getUserInfo } from '@/utils/auth';
import { getUserLocation, reverseGeocode, getCachedLocation } from '@/utils/map';
// 全局匹配 socket：单例连接 + 消息分发，页面只消费共享状态
import {
    showFriendRequest,
    currentRequest,
    acceptCurrentRequest,
    rejectCurrentRequest,
    setMatchPageVisible,
    WS_EVENT,
    matchRequestHandled,
} from '@/common/matchSocket';
// 页面级订阅匹配终态推送，用于关闭本页本地弹窗（全局模块管理不到的 ref）
import { onWsMessage } from '@/utils/websocket';

const showMatchModal = ref(false);
const matchedDemandId = ref('');
const showIntroModal = ref(false);
const showBlindBox = ref(false);

// 收到新的匹配请求弹窗时，关闭本页旧的匹配成功选人弹窗，避免两个弹窗叠加
watch(showFriendRequest, (visible) => {
    if (visible) {
        showMatchModal.value = false;
        showBlindBox.value = false;

    }
});

// 同意/拒绝匹配请求成功后，关闭本页 MatchSuccessModal 选人弹窗（无论同意还是拒绝都要关）
watch(matchRequestHandled, () => {
    showMatchModal.value = false;
    showBlindBox.value = false;
});

// 匹配终态推送（被对方拒绝/取消/超时）：全局模块已清缓存标记并弹提示，
// 但盲盒确认弹窗、匹配成功选人弹窗是本页本地状态，这里负责关掉
const handleMatchTermEvent = (data: any) => {
    const type = data?.type || data?.eventType || data?.event;
    if (
        type === WS_EVENT.MATCH_REJECTED ||
        type === WS_EVENT.MATCH_CANCELED ||
        type === WS_EVENT.MATCH_TIMEOUT
    ) {
        showBlindBox.value = false;
        showMatchModal.value = false;
    }
};
// 盲盒确认弹窗展示数据：myAvatar 为发起方本人头像，otherAvatar 为被选中锅友头像
// recordId 在点击"确认匹配"调用 createMatch 成功后才写入
const blindMyAvatar = ref('/static/imgs/default-avatar.jpeg');
const blindOtherAvatar = ref('/static/imgs/default-avatar.jpeg');
const blindRecordId = ref('');
// 盲盒确认阶段需要的 createMatch 参数（点击头像时带出，点确认匹配时使用）
const blindDemandId = ref('');
const blindMatchUserId = ref('');
// 盲盒弹窗按钮请求中标记（确认匹配/不合适共用），防止重复点击重复调接口
const blindSubmitting = ref(false);

const statusBarHeight = ref(0);
const navbarPaddingTop = ref(0);
const navbarHeight = ref(0);
const capsuleHeight = ref(32); // 胶囊按钮高度，默认 32px
const capsuleRightMargin = ref(0); // 右侧避开胶囊的边距
const topOffset = ref(0);
const location = ref('正在定位...');
const showLocationPicker = ref(false);
const isToggleOn = ref(true);

// 点击头像解锁：关闭匹配成功弹窗，带出 createMatch 参数与双方头像，延迟弹出确认匹配弹窗
// 此时不发起请求，真正的 createMatch 在盲盒弹窗点击"确认匹配"时才调用
const handleUnlock = (payload: any) => {
    const demandId = matchedDemandId.value || '';
    const matchUserId = payload?.matchUserId || payload?.user?.id || '';
    // 发起方本人头像：优先用 payload，回退当前登录用户头像，最后兜底默认头像
    const myAvatar =
        payload?.matchUserAvatar ||
        getUserInfo()?.avatar ||
        '/static/imgs/default-avatar.jpeg';
    const otherAvatar =
        payload?.matchedUserAvatar || payload?.user?.avatar || '/static/imgs/default-avatar.jpeg';
    blindDemandId.value = demandId;
    blindMatchUserId.value = matchUserId;
    blindMyAvatar.value = myAvatar;
    blindOtherAvatar.value = otherAvatar;
    // 流程进入"待确认"阶段：清除选人弹窗标记，持久化确认弹窗标记（用户点确认/不合适前一直保留）
    uni.removeStorageSync('pendingMatchSuccess');
    uni.setStorageSync(
        'pendingBlindBox',
        JSON.stringify({ demandId, matchUserId, myAvatar, otherAvatar }),
    );
    showMatchModal.value = false;
    setTimeout(() => {
        showBlindBox.value = true;
        console.log('showBlindBox handleUnlock', showBlindBox.value);
    }, 300);
};

// 盲盒弹窗：不合适 → 取消发布的需求（mini/demand/cancel），成功后清理标记并关闭；失败不关闭可重试
const handleBlindBoxCancel = async () => {
    if (blindSubmitting.value) return;
    const demandId = blindDemandId.value || matchedDemandId.value;
    if (!demandId) {
        // 无需求 id（异常兜底）：仅清本地标记关闭
        uni.removeStorageSync('pendingBlindBox');
        showBlindBox.value = false;
        showMatchModal.value = false;
        showFriendRequest.value = false;
        return;
    }
    blindSubmitting.value = true;
    try {
        await cancelDemand({ demandId: String(demandId) });
        uni.showToast({
            title: '已取消匹配',
            icon: 'none',
        });
    } catch {
        // 失败提示已由 request 统一处理，弹窗保留可重试
        blindSubmitting.value = false;
        return;
    }
    blindSubmitting.value = false;
    // 取消成功进入终态，清掉本地弹窗标记，避免离开/刷新后弹窗再次恢复
    uni.removeStorageSync('pendingBlindBox');
    showBlindBox.value = false;
    showMatchModal.value = false;
    showFriendRequest.value = false;

    console.log('showBlindBox', showBlindBox.value);
    console.log('showMatchModal', showMatchModal.value);
    console.log('showFriendRequest', showFriendRequest.value);
};

// 盲盒弹窗：确认匹配 → 发起 createMatch 请求，成功后写入 recordId、清除本弹窗标记、写入等待态标记并跳转查看页
const handleBlindBoxConfirm = async () => {
    if (blindSubmitting.value) return;
    const demandId = blindDemandId.value;
    const matchUserId = blindMatchUserId.value;
    if (!demandId || !matchUserId) {
        uni.showToast({ title: '匹配参数缺失，请重试', icon: 'none' });
        return;
    }
    blindSubmitting.value = true;
    let res: any;
    try {
        res = await createMatch({ demandId, matchUserId });
    } catch {
        // 失败提示已由 request 统一处理，弹窗保留可重试
        blindSubmitting.value = false;
        return;
    }
    blindSubmitting.value = false;
    // 发起匹配返回：recordId 匹配记录id、matchUserAvatar 发起方头像、matchedUserAvatar 被选中方头像
    const recordId = res?.recordId || res?.matchId || res?.id || '';
    if (!recordId) {
        uni.showToast({ title: '未获取到匹配记录，请重试', icon: 'none' });
        return;
    }
    // view 页与后续 cancel/联系方式交换接口均以该 recordId 为参数，写入缓存供全局使用
    uni.setStorageSync('recordId', String(recordId));
    blindRecordId.value = String(recordId);
    // 接口返回头像时更新展示
    if (res?.matchUserAvatar) blindMyAvatar.value = res.matchUserAvatar;
    if (res?.matchedUserAvatar) blindOtherAvatar.value = res.matchedUserAvatar;

    uni.removeStorageSync('pendingBlindBox');
    // view 页据此展示"等待对方同意"倒计时弹窗；用户取消或收到对方结果前一直保留
    uni.setStorageSync('showWaitingPopup', true);
    showBlindBox.value = false;
    uni.switchTab({
        url: '/pages/tabBar/view',
    });
};

const handleCloseModal = () => {
    showMatchModal.value = false;
};

const handleCloseIntroModal = () => {
    showIntroModal.value = false;
    uni.setStorageSync('hasSeenMatchIntro', true);
};

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;

    // 获取胶囊按钮信息，导航栏内容与胶囊按钮同一水平线
    // #ifdef MP-WEIXIN
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    capsuleHeight.value = menuButtonInfo.height;
    const gap = 8; // 胶囊底部间距
    // 右侧避免与胶囊重叠：胶囊宽度 + 间距
    capsuleRightMargin.value = menuButtonInfo.width + gap;
    // 导航栏内容顶部与胶囊顶部对齐
    navbarPaddingTop.value = menuButtonInfo.top;
    navbarHeight.value = menuButtonInfo.top + menuButtonInfo.height + gap;
    // #endif
    // #ifndef MP-WEIXIN
    navbarPaddingTop.value = statusBarHeight.value;
    navbarHeight.value = statusBarHeight.value + (88 * systemInfo.windowWidth) / 750;
    // #endif

    topOffset.value = navbarHeight.value;

    // 订阅匹配终态推送：被匹配方拒绝/取消或超时时，关闭本页仍在展示的盲盒确认等弹窗
    onWsMessage(handleMatchTermEvent);
});

onShow(() => {
    if (!isLogin()) {
        uni.reLaunch({ url: '/pages/login/login' });
        return;
    }
    if (!isProfileComplete()) {
        uni.reLaunch({ url: '/pages/profile/complete' });
        return;
    }
    // 自动定位获取当前地址
    autoLocate();
    // 标记匹配页在前台：全局 socket 收到匹配请求时在此页弹出自定义请求弹窗
    setMatchPageVisible(true);

    // 弹窗状态恢复：标记持久化在本地，用户未点按钮操作前一直保留，离开/刷新后回来仍展示
    // 优先恢复更靠后的"确认匹配"盲盒弹窗（已发起匹配待确认）
    const pendingBlind = uni.getStorageSync('pendingBlindBox');
    if (pendingBlind) {
        try {
            const info = JSON.parse(pendingBlind);
            // 恢复 createMatch 参数与双方头像，recordId 此时一般不存在（未点确认匹配）
            blindDemandId.value = info.demandId || '';
            blindMatchUserId.value = info.matchUserId || '';
            blindRecordId.value = info.recordId || uni.getStorageSync('recordId') || '';
            blindMyAvatar.value = info.myAvatar || '/static/imgs/default-avatar.jpeg';
            blindOtherAvatar.value = info.otherAvatar || '/static/imgs/default-avatar.jpeg';
            showBlindBox.value = true;
            console.log('showBlindBox onshow', showBlindBox.value);
        } catch {
            uni.removeStorageSync('pendingBlindBox');
        }
    } else {
        // 其次恢复"匹配成功选人"弹窗（已匹配到人、待选锅友），值为 demandId
        const pendingDemandId = uni.getStorageSync('pendingMatchSuccess');
        if (pendingDemandId) {
            matchedDemandId.value = pendingDemandId;
            showMatchModal.value = true;
        }
    }
    const hasSeenIntro = uni.getStorageSync('hasSeenMatchIntro');
    if (!hasSeenIntro) {
        showIntroModal.value = true;
    }

    // 测试模拟
    // setTimeout(() => {
        // showFriendRequest.value = true;
        // showBlindBox.value = true;
        // matchedDemandId.value = '123456';
    // }, 2000);
});

// 页面隐藏时标记离开匹配页（全局 socket 不断开，其他页面仍可接收推送）
onHide(() => {
    setMatchPageVisible(false);
});

// 页面卸载时标记离开匹配页
onUnload(() => {
    setMatchPageVisible(false);
});

// 选择位置：打开自定义定位弹窗
const chooseLocation = () => {
  showLocationPicker.value = true;
};

// 自动定位（页面加载时获取当前地址描述，仅用于导航栏展示）
const autoLocate = async () => {
  // 先从缓存恢复上次选择的位置
  const cached = uni.getStorageSync('user_location_name');
  if (cached) {
    location.value = cached;
  }

  try {
    // 使用带缓存的定位：首次获取后写入缓存，发布需求时直接复用，避免频繁调用 getLocation 耗电
    const loc = await getCachedLocation();
    const addr = await reverseGeocode(loc);
    console.log("loc,",loc, "addr",addr);
    const desc = addr.shortDescription || addr.formattedAddress;
    location.value = desc;
    uni.setStorageSync('user_location_name', desc);
  } catch {
    // 定位失败则不更新，保留缓存值或兜底
    if (location.value === '正在定位...') {
      location.value = '定位失败，点击重试';
    }
  }
};

// 定位弹窗选择回调
const handleLocationSelect = (item: LocationItem) => {
  location.value = item.name;
  uni.setStorageSync('user_location_name', item.name);
};

// 切换匹配开关：仅同步后端自动匹配偏好；socket 为全局单例，不再随开关断开/重连
const toggleSwitch = async () => {
    const userInfo: any = getUserInfo();
    const userId = userInfo?.id || userInfo?.userId;
    if (!userId) {
        uni.showToast({ title: '用户信息缺失，请重新登录', icon: 'none' });
        uni.reLaunch({ url: '/pages/login/login' });
        return;
    }
    const next = !isToggleOn.value;
    const autoMatch = next ? 1 : 0;
    try {
        await saveAutoMatch({ userId, autoMatch });
        isToggleOn.value = next;
    } catch (error: any) {
        // 失败不切换 UI，由 request 层统一弹错误 toast
    }
};

// 精准匹配
const goToPreciseMatch = () => {
    uni.navigateTo({
        url: '/subPack/match/postRequirement?mode=precise',
    });
};

// 快速匹配：直接发布需求（matchType=1，其他参数不传），成功后进入匹配页
const goToBlindMatch = async () => {
    uni.showLoading({ title: '匹配中...', mask: true });
    try {
        // 经纬度为必传项：优先复用页面进入时缓存的定位，缺失时再获取
        let lat: number;
        let lng: number;
        try {
            const loc = await getCachedLocation();
            lat = loc.latitude;
            lng = loc.longitude;
        } catch {
            uni.hideLoading();
            uni.showToast({ title: '定位失败，请开启位置权限后重试', icon: 'none' });
            return;
        }
        const res: any = await postRequirement({ matchType: '1', lat, lng });
        // demandId 为需求ID，通过 URL 传给匹配页拉推荐/发起匹配；匹配 recordId 由 mini/match/create 返回后再写入缓存
        const demandId = res?.demandId || '';
        uni.hideLoading();
        uni.navigateTo({
            url: `/subPack/match/matchSuccess?demandId=${encodeURIComponent(demandId)}`,
        });
    } catch (error: any) {
        uni.hideLoading();
        uni.showToast({
            title: error?.msg || '发起匹配失败',
            icon: 'none',
        });
    }
};
</script>

<style lang="scss" scoped>
.match-page {
    min-height: 100vh;
    background: #000000;
    overflow: hidden;
}

// 主题色炫光背景：低透明度 + 大模糊 + 超慢浮动，仅作氛围底色
.aurora-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
}

.aurora-blob {
    position: absolute;
    width: 560rpx;
    height: 560rpx;
    border-radius: 50%;
    filter: blur(80rpx);
    will-change: transform, opacity;
}

.blob-1 {
    top: -140rpx;
    left: -160rpx;
    background: radial-gradient(circle at center, rgba(88, 180, 255, 0.5) 0%, rgba(88, 180, 255, 0) 68%);
    animation: aurora-float-1 24s ease-in-out infinite alternate;
}

.blob-2 {
    right: -180rpx;
    bottom: -120rpx;
    background: radial-gradient(circle at center, rgba(201, 39, 255, 0.42) 0%, rgba(201, 39, 255, 0) 68%);
    animation: aurora-float-2 30s ease-in-out infinite alternate;
}

.blob-3 {
    top: 38%;
    left: 42%;
    width: 480rpx;
    height: 480rpx;
    background: radial-gradient(circle at center, rgba(223, 135, 214, 0.3) 0%, rgba(102, 126, 234, 0) 70%);
    animation: aurora-float-3 36s ease-in-out infinite alternate;
}

// 超慢速漂移：位移幅度小、周期长，肉眼只感知到光晕在缓慢呼吸流动
@keyframes aurora-float-1 {
    0% {
        transform: translate(-8%, -4%) scale(1);
        opacity: 0.55;
    }
    100% {
        transform: translate(20%, 16%) scale(1.22);
        opacity: 0.85;
    }
}

@keyframes aurora-float-2 {
    0% {
        transform: translate(10%, 6%) scale(1.12);
        opacity: 0.8;
    }
    100% {
        transform: translate(-18%, -12%) scale(0.95);
        opacity: 0.5;
    }
}

@keyframes aurora-float-3 {
    0% {
        transform: translate(-14%, 10%) scale(0.95);
        opacity: 0.45;
    }
    100% {
        transform: translate(12%, -14%) scale(1.18);
        opacity: 0.75;
    }
}

// 导航栏
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    background: transparent;

    .navbar-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 88rpx;
        padding: 0 40rpx 0 40rpx;
    }

    // 左侧位置
    .location-picker {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .location-icon {
            width: 40rpx;
            height: 40rpx;
        }

        .location-text {
            font-size: 30rpx;
            font-weight: 500;
            color: #ffffff;
        }
    }

    // 右侧匹配开关胶囊
    .match-toggle {
        width: fit-content;
        margin-left: 40rpx;
        display: flex;
        align-items: center;
        gap: 12rpx;
        height: 56rpx;
        padding: 0 16rpx 0 20rpx;
        border-radius: 28rpx;
        background: rgba(255, 255, 255, 0.12);
        border: 1rpx solid rgba(255, 255, 255, 0.15);
        transition: all 0.3s ease;

        &:active {
            transform: scale(0.96);
        }

        // 状态指示点
        .status-dot {
            width: 14rpx;
            height: 14rpx;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transition: all 0.3s ease;
        }

        // 状态文字
        .status-text {
            font-size: 24rpx;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.6);
            transition: color 0.3s ease;
        }

        // 开关本体
        .toggle-switch {
            width: 72rpx;
            height: 40rpx;
            border-radius: 20rpx;
            background: rgba(255, 255, 255, 0.3);
            position: relative;
            transition: background 0.3s ease;

            .toggle-circle {
                position: absolute;
                top: 4rpx;
                left: 4rpx;
                width: 32rpx;
                height: 32rpx;
                border-radius: 50%;
                background: #ffffff;
                transition: transform 0.3s ease;
                box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
            }
        }

        // 开启状态
        &.active {
            background: rgba(88, 180, 255, 0.15);
            border-color: rgba(88, 180, 255, 0.4);

            .status-dot {
                background: #52e39a;
                box-shadow: 0 0 8rpx rgba(82, 227, 154, 0.8);
            }

            .status-text {
                color: #ffffff;
            }

            .toggle-switch {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

                .toggle-circle {
                    transform: translateX(32rpx);
                }
            }
        }
    }
}

// 主内容区
.main-content {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

// 匹配圆圈区域
.match-circles {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 60rpx;
}

.circle-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40rpx;
}

// 圆形图片包装器
.circle-image-wrapper {
    position: relative;
    width: 280rpx;
    height: 280rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .circle-image {
        width: 250rpx;
        height: 250rpx;
        border-radius: 50%;
        object-fit: cover;
        border: 4rpx solid rgba(255, 255, 255, 0.1);

        // 霓虹边框 - 蓝色
        &.neon-blue {
            //border: 3rpx solid rgb(173, 200, 226);
            box-shadow: 0 0 40rpx rgba(173, 200, 226, 0.3), 0 0 80rpx rgba(173, 200, 226, 0.15), 0 0 140rpx rgba(173, 200, 226, 0.08);
        }

        // 霓虹边框 - 粉色
        &.neon-pink {
            // border: 3rpx solid rgba(223, 135, 214, 0.5);
            box-shadow: 0 0 40rpx rgba(223, 135, 214, 0.3), 0 0 80rpx rgba(223, 135, 214, 0.15), 0 0 140rpx rgba(223, 135, 214, 0.08);
        }
    }
}

// 匹配按钮
.match-btn {
    width: 192rpx;
    height: 72rpx;
    border-radius: 420rpx 420rpx 420rpx 420rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    text {
        font-size: 30rpx;
        font-weight: 500;
    }

    // 精准匹配按钮 - 紫色渐变
    &.precise {
        background: linear-gradient(270deg, #58b4ff 0%, #c927ff 100%);
        border-radius: 420rpx;
        box-shadow: 0 8rpx 24rpx rgba(88, 180, 255, 0.4);
        animation: breathe-precise 2.4s ease-in-out infinite;

        text {
            color: #ffffff;
        }

        &:active {
            transform: scale(0.95);
        }
    }

    // 快速匹配按钮 - 白色
    &.blind {
        background: #ffffff;
        box-shadow: 0 4rpx 16rpx rgba(255, 255, 255, 0.2);
        animation: breathe-blind 2.4s ease-in-out infinite;
        animation-delay: 1.2s;

        text {
            color: #333333;
        }

        &:active {
            transform: scale(0.95);
        }
    }

    // 呼吸动画 - 精准匹配（紫色渐变）
    @keyframes breathe-precise {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 8rpx 24rpx rgba(88, 180, 255, 0.4);
        }
        50% {
            transform: scale(1.06);
            box-shadow: 0 12rpx 36rpx rgba(88, 180, 255, 0.7);
        }
    }

    // 呼吸动画 - 快速匹配（白色）
    @keyframes breathe-blind {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 4rpx 16rpx rgba(255, 255, 255, 0.2);
        }
        50% {
            transform: scale(1.06);
            box-shadow: 0 8rpx 28rpx rgba(255, 255, 255, 0.5);
        }
    }
}
</style>
