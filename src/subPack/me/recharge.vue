<template>
    <view class="page recharge-page">
        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view class="nav-back" @click="goBack">
                    <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
                </view>
                <view class="nav-title">充值</view>
                <text class="nav-right" @click="goHistory">交易明细</text>
            </view>
        </view>

        <!-- 剩余次数卡片 -->
        <view class="count-card">
            <text class="count-number">{{ appState.userProfile.matchCount }}</text>
            <text class="count-label">剩余次数</text>
        </view>

        <!-- 切换选项 -->
        <view class="mode-tabs">
            <view class="mode-tab" :class="{ active: rechargeMode === 'perUse' }" @click="rechargeMode = 'perUse'">
                <text class="mode-title">按次</text>
                <text class="mode-subtitle">1元1次</text>
            </view>
            <view class="mode-tab" :class="{ active: rechargeMode === 'monthly' }" @click="rechargeMode = 'monthly'">
                <text class="mode-title">按月</text>
                <text class="mode-subtitle highlight">有优惠</text>
            </view>
        </view>
        <view class="container-wrap">
            <!-- 金额选项网格 -->
            <view class="amount-grid">
                <view v-for="item in amountOptions" :key="item.value" class="amount-item"
                    :class="{ active: selectedAmount === item.value && !customAmount }"
                    @click="selectAmount(item.value)">
                    <view class="amount-inner">
                        <text class="amount-value">{{ item.value }}</text>
                        <text class="amount-unit">{{ rechargeMode === 'monthly' ? `元/${item.count}次` : '元' }}</text>
                    </view>
                </view>
            </view>

            <!-- 自定义金额输入 -->
            <view v-if="rechargeMode === 'perUse'" class="custom-input-wrap">
                <input class="custom-input" type="digit" placeholder="请输入其他金额"
                    placeholder-class="custom-input-placeholder" v-model="customAmount" @focus="selectedAmount = 0" />
            </view>

            <!-- 协议提醒 -->
            <view class="bottom-section">
                <view class="agreement-row">
                    <view class="radio-wrap" @click="agreed = !agreed">
                        <view class="radio" :class="{ checked: agreed }">
                            <text v-if="agreed" class="radio-check">✓</text>
                        </view>
                    </view>
                    <text class="agreement-text">
                        提醒：未成年人或非完全民事行为能力用户未经监护人同意禁止充值消费，充值代表已阅读并同意
                        <text class="agreement-link" @click="openAgreement">《月最近充值协议》</text>
                    </text>
                </view>

                <!-- 充值按钮 -->
                <view class="bottom-btn-wrap">
                    <view class="recharge-btn" :class="{ disabled: !canRecharge }" @click="handleRecharge">
                        <text class="btn-text">充值（{{ currentAmount }}元）</text>
                    </view>
                </view>
            </view>
        </view>


    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { appState } from '@/utils/store';

// 状态栏高度
const statusBarHeight = ref(0);

const rechargeMode = ref<'perUse' | 'monthly'>('perUse');
const selectedAmount = ref(3);
const customAmount = ref('');
const agreed = ref(false);

interface AmountOption {
    value: number;
    count?: number;
}

const perUseOptions: AmountOption[] = [
    { value: 3 },
    { value: 10 },
    { value: 20 },
    { value: 50 },
    { value: 100 },
    { value: 200 },
];

const monthlyOptions: AmountOption[] = [
    { value: 50, count: 55 },
    { value: 100, count: 120 },
    { value: 200, count: 260 },
];

const amountOptions = computed(() => {
    return rechargeMode.value === 'monthly' ? monthlyOptions : perUseOptions;
});

watch(rechargeMode, () => {
    selectedAmount.value = amountOptions.value[0].value;
    customAmount.value = '';
});

const currentAmount = computed(() => {
    if (customAmount.value && Number(customAmount.value) > 0) {
        return Number(customAmount.value);
    }
    return selectedAmount.value;
});

const canRecharge = computed(() => {
    return agreed.value && currentAmount.value > 0;
});

function selectAmount(value: number) {
    selectedAmount.value = value;
    customAmount.value = '';
}

function goBack() {
    uni.navigateBack();
}

function goHistory() {
    uni.navigateTo({
        url: '/subPack/me/transactionHistory',
    });
}

function openAgreement() {
    uni.showModal({
        title: '月最近充值协议',
        content: '1. 充值金额将转换为对应的使用次数或月度会员时长。\n2. 充值后不支持退款，请确认后充值。\n3. 未成年人请在监护人同意后进行充值。',
        showCancel: false,
    });
}

function handleRecharge() {
    if (!canRecharge.value) return;

    const amount = currentAmount.value;

    uni.showLoading({ title: '支付中' });
    setTimeout(() => {
        uni.hideLoading();

        // 按次模式：1元1次
        if (rechargeMode.value === 'perUse') {
            appState.userProfile.matchCount += amount;
        } else {
            // 按月模式：给更多次数作为优惠
            appState.userProfile.matchCount += Math.floor(amount * 1.2);
        }

        uni.showToast({
            title: '充值成功',
            icon: 'success',
        });

        // 记录交易
        appState.transactions.unshift({
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            type: 'income',
            amount,
            desc: `充值 - ${amount}元${rechargeMode.value === 'monthly' ? '(按月优惠)' : ''}`,
            icon: '💰',
        });
    }, 1500);
}

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
});
</script>

<style lang="scss" scoped>
.recharge-page {
    min-height: 100vh;
    background: #000;
    padding-bottom: 200rpx;
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

    .nav-right {
        position: absolute;
        right: 200rpx;
        font-size: 28rpx;
        color: #fff;
    }
}

.container-wrap {
    padding: 30rpx;
}

/* 剩余次数卡片 */
.count-card {
    margin: 30rpx;
    border-radius: 24rpx;
    padding: 60rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(45deg, rgba(92, 175, 255, 0.2) 0%, rgba(198, 43, 255, 0.2) 100%);
    border-radius: 30rpx 30rpx 30rpx 30rpx;
    border: 2rpx solid;
    margin-bottom: 60rpx;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 24rpx;
        padding: 2rpx;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        pointer-events: none;
    }
}

.count-number {
    font-size: 80rpx;
    color: #fff;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 16rpx;
}

.count-label {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
}

/* 切换选项 */
.mode-tabs {
    display: flex;
    margin-bottom: 30rpx;
    border-radius: 30rpx;
    overflow: hidden;
    background: linear-gradient( 180deg, #444444 0%, rgba(17,17,17,0) 100%);
}

.mode-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 0;
    cursor: pointer;
    border-left: 2rpx solid transparent;
    border-right: 2rpx solid transparent;
    border-top: 2rpx solid transparent;

    &.active {
        border-left-color: rgba(255, 255, 255, 0.8);
        border-right-color: rgba(255, 255, 255, 0.8);
        border-top-color: rgba(255, 255, 255, 0.8); 
        border-radius: 30rpx 30rpx 0 0;
    }
}

.mode-title {
    font-size: 32rpx;
    color: #808080;
    font-weight: 600;
    margin-bottom: 8rpx;
}

.mode-tab.active .mode-title {
    color: #fff;
}

.mode-subtitle {
    font-size: 24rpx;
    color: #808080;
}

.mode-subtitle.highlight {
    color: #ffd700;
}

/* 金额网格 */
.amount-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    margin-bottom: 30rpx;
}

.amount-item {
    aspect-ratio: 1.6;
    display: flex;
    align-items: center;
    justify-content: center;
    // background: #1a1a1a;
    border-radius: 30rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
    position: relative;

    &.active {
        border-color: transparent;
        background: #1a1a1a;
    }

    &.active::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 30rpx;
        padding: 2rpx;
        background: linear-gradient(135deg, #58B4FF, #C927FF);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        pointer-events: none;
    }

    &:active {
        opacity: 0.8;
    }
}

.amount-inner {
    display: flex;
    align-items: flex-end;
}

.amount-value {
    font-size: 40rpx;
    color: #808080;
    font-weight: 600;
}

.amount-unit {
    font-size: 24rpx;
    color: #808080;
    margin-left: 4rpx;
}

.amount-item.active .amount-value,
.amount-item.active .amount-unit {
    color: #fff;
}
.custom-input-wrap {
    margin-bottom: 60rpx;
    margin-top: 60rpx;
}

.custom-input {
    height: 100rpx;
    background: rgba(255, 255, 255, 0.05);
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    border-radius: 50rpx;
    padding: 0 40rpx;
    font-size: 30rpx;
    color: #fff;
    caret-color: #a855c7;
}

.custom-input-placeholder {
    color: #808080;
    font-size: 30rpx;
}

/* 底部区域 */
.bottom-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 40rpx 60rpx;
    background: #000;
    z-index: 10;
}

/* 协议 */
.agreement-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 40rpx;
    gap: 16rpx;
}

.radio-wrap {
    padding-top: 4rpx;
}

.radio {
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    border: 2rpx solid #808080;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.checked {
        background: #a855c7;
        border-color: #a855c7;
    }
}

.radio-check {
    font-size: 20rpx;
    color: #fff;
}

.agreement-text {
    font-size: 23rpx;
    color: #808080;
    line-height: 1.6;
    flex: 1;
}

.agreement-link {
    color: #58B3FF;
}

/* 底部按钮 */
.bottom-btn-wrap {
    padding: 0 10rpx;
}

.recharge-btn {
    height: 100rpx; 
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient( 270deg, #58B4FF 0%, #C927FF 100%);
    border-radius: 152rpx 152rpx 152rpx 152rpx;
    transition: all 0.2s ease;
    color: #fff;

    &:active {
        // opacity: 0.85;
        transform: scale(0.98);
    }

    &.disabled {
        // opacity: 0.5;
        pointer-events: none;
    }
}

.btn-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 600;
}
</style>
