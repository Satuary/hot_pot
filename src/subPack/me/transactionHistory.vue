<template>
    <view class="page history-page">
        <!-- 背景图 -->
        <image class="page-bg" src="/static/imgs/index_bg.png" mode="aspectFill"></image>

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
                    <view v-if="!usageList.length" class="empty-tip">{{ usageLoading ? '加载中...' : '暂无使用明细' }}</view>
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
                        <view v-for="item in group.items" :key="item.id" class="list-item" @click="goToDetail(item)">
                            <text class="item-title">{{ item.desc }}</text>
                            <view class="item-right">
                                <text class="amount">{{ item.amountText }}</text>
                                <text class="item-time">{{ item.time }}</text>
                            </view>
                        </view>
                    </view>
                    <view v-if="!transactionGroups.length" class="empty-tip">{{ loading ? '加载中...' : '暂无交易记录' }}</view>
                </view>
            </scroll-view>
        </view>

        <!-- 时间选择器弹窗 -->
        <view v-if="showPicker" class="mask" @click="closePicker">
            <view class="picker-modal" @click.stop>
                <view class="picker-modal-title">选择时间</view>
                <view class="picker-body">
                    <picker-view
                        class="picker-view"
                        :value="pickerValue"
                        @change="onPickerChange"
                        indicator-style="height: 88rpx;"
                        mask-style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)), linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)); background-position: top, bottom;"
                    >
                        <picker-view-column>
                            <view v-for="year in yearRange" :key="year" class="picker-view-item">{{ year }}年</view>
                        </picker-view-column>
                        <picker-view-column>
                            <view v-for="month in monthRange" :key="month" class="picker-view-item">{{ month }}月</view>
                        </picker-view-column>
                    </picker-view>
                </view>
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
import { getWxPayOrderList, getMatchUsageList, type WxPayOrderItem, type MatchUsageItem } from '@/api/api';

const statusBarHeight = ref(0);
const activeTab = ref<'usage' | 'transaction'>('transaction');

// 使用明细接口数据
const usageRaw = ref<MatchUsageItem[]>([]);
const usageLoading = ref(false);

// 将后端使用记录转换为页面展示所需结构
function normalizeUsage(u: MatchUsageItem, index: number) {
    const rawTime = u.createTime || '';
    const count = typeof u.count === 'number' ? u.count : Number(u.count) || 1;
    return {
        id: u.id != null ? String(u.id) : `u${index}`,
        title: u.remark || `匹配消耗${count}次`,
        time: rawTime ? rawTime.replace(/-/g, '.').slice(0, 16) : '',
    };
}

const usageList = computed(() => usageRaw.value.map(normalizeUsage));

// 加载使用明细列表
async function loadUsage() {
    usageLoading.value = true;
    try {
        const res = await getMatchUsageList({ pageNum: 1, pageSize: 100 });
        // 兼容分页结构（records）与直接返回数组两种形式
        usageRaw.value = Array.isArray(res) ? res : res?.rows ?? [];
        console.log('[transactionHistory] 使用明细列表 =', res);
    } catch (e) {
        console.error('[transactionHistory] 获取使用明细失败', e);
        usageRaw.value = [];
    } finally {
        usageLoading.value = false;
    }
}

// 交易记录接口数据
const orderList = ref<WxPayOrderItem[]>([]);
const loading = ref(false);

// 将后端订单转换为页面展示所需结构
function normalizeOrder(o: WxPayOrderItem) {
    const rawTime = o.payTime || o.createTime || '';
    // 日期部分（yyyy-MM-dd），用于分组和筛选
    const date = rawTime ? rawTime.slice(0, 10) : '';
    // 展示时间：yyyy.MM.dd HH:mm
    const time = rawTime ? rawTime.replace(/-/g, '.').slice(0, 16) : '';
    const amount = typeof o.price === 'number' ? o.price : Number(o.price) || 0;
    // 订单类别：1=充值
    const desc = o.orderCategory === 1 ? '按次充值' : (o.remark || '充值');
    return {
        id: o.orderId || (o.relationId != null ? String(o.relationId) : Date.now().toString()),
        date,
        time,
        desc,
        amountText: amount ? `${amount}元` : '',
        amount,
    };
}

const rawTransactions = computed(() => orderList.value.map(normalizeOrder));

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.getMonth() + 1);

const transactionGroups = computed(() => {
    const filtered = rawTransactions.value.filter((t) => {
        if (!t.date) return false;
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

// 加载交易记录列表
async function loadOrders() {
    loading.value = true;
    try {
        const res = await getWxPayOrderList({ pageNum: 1, pageSize: 100 });
        // 列表在 rows 字段；兼容直接返回数组的形式
        orderList.value = Array.isArray(res) ? res : res?.rows ?? [];
        console.log('[transactionHistory] 交易记录列表 =', res);
    } catch (e) {
        console.error('[transactionHistory] 获取交易记录失败', e);
        orderList.value = [];
    } finally {
        loading.value = false;
    }
}

// 时间选择器
const showPicker = ref(false);
const yearRange = Array.from({ length: 50 }, (_, i) => 2000 + i);
const monthRange = Array.from({ length: 12 }, (_, i) => i + 1);
const pickerValue = ref([selectedYear.value - 2000, selectedMonth.value - 1]);
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

function goToDetail(item: any) {
    uni.navigateTo({
        url: `/subPack/me/orderDetail?id=${encodeURIComponent(item.id)}&desc=${encodeURIComponent(item.desc)}&amount=${item.amount}&time=${encodeURIComponent(item.time)}`,
    });
}

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
    loadUsage();
    loadOrders();
});
</script>

<style lang="scss" scoped>
.history-page {
    min-height: 100vh;
    background: #000;
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

/* 导航栏 */
.nav-bar {
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
}

/* 主体卡片 */
.main-card {
    margin: 20rpx 30rpx 30rpx;
    border-radius: 30rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    // background: rgba(255, 255, 255, 0.03);
    background: #000;
    overflow: hidden;
    position: relative;
    z-index: 1;
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

.item-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.amount {
    color: #4cd964;
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

/* 弹窗遮罩 */
.mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 200;
    display: flex;
    align-items: flex-end;
}

/* 选择器弹窗 - 底部弹出 */
.picker-modal {
    width: 100%;
    background: #000;
    border-radius: 32rpx 32rpx 0 0;
    border-top: 1rpx solid rgba(255, 255, 255, 0.3);
    padding: 40rpx 32rpx;
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom));

    .picker-modal-title {
        font-size: 30rpx;
        color: #999999;
        text-align: center;
        padding-bottom: 24rpx;
        font-weight: 400;
    }

    .picker-body {
        height: 440rpx;
        overflow: hidden;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 100%);
        border-radius: 24rpx;
    }

    .picker-view {
        width: 100%;
        height: 100%;
    }

    .picker-view-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: #ffffff;
        height: 88rpx;
    }

    .picker-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 24rpx;
        gap: 24rpx;

        .picker-btn {
            flex: 1;
            height: 76rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 152rpx;
            font-size: 30rpx;
            font-weight: 400;

            &.cancel {
                background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
                border: 1rpx solid #ffffff;
                color: #ffffff;
            }

            &.confirm {
                background: linear-gradient(270deg, #58B4FF 0%, #C927FF 100%);
                color: #ffffff;
            }
        }
    }
}
</style>

<style lang="scss">
/* 去除picker-view默认的斑马条纹背景 + 所有选项文字均为白色 */
.picker-view-item {
    background-color: #000 !important;
    color: #fff !important;
    line-height: 88rpx;
    font-weight: 500;
}

.picker-view,
.picker-view picker-view-column,
.picker-view uni-picker-view-column {
    color: #fff !important;
}
</style>
