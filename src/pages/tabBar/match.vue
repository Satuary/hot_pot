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

                <!-- 右侧开关 -->
                <view class="toggle-switch" :class="{ active: isToggleOn }" :style="{ marginRight: capsuleRightMargin + 'px' }" @click="toggleSwitch">
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
                        <image class="circle-image neon-blue" src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop" mode="aspectFill"></image>
                    </view>
                    <view class="match-btn precise" @click="goToPreciseMatch">
                        <text>精准匹配</text>
                    </view>
                </view>

                <!-- 右侧盲配 -->
                <view class="circle-item">
                    <view class="circle-image-wrapper">
                        <image class="circle-image neon-pink" src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop" mode="aspectFill"></image>
                    </view>
                    <view class="match-btn blind" @click="goToBlindMatch">
                        <text>盲配</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
    <MatchSuccessModal :visible="showMatchModal" :demand-id="matchedDemandId" @close="handleCloseModal" @unlock="handleUnlock" />
    <BlindBoxPopup ref="blindBoxPopup" />
    <MatchIntroModal :visible="showIntroModal" @close="handleCloseIntroModal" />
    <MatchConfirmModal
        :visible="showFriendRequest"
        :avatar="currentRequest.avatar"
        :description="currentRequest.description"
        :recordId="currentRequest.requestId"
        @cancel="handleRejectRequest"
        @confirm="handleAcceptRequest"
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
import { approveWechatExchange, rejectWechatExchange, approvePhoneExchange, rejectPhoneExchange, completeUserInfo } from '@/api/api';
import { getUserLocation, reverseGeocode } from '@/utils/map';
import { connectWebSocket, disconnectWebSocket } from '@/utils/websocket';
import { appState, hotpotTypeOptions, tasteOptions, motivationOptions } from '@/utils/store';

const showMatchModal = ref(false);
const matchedDemandId = ref('');
const showIntroModal = ref(false);
const blindBoxPopup = ref<InstanceType<typeof BlindBoxPopup> | null>(null);
const handleUnlock = (user: any) => {
    showMatchModal.value = false;
    setTimeout(() => {
        blindBoxPopup.value?.open();
    }, 300);
};

const handleCloseModal = () => {
    showMatchModal.value = false;
};

const handleCloseIntroModal = () => {
    showIntroModal.value = false;
    uni.setStorageSync('hasSeenMatchIntro', true);
};

const statusBarHeight = ref(0);
const navbarPaddingTop = ref(0);
const navbarHeight = ref(0);
const capsuleHeight = ref(32); // 胶囊按钮高度，默认 32px
const capsuleRightMargin = ref(0); // 右侧避开胶囊的边距
const topOffset = ref(0);
const location = ref('正在定位...');
const showLocationPicker = ref(false);
const isToggleOn = ref(true);

// 好友请求相关状态
const showFriendRequest = ref(false);
const pendingRequests = ref<any[]>([]);
const currentRequest = ref({
    avatar: '',
    description: '',
    requestId: '',
});

// WebSocket 推送事件类型
const WS_EVENT = {
    MATCH_CREATED: 'MATCH_CREATED',
    MATCH_CONFIRMED: 'MATCH_CONFIRMED',
    MATCH_REJECTED: 'MATCH_REJECTED',
    MATCH_CANCELED: 'MATCH_CANCELED',
    MATCH_TIMEOUT: 'MATCH_TIMEOUT',
    WECHAT_REJECTED: 'WECHAT_REJECTED',
    WECHAT_APPLY: 'WECHAT_APPLY',
    WECHAT_APPROVED: 'WECHAT_APPROVED',
    PHONE_APPLY: 'PHONE_APPLY',
    PHONE_APPROVED: 'PHONE_APPROVED',
    PHONE_REJECTED: 'PHONE_REJECTED',
} as const;

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
    // 开关打开时建立 WebSocket 连接，实时接收匹配推送
    if (isToggleOn.value) {
        connectMatchSocket();
    }
    const showModal = uni.getStorageSync('showMatchSuccessModal');
    if (showModal) {
        uni.removeStorageSync('showMatchSuccessModal');
        const demandId = uni.getStorageSync('matchSuccessDemandId');
        uni.removeStorageSync('matchSuccessDemandId');
        matchedDemandId.value = demandId || '';
        showMatchModal.value = true;
    }
    const hasSeenIntro = uni.getStorageSync('hasSeenMatchIntro');
    if (!hasSeenIntro) {
        showIntroModal.value = true;
    }
});

// 页面隐藏时断开 WebSocket，节省资源
onHide(() => {
    disconnectWebSocket();
});

// 页面卸载时断开 WebSocket
onUnload(() => {
    disconnectWebSocket();
});

// 选择位置：打开自定义定位弹窗
const chooseLocation = () => {
  showLocationPicker.value = true;
};

// 自动定位（页面加载时获取当前地址描述）
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
    // 同时缓存坐标
    uni.setStorageSync('user_location_coord', JSON.stringify(loc));
    // 获取到经纬度时同步位置信息到服务端
    syncLocationToServer(loc, addr);
  } catch {
    // 定位失败则不更新，保留缓存值或兜底
    if (location.value === '正在定位...') {
      location.value = '定位失败，点击重试';
    }
  }
};

// 定位成功后调用 completeUserInfo 接口同步位置
const syncLocationToServer = async (
  loc: { longitude: number; latitude: number },
  addr: {
    formattedAddress: string;
    addressComponent: { province: string; city: string; district: string };
  },
) => {
  const profile = appState.userProfile;
  const genderMap: Record<string, number> = { male: 1, female: 2 };
  try {
    await completeUserInfo({
      nickname: profile.nickname || '',
      avatar: profile.avatar || '',
      gender: genderMap[profile.gender] || 1,
      birthday: profile.birthday || '',
      height: parseFloat(profile.height) || 0,
      weight: parseFloat(profile.weight) || 0,
      hotpotType: hotpotTypeOptions.indexOf(profile.hotpotType[0] || '') + 1,
      taste: tasteOptions.indexOf(profile.taste[0] || '') + 1,
      motivation: motivationOptions.indexOf(profile.motivation || '') + 1,
      wechat: profile.wechat || '',
      stageName: profile.nickname || '',
      province: addr.addressComponent.province || '',
      city: addr.addressComponent.city || '',
      district: addr.addressComponent.district || '',
      address: addr.formattedAddress || '',
      lat: loc.latitude,
      lng: loc.longitude,
    });
  } catch {
    // 同步失败不影响页面展示
  }
};

// 定位弹窗选择回调
const handleLocationSelect = (item: LocationItem) => {
  location.value = item.name;
  uni.setStorageSync('user_location_name', item.name);
  uni.setStorageSync('user_location_coord', JSON.stringify({
    longitude: item.longitude,
    latitude: item.latitude,
  }));
};

// 切换开关
const toggleSwitch = () => {
    isToggleOn.value = !isToggleOn.value;
    if (isToggleOn.value) {
        // 打开开关时建立 WebSocket 连接，实时接收匹配推送
        connectMatchSocket();
    } else {
        // 关闭开关时断开连接并清空待处理请求
        disconnectWebSocket();
        pendingRequests.value = [];
        showFriendRequest.value = false;
    }
};

// 建立 WebSocket 连接，实时接收匹配推送
const connectMatchSocket = () => {
    connectWebSocket({
        onOpen: () => {
            console.log('已建立 WebSocket 连接，开始实时接收匹配推送...');
        },
        onMessage: handleWsMessage,
        onClose: (code, reason) => {
            console.log('WebSocket 连接已断开', code, reason);
        },
        onError: (err) => {
            console.error('WebSocket 连接出错', err);
        },
    });
};

// 处理 WebSocket 推送的消息
const handleWsMessage = (data: any) => {
    if (!data || typeof data !== 'object') return;
    const type = data.type || data.eventType || data.event;
    const payload = data.data || data.payload || data;
    if (!type) return;

    switch (type) {
        // 有人向你发起匹配
        case WS_EVENT.MATCH_CREATED: {
            const req = {
                // 优先取 recordId，组件同意/拒绝接口均以 recordId 为参数
                id: payload.recordId || payload.requestId || payload.id || 'req_' + Date.now(),
                avatar: payload.avatar || payload.user?.avatar || '',
                nickname: payload.nickname || payload.user?.nickname || '神秘火锅搭子',
                description: payload.description || payload.reason || `${payload.nickname || '对方'} 想与你一起恰火锅~`,
            };
            // 去重
            if (pendingRequests.value.some((r: any) => r.id === req.id)) return;
            pendingRequests.value.push(req);
            // 当前没有正在展示的请求时，弹出确认框
            if (!showFriendRequest.value) {
                showNextRequest();
            }
            break;
        }
        // 对方已同意匹配
        case WS_EVENT.MATCH_CONFIRMED: {
            matchedDemandId.value = payload.demandId || '';
            showMatchModal.value = true;
            break;
        }
        // 对方已拒绝匹配
        case WS_EVENT.MATCH_REJECTED: {
            uni.showToast({ title: '对方已拒绝匹配', icon: 'none' });
            break;
        }
        // 对方已取消匹配
        case WS_EVENT.MATCH_CANCELED: {
            uni.showToast({ title: '对方已取消匹配', icon: 'none' });
            break;
        }
        // 匹配已超时
        case WS_EVENT.MATCH_TIMEOUT: {
            uni.showToast({ title: '匹配已超时', icon: 'none' });
            break;
        }
        // 有人申请交换微信
        case WS_EVENT.WECHAT_APPLY: {
            uni.showModal({
                title: '微信交换申请',
                content: `${payload.nickname || '对方'} 想与你交换微信，是否同意？`,
                confirmText: '同意',
                cancelText: '拒绝',
                success: (res) => {
                    if (res.confirm) {
                        approveWechatExchange({ matchId: payload.matchId })
                            .then(() => {
                                uni.showToast({ title: '已同意交换微信', icon: 'success' });
                            })
                            .catch(() => {});
                    } else {
                        rejectWechatExchange({ matchId: payload.matchId }).catch(() => {});
                    }
                },
            });
            break;
        }
        // 对方已同意交换微信
        case WS_EVENT.WECHAT_APPROVED: {
            const wechat = payload.wechat || payload.wechatId || '';
            uni.showModal({
                title: '对方已同意交换微信',
                content: wechat ? `对方微信号：${wechat}` : '对方已同意交换微信，快去打个招呼吧~',
                confirmText: '复制微信号',
                showCancel: false,
                success: () => {
                    if (wechat) {
                        uni.setClipboardData({ data: wechat });
                    }
                },
            });
            break;
        }
        // 对方拒绝交换微信
        case WS_EVENT.WECHAT_REJECTED: {
            uni.showToast({ title: '对方拒绝交换微信', icon: 'none' });
            break;
        }
        // 有人申请交换电话
        case WS_EVENT.PHONE_APPLY: {
            uni.showModal({
                title: '电话交换申请',
                content: `${payload.nickname || '对方'} 想与你交换电话，是否同意？`,
                confirmText: '同意',
                cancelText: '拒绝',
                success: (res) => {
                    if (res.confirm) {
                        approvePhoneExchange({ matchId: payload.matchId })
                            .then(() => {
                                uni.showToast({ title: '已同意交换电话', icon: 'success' });
                            })
                            .catch(() => {});
                    } else {
                        rejectPhoneExchange({ matchId: payload.matchId }).catch(() => {});
                    }
                },
            });
            break;
        }
        // 对方已同意交换电话
        case WS_EVENT.PHONE_APPROVED: {
            const phone = payload.phone || payload.mobile || payload.phoneNumber || '';
            uni.showModal({
                title: '对方已同意交换电话',
                content: phone ? `对方电话：${phone}` : '对方已同意交换电话，快去联系吧~',
                confirmText: '复制电话',
                showCancel: false,
                success: () => {
                    if (phone) {
                        uni.setClipboardData({ data: phone });
                    }
                },
            });
            break;
        }
        // 对方拒绝交换电话
        case WS_EVENT.PHONE_REJECTED: {
            uni.showToast({ title: '对方拒绝交换电话', icon: 'none' });
            break;
        }
        default:
            console.log('[match] 未处理的事件类型:', type, payload);
    }
};

// 展示下一个待处理请求
const showNextRequest = () => {
    if (pendingRequests.value.length === 0) return;
    
    const req = pendingRequests.value[0];
    currentRequest.value = {
        avatar: req.avatar,
        description: req.description,
        requestId: req.id,
    };
    showFriendRequest.value = true;
    
    // 播放提示音或震动
    // #ifdef MP-WEIXIN
    uni.vibrateLong();
    // #endif
};

// 同意好友请求（接口调用已在 MatchConfirmModal 内完成）
const handleAcceptRequest = () => {
    const reqId = currentRequest.value.requestId;
    showFriendRequest.value = false;

    // 从队列中移除当前请求
    pendingRequests.value = pendingRequests.value.filter((r: any) => r.id !== reqId);

    uni.showToast({
        title: '已同意，快去聊聊吧',
        icon: 'success',
        duration: 2000,
    });

    // 继续展示下一个请求
    setTimeout(() => {
        showNextRequest();
    }, 500);
};

// 拒绝好友请求（接口调用已在 MatchConfirmModal 内完成）
const handleRejectRequest = () => {
    const reqId = currentRequest.value.requestId;
    showFriendRequest.value = false;

    // 从队列中移除当前请求
    pendingRequests.value = pendingRequests.value.filter((r: any) => r.id !== reqId);

    uni.showToast({
        title: '已拒绝',
        icon: 'none',
        duration: 1500,
    });

    // 继续展示下一个请求
    setTimeout(() => {
        showNextRequest();
    }, 500);
};

// 精准匹配
const goToPreciseMatch = () => {
    uni.navigateTo({
        url: '/subPack/match/postRequirement?mode=precise',
    });
};

// 盲配
const goToBlindMatch = () => {
    uni.navigateTo({
        url: '/subPack/match/matchSuccess',
    });
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

    // 右侧开关
    .toggle-switch {
        width: 100rpx;
        height: 52rpx;
        border-radius: 26rpx;
        background: linear-gradient(270deg, #58b4ff 0%, #c927ff 100%);
        position: relative;
        transition: all 0.3s ease;

        &.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

            .toggle-circle {
                transform: translateX(48rpx);
            }
        }

        &:not(.active) {
            background: rgba(255, 255, 255, 0.3);

            .toggle-circle {
                transform: translateX(4rpx);
            }
        }

        .toggle-circle {
            position: absolute;
            top: 4rpx;
            left: 0;
            width: 44rpx;
            height: 44rpx;
            border-radius: 50%;
            background: #ffffff;
            transition: transform 0.3s ease;
            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
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
