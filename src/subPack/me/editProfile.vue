<template>
    <view class="container">
        <!-- 顶部导航栏模拟 (实际开发中建议使用 uni-nav-bar 或原生导航) -->
        <view class="nav-bar" :style="navBarStyle">
            <uni-icons type="left" size="24" color="#ffffff" @click="handleBack"></uni-icons>
        </view>

        <!-- 头像区域 -->
        <view class="avatar-section">
            <view class="avatar-wrapper">
                <!-- 头像图片 -->
                <image class="avatar-img" src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" mode="aspectFill"></image>

                <!-- 相机图标按钮 -->
                <view class="camera-btn">
                    <uni-icons type="camera-filled" size="16" color="#000000"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 列表区域 -->
        <view class="list-container">
            <!-- 昵称 -->
            <view class="list-item" @click="handleClick('nickname')">
                <text class="label">昵称</text>
                <view class="value-row">
                    <text class="value-text">高山我梦</text>
                    <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                </view>
            </view>

            <!-- 性别 -->
            <view class="list-item" @click="handleClick('gender')">
                <text class="label">性别</text>
                <view class="value-row">
                    <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                </view>
            </view>

            <!-- 生日 -->
            <view class="list-item" @click="handleClick('birthday')">
                <text class="label">生日</text>
                <view class="value-row">
                    <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                </view>
            </view>

            <!-- 所在地 -->
            <view class="list-item" @click="handleClick('location')">
                <text class="label">所在地</text>
                <view class="value-row">
                    <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                </view>
            </view>

            <!-- 月最新号 -->
            <view class="list-item" @click="handleClick('hotpot_id')">
                <text class="label">月最新号</text>
                <view class="value-row">
                    <text class="value-text static-text">523656</text>
                    <!-- 注意：原图中这一项右侧没有箭头，只有数字 -->
                </view>
            </view>

            <!-- 身高体重 -->
            <view class="list-item" @click="handleClick('body_stats')">
                <text class="label">身高体重</text>
                <view class="value-row">
                    <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                </view>
            </view>

            <!-- 火锅类型 -->
            <view class="list-item" @click="handleClick('hotpot_type')">
                <text class="label">火锅类型</text>
                <view class="value-row">
                    <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                </view>
            </view>

            <!-- 口味 -->
            <view class="list-item" @click="handleClick('taste')">
                <text class="label">口味</text>
                <view class="value-row">
                    <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                </view>
            </view>

            <!-- 动力 -->
            <view class="list-item" @click="handleClick('motivation')">
                <text class="label">动力</text>
                <view class="value-row">
                    <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const handleClick = (type) => {
    console.log('点击了:', type);
    // uni.navigateTo({ ... })
};

const handleBack = () => {
    uni.navigateBack({
        fail: () => {
            uni.switchTab({
                url: '/pages/tabBar/me',
            });
        },
    });
};

const menuTop = ref(0);
const menuHeight = ref(0);
const statusBarHeight = ref(0);

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
    try {
        // #ifdef MP-WEIXIN
        const rect = uni.getMenuButtonBoundingClientRect();
        menuTop.value = rect.top;
        menuHeight.value = rect.height;
        // #endif
    } catch {
        menuTop.value = 0;
    }
});

const navBarStyle = computed(() => {
    if (menuTop.value > 0) {
        return {
            paddingTop: `${menuTop.value}px`,
            height: `${menuHeight.value}px`,
        };
    }
    return {
        paddingTop: `${statusBarHeight.value}px`,
        height: '44px',
    };
});
</script>

<style lang="scss" scoped>
/* 全局容器 */
.container {
    min-height: 100vh;
    background-color: #000000;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* 导航栏区域 */
.nav-bar {
    display: flex;
    align-items: center;
    padding-left: 15px;
}

/* 头像区域 */
.avatar-section {
    display: flex;
    justify-content: center;
    padding: 20px 0 40px 0; /* 上下间距 */
}

.avatar-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1); /* 轻微边框增加质感 */
}

.camera-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 30px;
    height: 30px;
    background-color: #ffffff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #000000; /* 白色圆圈外的黑边，增加层次感 */
    box-sizing: border-box;
}

/* 列表区域 */
.list-container {
    background-color: #000000;
    /* 如果列表项之间有分割线，可以在这里加背景色，item加border-bottom */
}

.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px; /* 左右内边距 */
    /* 可选：添加极细的分割线，如果原图有的话 */
    /* border-bottom: 1px solid #1a1a1a; */
}

/* 列表项点击态 */
.list-item:active {
    background-color: #111111;
}

.label {
    font-size: 16px;
    color: #ffffff;
    line-height: 1.4;
}

.value-row {
    display: flex;
    align-items: center;
}

.value-text {
    font-size: 15px;
    color: #8c8c8c; /* 浅灰色文字 */
    margin-right: 8px;
}

/* 针对纯数字且无箭头的特殊处理 */
.static-text {
    margin-right: 0;
}

.arrow-icon {
    opacity: 0.5; /* 降低箭头透明度使其更柔和 */
}
</style>
