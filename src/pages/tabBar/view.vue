<template>
    <view class="page view-page">
        <!-- Header -->
        <view class="nav-header">
            <text class="nav-title">查看</text>
        </view>

        <!-- Tabs -->
        <view class="tabs">
            <view
                v-for="tab in tabs"
                :key="tab.key"
                class="tab-item"
                :class="{ active: activeTab === tab.key }"
                @click="activeTab = tab.key"
            >
                <text>{{ tab.label }}</text>
                <view v-if="activeTab === tab.key" class="tab-indicator"></view>
            </view>
        </view>

        <!-- Content -->
        <scroll-view class="content" scroll-y>
            <view v-if="filteredOrders.length === 0" class="empty-state">
                <text class="empty-icon">📋</text>
                <text class="empty-text">暂无记录</text>
            </view>

            <view v-else class="order-list">
                <view
                    v-for="order in filteredOrders"
                    :key="order.id"
                    class="order-card dark-card"
                >
                    <!-- Order Header -->
                    <view class="order-header">
                        <text class="order-status" :class="order.status">{{ order.statusText }}</text>
                        <text class="order-time">{{ order.createTime }}</text>
                    </view>

                    <!-- Matched User -->
                    <view class="matched-user" v-if="order.matchedUser">
                        <view class="user-avatar">
                            <text>👤</text>
                        </view>
                        <view class="user-info">
                            <text class="user-name">{{ order.matchedUser.nickname }}</text>
                            <text class="user-meta">{{ order.matchedUser.gender }} · {{ order.matchedUser.birthday }}</text>
                        </view>
                    </view>

                    <!-- Order Details -->
                    <view class="order-detail">
                        <view class="detail-row">
                            <text class="detail-label">火锅类型</text>
                            <text class="detail-value">{{ order.requirement.hotpotType.join('、') || '不限' }}</text>
                        </view>
                        <view class="detail-row">
                            <text class="detail-label">店铺</text>
                            <text class="detail-value">{{ order.requirement.store || '待定' }}</text>
                        </view>
                        <view class="detail-row">
                            <text class="detail-label">时间</text>
                            <text class="detail-value">{{ order.requirement.time || '待定' }}</text>
                        </view>
                        <view class="detail-row">
                            <text class="detail-label">金额</text>
                            <text class="detail-value price">¥{{ order.amount.toFixed(2) }}</text>
                        </view>
                    </view>

                    <!-- Actions -->
                    <view class="order-actions">
                        <text class="action-btn outline" @click="goOrderDetail(order)">查看详情</text>
                        <text
                            v-if="order.status === 'matched'"
                            class="action-btn primary"
                            @click="contactUser(order)"
                        >联系对方</text>
                        <text
                            v-if="order.status === 'completed'"
                            class="action-btn outline"
                            @click="goRefund(order)"
                        >申请退款</text>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { appState, type MatchOrder } from '@/utils/store';

const tabs = [
    { key: 'all', label: '全部' },
    { key: 'matched', label: '已匹配' },
    { key: 'completed', label: '已完成' },
    { key: 'refund', label: '退款' },
];

const activeTab = ref('all');

const mockOrders: MatchOrder[] = [
    {
        id: '20230628001',
        status: 'matched',
        statusText: '已匹配',
        createTime: '2023-06-28 14:30',
        requirement: {
            gender: '女',
            ageMin: '20',
            ageMax: '30',
            hotpotType: ['重庆火锅'],
            taste: ['麻辣'],
            motivation: '吃货交友',
            store: '海底捞(闵行店)',
            storeAddress: '闵行区都市路5001号',
            time: '今晚 19:00',
            payment: 'AA',
        },
        matchedUser: {
            id: 'u1',
            phone: '138****0001',
            nickname: '火锅小公主',
            gender: '女',
            birthday: '1998-06',
            height: '165',
            weight: '50',
            hotpotType: ['重庆火锅', '潮汕牛肉'],
            taste: ['麻辣', '微辣'],
            motivation: '想找人一起吃',
            wechat: 'hotpot_lover',
            avatar: '',
            balance: 0,
            matchCount: 5,
        },
        amount: 99.00,
    },
    {
        id: '20230627002',
        status: 'completed',
        statusText: '已完成',
        createTime: '2023-06-27 18:00',
        requirement: {
            gender: '男',
            ageMin: '25',
            ageMax: '35',
            hotpotType: ['成都火锅'],
            taste: ['清汤'],
            motivation: '解馋',
            store: '小龙坎(七宝店)',
            storeAddress: '闵行区七宝万科广场B1',
            time: '昨天 19:30',
            payment: 'AA',
        },
        matchedUser: {
            id: 'u2',
            phone: '139****0002',
            nickname: '麻辣达人',
            gender: '男',
            birthday: '1995-03',
            height: '178',
            weight: '70',
            hotpotType: ['成都火锅'],
            taste: ['微辣'],
            motivation: '解馋',
            wechat: 'spicy_king',
            avatar: '',
            balance: 0,
            matchCount: 8,
        },
        amount: 128.00,
        refundStatus: '',
    },
    {
        id: '20230625003',
        status: 'refunding',
        statusText: '退款中',
        createTime: '2023-06-25 12:00',
        requirement: {
            gender: '不限',
            ageMin: '22',
            ageMax: '32',
            hotpotType: ['老北京涮肉'],
            taste: ['骨汤'],
            motivation: '体验新店',
            store: '东来顺(虹桥店)',
            storeAddress: '闵行区虹桥天地3楼',
            time: '6月25日 18:00',
            payment: 'AA',
        },
        matchedUser: {
            id: 'u3',
            phone: '137****0003',
            nickname: '吃货小明',
            gender: '女',
            birthday: '2000-01',
            height: '162',
            weight: '45',
            hotpotType: ['老北京涮肉', '椰子鸡'],
            taste: ['清汤', '菌汤'],
            motivation: '庆祝',
            wechat: 'foodie_ming',
            avatar: '',
            balance: 0,
            matchCount: 3,
        },
        amount: 88.00,
        refundStatus: 'pending',
    },
];

const filteredOrders = computed(() => {
    if (activeTab.value === 'all') return mockOrders;
    if (activeTab.value === 'refund') return mockOrders.filter(o => o.refundStatus);
    return mockOrders.filter(o => o.status === activeTab.value);
});

const goOrderDetail = (order: MatchOrder) => {
    appState.orders = [order];
    uni.navigateTo({
        url: '/subPack/me/orderDetail?id=' + order.id,
    });
};

const contactUser = (order: MatchOrder) => {
    uni.showToast({ title: '已发送联系请求', icon: 'success' });
};

const goRefund = (order: MatchOrder) => {
    uni.navigateTo({
        url: '/subPack/me/refund?id=' + order.id,
    });
};
</script>

<style lang="scss" scoped>
.view-page {
    background: #1A1A1A;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.nav-header {
    padding: 30rpx;
    padding-top: calc(60rpx + var(--status-bar-height, 0px));
}

.nav-title {
    font-size: 40rpx;
    color: #FFFFFF;
    font-weight: 700;
}

.tabs {
    display: flex;
    padding: 0 30rpx;
    gap: 40rpx;
    border-bottom: 1px solid #2A2A2A;
}

.tab-item {
    position: relative;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #808080;
}

.tab-item.active {
    color: #FF6B3D;
    font-weight: 600;
}

.tab-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40rpx;
    height: 4rpx;
    background: #FF6B3D;
    border-radius: 2rpx;
}

.content {
    flex: 1;
    padding: 20rpx 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 200rpx 0;
}

.empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #808080;
}

.order-list {
    padding: 0 30rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    padding-bottom: 30rpx;
}

.order-card {
    margin: 0;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.order-status {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
}

.order-status.matched {
    color: #FF6B3D;
    background: rgba(255, 107, 61, 0.15);
}

.order-status.completed {
    color: #4CD964;
    background: rgba(76, 217, 100, 0.15);
}

.order-status.refunding {
    color: #FF9500;
    background: rgba(255, 149, 0, 0.15);
}

.order-time {
    font-size: 24rpx;
    color: #808080;
}

.matched-user {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding: 16rpx;
    background: #333;
    border-radius: 12rpx;
}

.user-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: #444;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
    font-size: 32rpx;
}

.user-name {
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: 500;
    display: block;
}

.user-meta {
    font-size: 24rpx;
    color: #808080;
    margin-top: 4rpx;
    display: block;
}

.order-detail {
    border-top: 1px solid #333;
    padding-top: 20rpx;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 10rpx 0;
}

.detail-label {
    font-size: 26rpx;
    color: #808080;
}

.detail-value {
    font-size: 26rpx;
    color: #B0B0B0;
}

.detail-value.price {
    color: #FF6B3D;
    font-weight: 600;
}

.order-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1px solid #333;
}

.action-btn {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    border-radius: 50rpx;
    font-size: 26rpx;
    font-weight: 500;
}

.action-btn.primary {
    background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
    color: #FFFFFF;
}

.action-btn.outline {
    border: 2rpx solid #4A4A4A;
    color: #B0B0B0;
}
</style>
