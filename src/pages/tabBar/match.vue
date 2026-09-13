<template>
    <view class="match-page">
        <!-- 自定义导航栏 -->
        <view class="navbar" :style="{ height: navbarHeight + 'px', paddingTop: navbarPaddingTop + 'px' }">
            <view class="navbar-inner" :style="{ height: capsuleHeight + 'px' }">
                <!-- 左侧位置 -->
                <view class="location-picker" @click="chooseLocation">
                    <image class="location-icon" src="/static/imgs/map-pin-2-line.png" mode="aspectFit" />
                    <text class="location-text">{{ location }}</text>
                </view>

                <!-- 右侧匹配开关（胶囊：状态点 + 文字 + 开关） -->
                <view class="match-toggle" :class="{ active: isToggleOn }" :style="{ marginRight: capsuleRightMargin + 'px' }" @click="toggleSwitch">
                    <view class="status-dot"></view>
                    <text class="status-text">{{ isToggleOn ? '匹配中' : '已关闭' }}</text>
                    <view class="toggle-switch">
                        <view class="toggle-circle"></view>
                    </view>
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

                <!-- 右侧盲配 -->
                <view class="circle-item">
                    <view class="circle-image-wrapper">
                        <image class="circle-image neon-pink" src="@/static/imgs/pot1.png" mode="aspectFill"></image>
                    </view>
                    <view class="match-btn blind" @click="goToBlindMatch">
                        <text>盲配</text>
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
    <!-- 盲盒弹窗：发起匹配成功后确认，头像与 recordId 来自 createMatch 返回 -->
    <BlindBoxPopup
        :visible="showBlindBox"
        :my-avatar="blindMyAvatar"
        :other-avatar="blindOtherAvatar"
        :record-id="blindRecordId"
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
import { ref, onMounted } from 'vue';
import { onShow, onHide, onUnload } from '@dcloudio/uni-app';
// 登录和完善资料检查
import { isLogin, isProfileComplete } from '@/utils/auth';
// 匹配到的三个用户，适配盲配和精准匹配
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
import { postRequirement, saveAutoMatch, cancelMatchRecord } from '@/api/api';
import { getUserInfo } from '@/utils/auth';
import { getUserLocation, reverseGeocode } from '@/utils/map';
// 全局匹配 socket：单例连接 + 消息分发，页面只消费共享状态
import {
    showFriendRequest,
    currentRequest,
    acceptCurrentRequest,
    rejectCurrentRequest,
    setMatchPageVisible,
} from '@/common/matchSocket';

const showMatchModal = ref(false);
const matchedDemandId = ref('');
const showIntroModal = ref(false);
const showBlindBox = ref(false);
// 盲盒确认弹窗展示数据（来自发起匹配 createMatch 的返回）
const blindMyAvatar = ref('https://picsum.photos/200');
const blindOtherAvatar = ref('https://picsum.photos/200');
const blindRecordId = ref('');

const statusBarHeight = ref(0);
const navbarPaddingTop = ref(0);
const navbarHeight = ref(0);
const capsuleHeight = ref(32); // 胶囊按钮高度，默认 32px
const capsuleRightMargin = ref(0); // 右侧避开胶囊的边距
const topOffset = ref(0);
const location = ref('正在定位...');
const showLocationPicker = ref(false);
const isToggleOn = ref(true);

// 发起匹配成功：关闭匹配成功弹窗，带出 recordId 与双方头像，延迟弹出确认匹配弹窗
const handleUnlock = (payload: any) => {
    const recordId = payload?.recordId || uni.getStorageSync('recordId') || '';
    const myAvatar = payload?.matchUserAvatar || 'https://picsum.photos/200';
    const otherAvatar =
        payload?.matchedUserAvatar || payload?.user?.avatar || 'https://picsum.photos/200';
    blindRecordId.value = recordId;
    blindMyAvatar.value = myAvatar;
    blindOtherAvatar.value = otherAvatar;
    // 流程进入"待确认"阶段：清除选人弹窗标记，持久化确认弹窗标记（用户点确认/不合适前一直保留）
    uni.removeStorageSync('pendingMatchSuccess');
    uni.setStorageSync(
        'pendingBlindBox',
        JSON.stringify({ recordId, myAvatar, otherAvatar }),
    );
    showMatchModal.value = false;
    setTimeout(() => {
        showBlindBox.value = true;
    }, 300);
};

// 盲盒弹窗：不合适 → 发起方取消刚创建的匹配记录（mini/match/cancel），成功后清理标记并关闭；失败不关闭可重试
const handleBlindBoxCancel = async () => {
    const recordId = blindRecordId.value || uni.getStorageSync('recordId');
    if (recordId) {
        try {
            await cancelMatchRecord({ recordId: String(recordId) });
            // 取消成功进入终态，清掉本地弹窗标记与 recordId，避免离开/刷新后弹窗再次恢复
            uni.removeStorageSync('pendingBlindBox');
            uni.removeStorageSync('recordId');
            blindRecordId.value = '';
            uni.showToast({
                title: '已取消匹配',
                icon: 'none',
            });
        } catch {
            // 失败提示已由 request 统一处理，不关闭弹窗
            return;
        }
    } else {
        uni.removeStorageSync('pendingBlindBox');
    }
    showBlindBox.value = false;
};

// 盲盒弹窗：确认匹配 → 清除本弹窗标记、写入等待态标记，跳转查看页等待对方同意
const handleBlindBoxConfirm = () => {
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
            blindRecordId.value = info.recordId || uni.getStorageSync('recordId') || '';
            blindMyAvatar.value = info.myAvatar || 'https://picsum.photos/200';
            blindOtherAvatar.value = info.otherAvatar || 'https://picsum.photos/200';
            showBlindBox.value = true;
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
    const loc = await getUserLocation();
    const addr = await reverseGeocode(loc);
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

// 盲配：直接发布需求（matchType=1，其他参数不传），成功后进入匹配页
const goToBlindMatch = async () => {
    uni.showLoading({ title: '匹配中...', mask: true });
    try {
        const res: any = await postRequirement({ matchType: '1' } as any);
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

        text {
            color: #ffffff;
        }

        &:active {
            transform: scale(0.95);
        }
    }

    // 盲配按钮 - 白色
    &.blind {
        background: #ffffff;
        box-shadow: 0 4rpx 16rpx rgba(255, 255, 255, 0.2);

        text {
            color: #333333;
        }

        &:active {
            transform: scale(0.95);
        }
    }
}
</style>
