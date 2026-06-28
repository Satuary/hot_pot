<template>
    <view class="page history-page">
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">使用明细</text>
        </view>

        <!-- Balance Summary -->
        <view class="balance-summary dark-card">
            <view class="summary-row">
                <text class="summary-label">当前余额</text>
                <text class="summary-value">¥{{ appState.userProfile.balance.toFixed(2) }}</text>
            </view>
            <view class="summary-row">
                <text class="summary-label">累计消费</text>
                <text class="summary-value red">¥315.00</text>
            </view>
        </view>

        <!-- Tab Filter -->
        <view class="filter-tabs">
            <view
                v-for="tab in filterTabs"
                :key="tab.key"
                class="filter-tab"
                :class="{ active: activeFilter === tab.key }"
                @click="activeFilter = tab.key"
            >{{ tab.label }}</view>
        </view>

        <!-- Transaction List -->
        <scroll-view class="trans-list" scroll-y>
            <view v-for="(group, date) in filteredTransactions" :key="date" class="trans-group">
                <text class="date-label">{{ date }}</text>
                <view v-for="t in group" :key="t.id" class="trans-item dark-card">
                    <text class="trans-icon">{{ t.icon }}</text>
                    <view class="trans-info">
                        <text class="trans-desc">{{ t.desc }}</text>
                        <text class="trans-time">{{ t.time }}</text>
                    </view>
                    <text class="trans-amount" :class="{ plus: t.type === 'income' }">
                        {{ t.type === 'income' ? '+' : '-' }}¥{{ t.amount.toFixed(2) }}
                    </text>
                </view>
            </view>

            <view class="load-more">
                <text class="load-text">— 没有更多了 —</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { appState } from '@/utils/store';

const activeFilter = ref('all');

const filterTabs = [
    { key: 'all', label: '全部' },
    { key: 'income', label: '充值' },
    { key: 'expense', label: '消费' },
];

const allTransactions = [
    { id: '1', date: '2023-06-28', time: '14:30', type: 'expense', amount: 99.00, desc: '精准匹配服务费', icon: '🔍' },
    { id: '2', date: '2023-06-27', time: '10:15', type: 'income', amount: 209.00, desc: '充值 - 199元套餐(含赠送30元)', icon: '💰' },
    { id: '3', date: '2023-06-26', time: '19:00', type: 'expense', amount: 99.00, desc: '盲盒匹配服务费', icon: '🎁' },
    { id: '4', date: '2023-06-25', time: '12:00', type: 'income', amount: 99.00, desc: '充值 - 99元套餐', icon: '💰' },
    { id: '5', date: '2023-06-24', time: '20:30', type: 'expense', amount: 99.00, desc: '精准匹配服务费', icon: '🔍' },
    { id: '6', date: '2023-06-23', time: '16:00', type: 'expense', amount: 18.00, desc: '查看联系方式', icon: '💬' },
];

const filteredTransactions = computed(() => {
    let data = allTransactions;
    if (activeFilter.value === 'income') data = data.filter(t => t.type === 'income');
    if (activeFilter.value === 'expense') data = data.filter(t => t.type === 'expense');

    const grouped: Record<string, any[]> = {};
    data.forEach(t => {
        if (!grouped[t.date]) grouped[t.date] = [];
        grouped[t.date].push(t);
    });
    return grouped;
});

function goBack() { uni.navigateBack(); }
</script>

<style lang="scss" scoped>
.history-page{background:#1A1A1A;min-height:100vh;display:flex;flex-direction:column;}
.nav-header{display:flex;align-items:center;padding:20rpx 30rpx 30rpx;padding-top:calc(60rpx + var(--status-bar-height,0px));}
.back-btn{width:60rpx;height:60rpx;display:flex;align-items:center;justify-content:center;margin-right:20rpx;}
.back-icon{font-size:48rpx;color:#FFF;}
.nav-title{font-size:34rpx;color:#FFF;font-weight:600;}
.balance-summary{margin:0 30rpx 20rpx;}
.summary-row{display:flex;justify-content:space-between;padding:12rpx 0;}
.summary-label{font-size:26rpx;color:#808080;}
.summary-value{font-size:30rpx;color:#FFD700;font-weight:600;}
.summary-value.red{color:#FF3B30;}
.filter-tabs{display:flex;padding:0 30rpx;gap:40rpx;margin-bottom:20rpx;}
.filter-tab{font-size:28rpx;color:#808080;padding:10rpx 0;}
.filter-tab.active{color:#FF6B3D;font-weight:600;}
.trans-list{flex:1;padding:0 30rpx;}
.trans-group{margin-bottom:20rpx;}
.date-label{font-size:24rpx;color:#808080;padding:10rpx 0;display:block;}
.trans-item{margin:0 0 12rpx 0;display:flex;align-items:center;padding:20rpx;}
.trans-icon{font-size:32rpx;margin-right:20rpx;}
.trans-info{flex:1;}
.trans-desc{font-size:28rpx;color:#FFF;display:block;}
.trans-time{font-size:22rpx;color:#808080;margin-top:6rpx;display:block;}
.trans-amount{font-size:30rpx;color:#FFF;font-weight:500;}
.trans-amount.plus{color:#4CD964;}
.load-more{padding:40rpx 0 60rpx;text-align:center;}
.load-text{font-size:24rpx;color:#555;}
</style>
