<template>
    <view class="page history-page">
        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view class="nav-back" @click="goBack">
                    <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
                </view>
                <view class="nav-title">交易明细</view>
            </view>
        </view>

        <!-- 主体卡片 -->
        <view class="main-card" :style="{ minHeight: `calc(100vh - ${statusBarHeight}px - 88rpx - 50rpx)` }">
            <!-- 标签页 -->
            <view class="tabs">
                <view class="tab" :class="{ active: activeTab === 'usage' }" @click="activeTab = 'usage'">
                    <text class="tab-text">使用明细</text>
                </view>
                <view class="tab" :class="{ active: activeTab === 'transaction' }" @click="activeTab = 'transaction'">
                    <text class="tab-text">交易记录</text>
                </view>
            </view>

            <!-- 使用明细 -->
            <scroll-view v-if="activeTab === 'usage'" class="list-scroll" scroll-y :style="{ maxHeight: `calc(100vh - ${statusBarHeight}px - 88rpx - 50rpx - 80rpx - 60rpx)` }">
                <view class="list-wrap">
                    <view v-for="item in usageList" :key="item.id" class="list-item">
                        <text class="item-title">{{ item.title }}</text>
                        <text class="item-time">{{ item.time }}</text>
                    </view>
                    <view v-if="!usageList.length" class="empty-tip">暂无使用明细</view>
                </view>
            </scroll-view>

            <!-- 交易记录 -->
            <scroll-view v-if="activeTab === 'transaction'" class="list-scroll" scroll-y :style="{ maxHeight: `calc(100vh - ${statusBarHeight}px - 88rpx - 50rpx - 80rpx - 60rpx)` }">
                <view class="list-wrap">
                    <view class="month-filter" @click="openPicker">
                        <text class="month-text">{{ selectedYear }}年{{ selectedMonth }}月</text>
                        <text class="month-arrow">▼</text>
                    </view>

                    <view v-for="group in transactionGroups" :key="group.month" class="group">
                        <view class="group-title">{{ group.month }}</view>
                        <view v-for="item in group.items" :key="item.id" class="list-item">
                            <text class="item-title">{{ item.desc }}<text class="amount">{{ item.amountText }}</text></text>
                            <text class="item-time">{{ item.time }}</text>
                        </view>
                    </view>
                    <view v-if="!transactionGroups.length" class="empty-tip">暂无交易记录</view>
                </view>
            </scroll-view>
        </view>

        <!-- 时间选择器弹窗 -->
        <view class="picker-mask" v-if="showPicker" @click="closePicker">
            <view class="picker-popup" @click.stop>
                <view class="picker-header">选择时间</view>
                <picker-view class="picker-view" :value="pickerValue" @change="onPickerChange" indicator-style="height: 80rpx;" mask-style="background: linear-gradient(180deg, rgba(26,26,26,1) 0%, rgba(26,26,26,0.3) 30%, transparent 50%, rgba(26,26,26,0.3) 70%, rgba(26,26,26,1) 100%);">
                    <picker-view-column>
                        <view v-for="year in yearRange" :key="year" class="picker-item">{{ year }}年</view>
                    </picker-view-column>
                    <picker-view-column>
                        <view v-for="month in monthRange" :key="month" :class="['picker-item']">{{ month }}月</view>
                    </picker-view-column>
                </picker-view>
                <view class="picker-actions">
                    <view class="picker-btn cancel" @click="closePicker">取消</view>
                    <view class="picker-btn confirm" @click="confirmPicker">确认</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { appState } from '@/utils/store';

const statusBarHeight = ref(0);
const activeTab = ref<'usage' | 'transaction'>('transaction');

// 使用明细数据（优先从订单生成，否则使用模拟数据）
const usageList = computed(() => {
    if (appState.orders && appState.orders.length) {
        return appState.orders.map((order, index) => ({
            id: order.id || `u${index}`,
            title: `匹配消耗1次`,
            time: order.createTime || '2025.10.29 10:25',
        }));
    }
    return [
        { id: 'u1', title: '匹配消耗1次', time: '2025.10.29 10:25' },
        { id: 'u2', title: '匹配消耗1次', time: '2025.10.29 10:25' },
        { id: 'u3', title: '匹配消耗1次', time: '2025.10.29 10:25' },
    ];
});

// 交易记录数据
const rawTransactions = computed(() => {
    const list: any[] = [];
    if (appState.transactions && appState.transactions.length) {
        appState.transactions.forEach((t) => {
            list.push({
                id: t.id || Date.now().toString(),
                date: t.date || '2025-10-29',
                time: t.time ? `${t.date.replace(/-/g, '.')} ${t.time}` : '2025.10.29 10:25',
                desc: t.desc ? t.desc.split(' - ')[0] : '按次充值',
                amountText: t.amount ? `${t.amount}元` : '',
                amount: t.amount || 0,
            });
        });
    }
    // 补充模拟数据，确保有分组展示
    list.push(
        { id: 't1', date: '2023-07-15', time: '2025.10.29 10:25', desc: '按次充值', amountText: '20元', amount: 20 },
        { id: 't2', date: '2023-07-10', time: '2025.10.29 10:25', desc: '按月充值', amountText: '20元', amount: 20 },
        { id: 't3', date: '2023-06-20', time: '2025.10.29 10:25', desc: '按次充值', amountText: '20元', amount: 20 },
        { id: 't4', date: '2023-06-05', time: '2025.10.29 10:25', desc: '按月充值', amountText: '20元', amount: 20 }
    );
    return list;
});

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.getMonth() + 1);

const transactionGroups = computed(() => {
    const filtered = rawTransactions.value.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear.value && d.getMonth() + 1 === selectedMonth.value;
    });
    const map: Record<string, any[]> = {};
    filtered.forEach((item) => {
        const d = new Date(item.date);
        const key = `${d.getFullYear()}年${d.getMonth() + 1}月`;
        if (!map[key]) map[key] = [];
        map[key].push(item);
    });
    return Object.keys(map).map((month) => ({
        month,
        items: map[month],
    }));
});

// 时间选择器
const showPicker = ref(false);
const yearRange = Array.from({ length: 50 }, (_, i) => 2000 + i);
const monthRange = Array.from({ length: 12 }, (_, i) => i + 1);
const pickerValue = ref([now.getFullYear() - 2000, now.getMonth()]);
const tempPickerValue = ref([...pickerValue.value]);

function openPicker() {
    pickerValue.value = [selectedYear.value - 2000, selectedMonth.value - 1];
    tempPickerValue.value = [...pickerValue.value];
    showPicker.value = true;
}

function closePicker() {
    showPicker.value = false;
}

function onPickerChange(e: any) {
    tempPickerValue.value = e.detail.value;
}

function confirmPicker() {
    const [yearIndex, monthIndex] = tempPickerValue.value;
    selectedYear.value = yearRange[yearIndex];
    selectedMonth.value = monthRange[monthIndex];
    showPicker.value = false;
}

function goBack() {
    uni.navigateBack();
}

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
});
</script>

<style lang="scss" scoped>
.history-page {
    min-height: 100vh;
    background: #000;
}

/* 导航栏 */
.nav-bar {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background: #000;
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
}

/* 主体卡片 */
.main-card {
    margin: 20rpx 30rpx 30rpx;
    border-radius: 30rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.03);
    overflow: hidden;
}

/* 标签页 */
.tabs {
    display: flex;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.tab {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 30rpx 0 20rpx;
    position: relative;

    &.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background: #fff;
        border-radius: 6rpx;
    }
}

.tab-text {
    font-size: 32rpx;
    color: #808080;
}

.tab.active .tab-text {
    color: #fff;
    font-weight: 500;
}

/* 列表 */

.list-wrap {
    padding: 30rpx;
}

.month-filter {
    display: inline-flex;
    align-items: center;
    padding: 14rpx 24rpx;
    border-radius: 50rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    margin-bottom: 20rpx;

    .month-text {
        font-size: 28rpx;
        color: #fff;
        margin-right: 10rpx;
    }

    .month-arrow {
        font-size: 20rpx;
        color: #fff;
    }
}

.group {
    margin-bottom: 30rpx;
}

.group-title {
    font-size: 24rpx;
    color: #808080;
    margin-bottom: 16rpx;
}

.list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
}

.item-title {
    font-size: 30rpx;
    color: #fff;
}

.amount {
    color: #4CD964;
}

.item-time {
    font-size: 26rpx;
    color: #808080;
}

.empty-tip {
    text-align: center;
    padding: 100rpx 0;
    font-size: 28rpx;
    color: #666;
}

/* 选择器弹窗 */
.picker-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 200;
    display: flex;
    align-items: flex-end;
}

.picker-popup {
    width: 100%;
    background: #1a1a1a;
    border-radius: 40rpx 40rpx 0 0;
    padding: 40rpx 30rpx 60rpx;
}

.picker-header {
    text-align: center;
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
    margin-bottom: 30rpx;
}

.picker-view {
    height: 360rpx;
    background: #1a1a1a;
}

.picker-item {
    line-height: 80rpx;
    text-align: center;
    font-size: 32rpx;
    color: #fff !important;
    background-color: #1a1a1a;
}

.picker-actions {
    display: flex;
    gap: 24rpx;
    margin-top: 30rpx;
}

.picker-btn {
    flex: 1;
    height: 90rpx;
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;

    &.cancel {
        background: #fff;
        color: #333;
    }

    &.confirm {
        background: linear-gradient(270deg, #58B4FF 0%, #C927FF 100%);
        color: #fff;
    }
}
</style>

<style lang="scss">
/* 去除picker-view默认的斑马条纹背景 + 所有选项文字均为白色 */
.picker-item {
    background-color: #1a1a1a !important;
    color: #fff !important;
    // opacity: 1 !important;
}

.picker-view,
.picker-view picker-view-column,
.picker-view uni-picker-view-column {
    color: #fff !important;
    // opacity: 1 !important;
}
</style>
