<template>
    <view class="page recharge-page">
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">充值</text>
        </view>

        <view class="content">
            <!-- Balance Display -->
            <view class="balance-display">
                <text class="balance-label">当前余额</text>
                <text class="balance-amount">¥ {{ appState.userProfile.balance.toFixed(2) }}</text>
            </view>

            <!-- Recharge Packages -->
            <text class="section-title">选择充值金额</text>
            <view class="package-grid">
                <view
                    v-for="pkg in packages"
                    :key="pkg.id"
                    class="package-item dark-card"
                    :class="{ active: selectedPackage === pkg.id }"
                    @click="selectedPackage = pkg.id"
                >
                    <text class="package-amount">¥{{ pkg.amount }}</text>
                    <text class="package-bonus" v-if="pkg.bonus">送 ¥{{ pkg.bonus }}</text>
                    <text class="package-popular" v-if="pkg.popular">热门</text>
                </view>
            </view>

            <!-- Payment Methods -->
            <text class="section-title">支付方式</text>
            <view class="payment-methods">
                <view
                    v-for="pm in paymentMethods"
                    :key="pm.id"
                    class="payment-item dark-card"
                    :class="{ active: selectedPayment === pm.id }"
                    @click="selectedPayment = pm.id"
                >
                    <text class="pm-icon">{{ pm.icon }}</text>
                    <text class="pm-name">{{ pm.name }}</text>
                    <view class="pm-radio" :class="{ checked: selectedPayment === pm.id }">
                        <text v-if="selectedPayment === pm.id">✓</text>
                    </view>
                </view>
            </view>

            <!-- Pay Button -->
            <view class="gradient-btn active_btn" :class="{ disabled: !selectedPackage }" @click="handlePay">
                确认支付
            </view>

            <!-- Agreement -->
            <text class="agreement">支付即表示同意《充值协议》</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { appState } from '@/utils/store';

const selectedPackage = ref(1);
const selectedPayment = ref('wechat');

const packages = [
    { id: 1, amount: 99, bonus: 10, popular: false },
    { id: 2, amount: 199, bonus: 30, popular: true },
    { id: 3, amount: 499, bonus: 100, popular: false },
    { id: 4, amount: 999, bonus: 300, popular: false },
];

const paymentMethods = [
    { id: 'wechat', name: '微信支付', icon: '💚' },
    { id: 'alipay', name: '支付宝', icon: '💙' },
];

function goBack() { uni.navigateBack(); }

function handlePay() {
    uni.showLoading({ title: '支付中...' });
    setTimeout(() => {
        uni.hideLoading();
        const pkg = packages.find(p => p.id === selectedPackage.value);
        if (pkg) {
            appState.userProfile.balance += pkg.amount + (pkg.bonus || 0);
            uni.showToast({ title: '充值成功！', icon: 'success' });
            setTimeout(() => uni.navigateBack(), 1500);
        }
    }, 2000);
}
</script>

<style lang="scss" scoped>
.recharge-page{background:#1A1A1A;min-height:100vh;}
.nav-header{display:flex;align-items:center;padding:20rpx 30rpx 30rpx;padding-top:calc(60rpx + var(--status-bar-height,0px));}
.back-btn{width:60rpx;height:60rpx;display:flex;align-items:center;justify-content:center;margin-right:20rpx;}
.back-icon{font-size:48rpx;color:#FFF;}
.nav-title{font-size:34rpx;color:#FFF;font-weight:600;}
.content{padding:0 30rpx;}
.balance-display{text-align:center;padding:60rpx 0;background:#242424;border-radius:24rpx;margin-bottom:30rpx;}
.balance-label{font-size:26rpx;color:#808080;display:block;margin-bottom:12rpx;}
.balance-amount{font-size:64rpx;color:#FFD700;font-weight:700;}
.section-title{font-size:28rpx;color:#B0B0B0;margin-bottom:20rpx;display:block;}
.package-grid{display:grid;grid-template-columns:1fr 1fr;gap:16rpx;margin-bottom:30rpx;}
.package-item{margin:0;text-align:center;padding:30rpx 20rpx;position:relative;border:2rpx solid transparent;}
.package-item.active{border-color:#FF6B3D;background:rgba(255,107,61,0.05);}
.package-amount{font-size:36rpx;color:#FFF;font-weight:700;display:block;}
.package-bonus{font-size:22rpx;color:#FF6B3D;display:block;margin-top:8rpx;}
.package-popular{position:absolute;top:-8rpx;right:-8rpx;background:#FF3D3D;color:#FFF;font-size:20rpx;padding:4rpx 12rpx;border-radius:20rpx;}
.payment-methods{margin-bottom:40rpx;display:flex;flex-direction:column;gap:16rpx;}
.payment-item{margin:0;display:flex;align-items:center;padding:24rpx;}
.pm-icon{font-size:36rpx;margin-right:20rpx;}
.pm-name{flex:1;font-size:28rpx;color:#FFF;}
.pm-radio{width:40rpx;height:40rpx;border-radius:50%;border:2rpx solid #555;display:flex;align-items:center;justify-content:center;font-size:24rpx;color:#FFF;}
.pm-radio.checked{background:#FF6B3D;border-color:#FF6B3D;}
.agreement{text-align:center;font-size:24rpx;color:#808080;padding:20rpx 0 40rpx;display:block;}
</style>
