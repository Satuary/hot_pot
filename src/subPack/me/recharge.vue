<template>
    <view class="page recharge-page">
        <!-- 背景图 -->
        <image class="page-bg" src="/static/imgs/index_bg.png" mode="aspectFill"></image>

        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view class="nav-back" @click="goBack">
                    <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
                </view>
                <view class="nav-title">充值</view> 
            </view>
        </view>

        <!-- 剩余次数卡片 -->
        <view class="count-card">
            <view style="display: flex;flex-direction: column;justify-content: center;align-items: center;">
                <view class="count-number">{{ appState.userProfile.matchCount }}</view>
                <view class="count-label">剩余次数</view>
            </view> 
            <view class="nav-right-btn">
                 <text class="nav-right" @click="goHistory">交易明细</text>
            </view>
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
                <view v-for="item in amountOptions" :key="item.id" class="amount-item"
                    :class="{ active: selectedId === item.id && !customAmount }"
                    @click="selectAmount(item.id)">
                    <view class="amount-inner">
                        <text class="amount-value">{{ item.price }}</text>
                        <text class="amount-unit">{{ rechargeMode === 'monthly' ? `元/${item.times}次` : '元' }}</text>
                    </view>
                </view>
            </view>

            <!-- 自定义金额输入 -->
            <view v-if="rechargeMode === 'perUse'" class="custom-input-wrap">
                <input class="custom-input" type="digit" placeholder="请输入其他金额"
                    placeholder-class="custom-input-placeholder" v-model="customAmount" @focus="selectedId = null" />
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
                    <view class="recharge-btn" @click="handleRecharge">
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
import { getPackageList, wxUnifiedOrder, type PackageItem } from '@/api/api';

// 状态栏高度
const statusBarHeight = ref(0);

const rechargeMode = ref<'perUse' | 'monthly'>('perUse');
const selectedId = ref<number | null>(null);
const customAmount = ref('');
const agreed = ref(false);

// 套餐列表（接口返回，按次 / 按月分组）
const perUseOptions = ref<PackageItem[]>([]);
const monthlyOptions = ref<PackageItem[]>([]);
const loading = ref(false);

const amountOptions = computed(() => {
    return rechargeMode.value === 'monthly' ? monthlyOptions.value : perUseOptions.value;
});

// 当前选中的套餐
const selectedPackage = computed(() => {
    return amountOptions.value.find((p) => p.id === selectedId.value) || null;
});

watch(rechargeMode, () => {
    selectedId.value = amountOptions.value[0]?.id ?? null;
    customAmount.value = '';
    // 打印当前选中的套餐数据（调试用）
    console.log('[recharge] 当前选中套餐 =', selectedPackage.value);
});

const currentAmount = computed(() => {
    if (customAmount.value && Number(customAmount.value) > 0) {
        return Number(customAmount.value);
    }
    return selectedPackage.value ? selectedPackage.value.price : 0;
});

const canRecharge = computed(() => {
    return agreed.value && currentAmount.value > 0;
});

function selectAmount(id: number) {
    selectedId.value = id;
    customAmount.value = '';
    // 打印当前选中的套餐数据（调试用）
    console.log('[recharge] 当前选中套餐 =', selectedPackage.value);
}

// 加载套餐列表
// 按次取 perPackages，按月取 monthlyPackages
// 默认选中当前模式下的第一个套餐
async function loadPackages() {
    loading.value = true;
    try {
        const res = await getPackageList();
        perUseOptions.value = res?.perPackages ?? [];
        monthlyOptions.value = res?.monthlyPackages ?? [];
        // 打印加载的套餐数据（调试用）
        console.log('[recharge] 加载的套餐列表 =', res);
        // 默认选中当前模式下的第一个套餐
        selectedId.value = amountOptions.value[0]?.id ?? null;
    } catch (e) {
        console.error('[recharge] 获取套餐列表失败', e);
    } finally {
        loading.value = false;
    }
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

async function handleRecharge() {
    console.log('[recharge] 处理充值', selectedPackage.value, currentAmount.value);
    // 未勾选协议时提示
    if (!agreed.value) {
        uni.showToast({
            title: '请先阅读并同意充值协议',
            icon: 'none',
        });
        return;
    }
    if (currentAmount.value <= 0) return;

    // 统一下单需要套餐 id；自定义金额未选中套餐时提示选择
    if (!selectedPackage.value) {
        uni.showToast({
            title: '请选择充值套餐',
            icon: 'none',
        });
        return;
    }

    const pkg = selectedPackage.value;
    const amount = currentAmount.value;

    uni.showLoading({ title: '支付中', mask: true });
    try {
        // 1. 生成微信预支付订单（仅传套餐 id）
        const prepay = await wxUnifiedOrder({
            packageId: pkg.id,
        });
        console.log('[recharge] 统一下单返回 =', prepay);

        // 2. 拉起微信支付
        await new Promise<void>((resolve, reject) => {
            uni.requestPayment({
                provider: 'wxpay',
                // orderInfo 为 App 支付所需，小程序支付不使用，此处占位以满足类型定义
                orderInfo: '',
                timeStamp: prepay.timeStamp,
                nonceStr: prepay.nonceStr,
                package: prepay.package,
                signType: prepay.signType || 'RSA',
                paySign: prepay.paySign,
                success: () => resolve(),
                fail: (err) => reject(err),
            });
        });

        uni.hideLoading();
        uni.showToast({ title: '充值成功', icon: 'success' });

        // 3. 本地更新次数与交易记录
        appState.userProfile.matchCount += pkg.times;
        appState.transactions.unshift({
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            type: 'income',
            amount,
            desc: `充值 - ${amount}元${rechargeMode.value === 'monthly' ? '(按月优惠)' : ''}`,
            icon: '💰',
        });
    } catch (e: any) {
        uni.hideLoading();
        console.error('[recharge] 支付失败', e);
        // 用户主动取消支付不提示错误
        const isCancel = e?.errMsg && String(e.errMsg).includes('cancel');
        if (!isCancel) {
            uni.showToast({ title: '支付失败', icon: 'none' });
        }
    }
}

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
    loadPackages();
});
</script>

<style lang="scss" scoped>
.recharge-page {
    min-height: 100vh;
    background: #000;
    padding-bottom: 200rpx;
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

    .nav-right {
        position: absolute;
        right: 200rpx;
        font-size: 23rpx;
        color: #fff;
        font-weight: normal;
        
    }
}

.container-wrap {
    padding: 30rpx;
    position: relative;
    z-index: 1;
}

/* 剩余次数卡片 */
.count-card {
    margin: 30rpx;
    border-radius: 24rpx;
    padding: 60rpx 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: relative;
    z-index: 1;
    overflow: hidden;
    background: linear-gradient(45deg, rgba(92, 175, 255, 0.2) 0%, rgba(198, 43, 255, 0.2) 100%);
    border-radius: 30rpx 30rpx 30rpx 30rpx;
    border: 2rpx solid;
    margin-bottom: 60rpx;
    .nav-right-btn{
        border: 2rpx solid #554562;
        border-radius: 30rpx;
        padding: 10rpx 30rpx;
        background: rgba(56, 40, 69,0.5);
    }

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
    position: relative;
    z-index: 1;
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
