<template>
    <view class="container">
        <!-- 背景图片 -->
        <image src="/static/imgs/bg.png" mode="aspectFill" class="bg-image"></image>

        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view class="nav-back" @click="goBack">
                    <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
                </view>
                <!-- <view class="nav-title">充值</view>  -->
            </view>
        </view>

        <!-- 背景装饰：流星 -->
        <view class="meteor meteor-1"></view>
        <view class="meteor meteor-2"></view>

        <!-- 核心匹配区域 -->
        <view class="match-area">
            <!-- 轨道光晕背景 -->
            <view class="orbit-glow orbit-outer"></view>
            <view class="orbit-glow orbit-inner"></view>

            <!-- 中心火锅图片 -->
            <view class="center-hub">
                <image src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop" mode="aspectFill" class="hotpot-img"></image>
            </view>

            <!-- 动态旋转层：包含头像和装饰球 -->
            <view class="rotating-layer" :style="{ animationDuration: duration + 's' }">
                <!-- 元素 2: 装饰球 (右上) -->
                <view class="item ball ball-purple"></view>

                <!-- 匹配中的用户头像：数据有几个就展示几个，沿轨道按人数均分分布 -->
                <view
                    v-for="(user, index) in recommendUsers"
                    :key="user.userId || user.id || index"
                    class="item user-avatar"
                    :style="getAvatarStyle(index, recommendUsers.length)"
                >
                    <image :src="user.avatar" mode="aspectFill" class="avatar"></image>
                </view>

                <!-- 元素 4: 装饰球 (左下) -->
                <view class="item ball ball-yellow"></view>

                <!-- 元素 5: 装饰球 (正上方点缀) -->
                <view class="item ball ball-cyan"></view>
            </view>
        </view>

        <!-- 底部文字与按钮 -->
        <view class="footer">
            <text class="status-text">{{ statusText }}</text>
            <button class="cancel-btn" @click="handleCancel">取消匹配</button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getMatchRecommend, cancelDemand } from '@/api/api';

// 状态栏高度
const statusBarHeight = ref(0);

const duration = ref(20);
const statusText = ref('正在匹配...');

// 匹配中的用户列表
const recommendUsers = ref<any[]>([]);

// 用户头像在轨道上的分布半径 (rpx)
const ORBIT_RADIUS = 200;

// 按人数均分圆周，计算每个头像在轨道上的偏移位置
const getAvatarStyle = (index: number, total: number) => {
    const angle = ((360 / total) * index - 90) * (Math.PI / 180);
    const x = Math.round(ORBIT_RADIUS * Math.cos(angle));
    const y = Math.round(ORBIT_RADIUS * Math.sin(angle));
    return { transform: `translate(${x}rpx, ${y}rpx)` };
};

let matchTimer: any = null;
let timeoutTimer: any = null;
let demandId = '';
// 是否已匹配到人，避免轮询重复跳转
let matched = false;

// 接收发布需求后返回的 demandId，匹配成功后传递给匹配页
onLoad((options) => {
    demandId = (options as any)?.demandId || '';
    console.log('demandId', demandId);
});

// 停止推荐轮询与超时定时器
const stopPolling = () => {
    if (matchTimer) {
        clearInterval(matchTimer);
        matchTimer = null;
    }
    if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
    }
};

// 根据 demandId 拉取匹配中的用户列表；拉到人后回到匹配页弹出"匹配成功"弹窗
const fetchRecommend = async () => {
    if (matched) return;
    try {
        const res = await getMatchRecommend({ demandId });
        // request 已解包 data，返回即用户数组；仍兼容 list/users/data 等结构
        const users = Array.isArray(res) ? res : res?.list || res?.users || res?.data || [];
        if (Array.isArray(users) && users.length) {
            matched = true;
            recommendUsers.value = users;
            stopPolling();
            // 已匹配到人：持久化"待选锅友"状态（值为 demandId，供匹配页拉推荐列表），
            // 用户未选人发起匹配前该标记一直保留，离开/刷新匹配页后弹窗仍会恢复
            statusText.value = '匹配成功！';
            uni.setStorageSync('pendingMatchSuccess', demandId);
            setTimeout(() => {
                uni.switchTab({ url: '/pages/tabBar/match' });
            }, 800);
        }
    } catch {
        // 拉取失败时不渲染用户头像，下一轮继续
    }
};

// 返回上一页
function goBack() {
    uni.navigateBack();
}

// 等待匹配超时（30 秒）：自动取消需求并提示，返回上一页
const handleMatchTimeout = async () => {
    if (matched) return;
    matched = true;
    stopPolling();
    if (demandId) {
        try {
            await cancelDemand({ demandId });
        } catch {
            // 取消失败不影响提示与返回
        }
    }
    uni.showToast({
        title: '附近没有匹配的人',
        icon: 'none',
        duration: 1500,
    });
    setTimeout(() => {
        uni.navigateBack();
    }, 1500);
};

onMounted(() => {
    if (demandId) {
        // 立即拉一次，之后每 3 秒轮询，直到匹配到人或超时
        fetchRecommend();
        matchTimer = setInterval(fetchRecommend, 3000);
        // 30 秒未匹配到则自动取消并提示
        timeoutTimer = setTimeout(handleMatchTimeout, 30 * 1000);
    }

    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
});

onUnmounted(() => {
    stopPolling();
});

// 取消发布需求：调 mini/demand/cancel，demandId 拼在地址栏，code=200 才算取消成功
const handleCancel = async () => {
    if (demandId) {
        try {
            const res: any = await cancelDemand({ demandId });
            // request 层 code=200/0 才 resolve（data 为空时返回整个响应体），这里再按 code 兜底校验
            const code = res?.code ?? 200;
            if (code === 200) {
                stopPolling();
                uni.showToast({
                    title: '已取消匹配',
                    icon: 'none',
                });
                setTimeout(() => {
                    uni.navigateBack();
                }, 800);
            } else {
                uni.showToast({
                    title: '取消失败，请联系客服',
                    icon: 'none',
                });
            }
        } catch {
            // 非 200 或网络错误：取消失败，留在当前页可重试
            uni.showToast({
                title: '取消失败，请联系客服',
                icon: 'none',
            });
        }
        return;
    }
    uni.navigateBack();
};
</script>

<style lang="scss" scoped>
/* 页面容器 */
.container {
    width: 100vw;
    height: 100vh;
    background: #1a103c;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
}

/* 背景图片层 */
.bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

/* 导航栏 */
.nav-bar {
    width: 100%;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    // background: #000;
    z-index: 100;

    .nav-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 88rpx;
        padding: 0 30rpx;
        position: relative;
    }

    .nav-back {
        position: absolute;
        left: 20rpx;
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .nav-title {
        font-size: 34rpx;
        color: #fff;
        font-weight: 500;
    }

    .nav-right {
        position: absolute;
        right: 200rpx;
        font-size: 23rpx;
        color: #fff;
        font-weight: normal;
        
    }
}


/* --- 背景流星特效 --- */
.meteor {
    position: absolute;
    width: 100rpx;
    height: 2rpx;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.6));
    transform: rotate(-45deg);
    opacity: 0;
    animation: meteorFall 3s infinite ease-in-out;
    z-index: 1;
}
.meteor-1 {
    top: 20%;
    left: 80%;
    animation-delay: 0s;
}
.meteor-2 {
    top: 60%;
    left: 20%;
    animation-delay: 1.5s;
    width: 150rpx;
}

@keyframes meteorFall {
    0% {
        transform: translateX(0) translateY(0) rotate(-45deg);
        opacity: 0;
    }
    50% {
        opacity: 0.8;
    }
    100% {
        transform: translateX(-200rpx) translateY(200rpx) rotate(-45deg);
        opacity: 0;
    }
}

/* --- 核心匹配区域 --- */
.match-area {
    position: relative;
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

/* 轨道光晕 */
.orbit-glow {
    position: absolute;
    border-radius: 50%;
    border: 1rpx solid rgba(255, 255, 255, 0.1);
    background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%);
    box-shadow: 0 0 20rpx rgba(138, 43, 226, 0.2);
}
.orbit-outer {
    width: 700rpx;
    height: 700rpx;
}
.orbit-inner {
    width: 480rpx;
    height: 480rpx;
    border-color: rgba(255, 255, 255, 0.15);
}

/* 中心火锅 Hub */
.center-hub {
    position: absolute;
    z-index: 10;
    width: 260rpx;
    height: 260rpx;
    border-radius: 50%;
    background: #2a1f45; /* 防止图片透明导致的穿帮 */
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30rpx rgba(0, 0, 0, 0.5);
}

.hotpot-img {
    width: 240rpx;
    height: 240rpx;
    border-radius: 50%;
}

/* --- 旋转层逻辑 --- */
.rotating-layer {
    position: absolute;
    width: 600rpx; /* 控制整体分布范围 */
    height: 600rpx;
    border-radius: 50%;
    /* 持续旋转动画 */
    animation: rotateCircle linear infinite;
    z-index: 5;
}

/* 旋转动画关键帧 */
@keyframes rotateCircle {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* 轨道上的通用元素 */
.item {
    position: absolute;
    /* 这里的技巧是：先定位到圆心，然后translate出去，再反向旋转保持自身直立（可选） */
    left: 50%;
    top: 50%;
    margin-left: -30rpx; /* 修正自身宽度的一半，使其居中 */
    margin-top: -30rpx;
}

/* --- 具体元素的位置分布 (使用三角函数近似值定位) --- */

/* 轨道上的用户头像（位置由脚本按人数均分计算） */
.user-avatar .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
    background: #eee;
}

/* 2. 右上角紫色球 (约 20度位置) */
.ball-purple {
    transform: translate(220rpx, -80rpx);
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #e0aaff, #9d4edd);
    box-shadow: 0 0 15rpx #9d4edd;
}

/* 4. 下方黄色球 (约 260度位置) */
.ball-yellow {
    transform: translate(-40rpx, 240rpx);
    width: 30rpx;
    height: 30rpx;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ffffcc, #ffd700);
    box-shadow: 0 0 15rpx #ffd700;
}

/* 5. 左侧青色小球 (约 150度位置) */
.ball-cyan {
    transform: translate(-240rpx, -60rpx);
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    background: #00ffff;
    box-shadow: 0 0 10rpx #00ffff;
}

/* --- 底部区域 --- */
.footer {
    width: 100%;
    padding-bottom: 80rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 20;
}

.status-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 32rpx;
    margin-bottom: 60rpx;
    letter-spacing: 2rpx;
}

.cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    border-radius: 50rpx;
    width: 300rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    /* 去除默认边框 */
    &::after {
        border: none;
    }

    &:active {
        background: rgba(255, 255, 255, 0.2);
    }
}
</style>
