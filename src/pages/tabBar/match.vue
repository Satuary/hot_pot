<template>
    <view class="match-page">
        <!-- 自定义导航栏 -->
        <view class="navbar" :style="{ height: navbarHeight + 'px', paddingTop: navbarPaddingTop + 'px' }">
            <view class="navbar-inner">
                <!-- 左侧位置 -->
                <view class="location-picker" @click="chooseLocation">
                    <uni-icons type="location-filled" size="20" color="#FFFFFF"></uni-icons>
                    <text class="location-text">{{ location }}</text>
                </view>

                <!-- 右侧开关 -->
                <view class="toggle-switch" :class="{ active: isToggleOn }" @click="toggleSwitch">
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
    <MatchSuccessModal :visible="showMatchModal" :user-list="matchedUsers" @close="handleCloseModal" @unlock="handleUnlock" />
    <BlindBoxPopup ref="blindBoxPopup" />
    <MatchIntroModal :visible="showIntroModal" @close="handleCloseIntroModal" />
    <MatchConfirmModal
        :visible="showFriendRequest"
        :avatar="currentRequest.avatar"
        :description="currentRequest.description"
        :requestId="currentRequest.requestId"
        @cancel="handleRejectRequest"
        @confirm="handleAcceptRequest"
    />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow, onHide } from '@dcloudio/uni-app';
import { isLogin, isProfileComplete } from '@/utils/auth';
import MatchSuccessModal from '@/components/MatchSuccessModal.vue';
import BlindBoxPopup from '@/components/BlindBoxPopup.vue';
import MatchIntroModal from '@/components/MatchIntroModal.vue';
import MatchConfirmModal from '@/components/MatchConfirmModal.vue';
import { getPendingRequests, acceptRequest, rejectRequest } from '@/api/api';

const showMatchModal = ref(false);
const showIntroModal = ref(false);
const blindBoxPopup = ref<InstanceType<typeof BlindBoxPopup> | null>(null);
const matchedUsers = ref([
    {
        id: 1,
        avatar: 'https://picsum.photos/200',
        status: 'locked',
        statusText: '点击解锁',
    },
    {
        id: 2,
        avatar: 'https://picsum.photos/200',
        status: 'pending',
        statusText: '已发送申请',
        subStatusText: '等待对方同意',
    },
    {
        id: 3,
        avatar: 'https://picsum.photos/200',
        status: 'locked',
        statusText: '点击解锁',
    },
]);

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
const topOffset = ref(0);
const location = ref('万达广场');
const isToggleOn = ref(true);

// 好友请求相关状态
const showFriendRequest = ref(false);
const pendingRequests = ref<any[]>([]);
const currentRequest = ref({
    avatar: '',
    description: '',
    requestId: '',
});
let pollingTimer: number | null = null;
const POLL_INTERVAL = 5000; // 5秒轮询一次

// Mock 请求池，用于模拟收到的好友请求
const mockRequestPool = [
    {
        id: 'req_001',
        avatar: 'https://picsum.photos/200',
        nickname: '火锅达人小王',
        description: 'Hi~ 看到你也喜欢吃重庆火锅，我也是麻辣爱好者！要不要一起约个海底捞？我就在附近，随时可以出发~',
    },
    {
        id: 'req_002',
        avatar: 'https://picsum.photos/200',
        nickname: '美食探险家',
        description: '系统把你推给我啦，咱俩的火锅偏好超搭！这感觉就像拆盲盒开出了心心念念的隐藏款~要不要约一锅，沉浸式体验一场只属于我们的火锅时光？',
    },
    {
        id: 'req_003',
        avatar: 'https://picsum.photos/200',
        nickname: '吃货小分队',
        description: '嘿！看到你的匹配信息了，我也在附近，刚好也想吃火锅。一起拼个桌吧，人多更热闹，还能多点几个菜！',
    },
];
let mockRequestIndex = 0;

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;

    // 获取胶囊按钮信息，导航栏内容放在胶囊下方
    // #ifdef MP-WEIXIN
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    const gap = 8; // 胶囊底部间距
    navbarPaddingTop.value = menuButtonInfo.bottom + gap;
    navbarHeight.value = navbarPaddingTop.value + (88 * systemInfo.windowWidth) / 750;
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
    // 开关打开时恢复轮询
    if (isToggleOn.value) {
        startPolling();
    }
    const showModal = uni.getStorageSync('showMatchSuccessModal');
    if (showModal) {
        uni.removeStorageSync('showMatchSuccessModal');
        showMatchModal.value = true;
    }
    const hasSeenIntro = uni.getStorageSync('hasSeenMatchIntro');
    if (!hasSeenIntro) {
        showIntroModal.value = true;
    }
});

// 页面隐藏时停止轮询，节省资源
onHide(() => {
    stopPolling();
});

// 选择位置
const chooseLocation = () => {
    uni.chooseLocation({
        success: (res) => {
            location.value = res.name || res.address || '万达广场';
        },
    });
};

// 切换开关
const toggleSwitch = () => {
    isToggleOn.value = !isToggleOn.value;
    if (isToggleOn.value) {
        startPolling();
    } else {
        stopPolling();
        // 关闭开关时清空待处理请求
        pendingRequests.value = [];
        showFriendRequest.value = false;
    }
};

// 开始轮询匹配请求
const startPolling = () => {
    if (pollingTimer !== null) return;
    console.log('开始监听好友匹配请求...');
    pollingTimer = setInterval(() => {
        fetchPendingRequests();
    }, POLL_INTERVAL);
    // 立即执行一次
    fetchPendingRequests();
};

// 停止轮询
const stopPolling = () => {
    if (pollingTimer !== null) {
        clearInterval(pollingTimer);
        pollingTimer = null;
        console.log('停止监听好友匹配请求');
    }
};

// 获取待处理的好友请求
const fetchPendingRequests = async () => {
    if (!isToggleOn.value) return;
    
    try {
        // 尝试调用真实 API
        const res: any = await getPendingRequests();
        if (res && res.data && res.data.requests && res.data.requests.length > 0) {
            // 检查是否有新请求
            const existingIds = new Set(pendingRequests.value.map((r: any) => r.id));
            const newRequests = res.data.requests.filter((r: any) => !existingIds.has(r.id));
            if (newRequests.length > 0) {
                pendingRequests.value = [...pendingRequests.value, ...newRequests];
                // 展示第一个待处理的请求
                showNextRequest();
            }
        }
    } catch {
        // API 不可用时，使用 Mock 数据模拟
        mockFetchRequest();
    }
};

// Mock 模拟收到好友请求
const mockFetchRequest = () => {
    // 30% 概率模拟收到新请求
    if (Math.random() > 0.3 || pendingRequests.value.length > 0) return;
    
    const mockReq = mockRequestPool[mockRequestIndex % mockRequestPool.length];
    mockRequestIndex++;
    
    const newRequest = {
        id: mockReq.id + '_' + Date.now(),
        avatar: mockReq.avatar,
        nickname: mockReq.nickname,
        description: mockReq.description,
    };
    
    pendingRequests.value = [...pendingRequests.value, newRequest];
    showNextRequest();
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

// 同意好友请求
const handleAcceptRequest = async () => {
    const reqId = currentRequest.value.requestId;
    showFriendRequest.value = false;
    
    try {
        await acceptRequest({ requestId: reqId });
    } catch {
        // API 不可用时静默处理
    }
    
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

// 拒绝好友请求
const handleRejectRequest = async () => {
    const reqId = currentRequest.value.requestId;
    showFriendRequest.value = false;
    
    try {
        await rejectRequest({ requestId: reqId });
    } catch {
        // API 不可用时静默处理
    }
    
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
            border: 3rpx solid rgba(0, 212, 255, 0.5);
            box-shadow: 0 0 40rpx rgba(0, 212, 255, 0.3), 0 0 80rpx rgba(0, 212, 255, 0.15), 0 0 140rpx rgba(0, 212, 255, 0.08);
        }

        // 霓虹边框 - 粉色
        &.neon-pink {
            border: 3rpx solid rgba(255, 45, 149, 0.5);
            box-shadow: 0 0 40rpx rgba(255, 45, 149, 0.3), 0 0 80rpx rgba(255, 45, 149, 0.15), 0 0 140rpx rgba(255, 45, 149, 0.08);
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
