<template>
    <view class="page refund-page">
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">申请退款</text>
        </view>

        <view class="content">
            <!-- Order Info -->
            <view class="dark-card">
                <text class="section-title">订单信息</text>
                <view class="info-row">
                    <text class="info-label">订单编号</text>
                    <text class="info-value">{{ orderId }}</text>
                </view>
                <view class="info-row">
                    <text class="info-label">支付金额</text>
                    <text class="info-value price">¥99.00</text>
                </view>
                <view class="info-row">
                    <text class="info-label">可退金额</text>
                    <text class="info-value price green">¥99.00</text>
                </view>
            </view>

            <!-- Refund Reason -->
            <view class="dark-card">
                <text class="section-title">退款原因</text>
                <view class="reason-list">
                    <view
                        v-for="r in reasons"
                        :key="r"
                        class="reason-item"
                        :class="{ active: selectedReason === r }"
                        @click="selectedReason = r"
                    >
                        <text>{{ r }}</text>
                        <text v-if="selectedReason === r" class="check">✓</text>
                    </view>
                </view>
            </view>

            <!-- Remark -->
            <view class="dark-card">
                <text class="section-title">补充说明</text>
                <textarea
                    class="remark-input"
                    v-model="remark"
                    placeholder="请输入补充说明（选填）"
                    placeholder-style="color:#555"
                    :maxlength="200"
                />
                <text class="char-count">{{ remark.length }}/200</text>
            </view>

            <!-- Refund Info -->
            <view class="dark-card refund-info-card">
                <text class="info-title">退款说明</text>
                <text class="info-text">1. 匹配成功后24小时内可申请退款</text>
                <text class="info-text">2. 退款将在1-3个工作日内原路返回</text>
                <text class="info-text">3. 已使用的服务费用不予退还</text>
            </view>

            <!-- Submit -->
            <view class="gradient-btn active_btn" :class="{ disabled: !selectedReason }" @click="submitRefund">
                提交申请
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { wxPayRefund } from '@/api/api';

const orderId = ref('');
const selectedReason = ref('');
const remark = ref('');

const reasons = [
    '匹配用户不合适',
    '临时有事无法赴约',
    '重复下单',
    '不想去了',
    '其他原因',
];

onLoad((options: any) => {
    if (options.id) orderId.value = decodeURIComponent(options.id);
});

function goBack() { uni.navigateBack(); }

async function submitRefund() {
    if (!selectedReason.value) return;
    uni.showLoading({ title: '提交中...' });
    try {
        // 退款原因：选中原因 + 补充说明（选填）
        const refundReason = remark.value
            ? `${selectedReason.value}：${remark.value}`
            : selectedReason.value;
        await wxPayRefund({ orderId: orderId.value, refundReason });
        uni.hideLoading();
        uni.showToast({ title: '退款申请已提交', icon: 'success' });
        setTimeout(() => {
            uni.navigateBack({ delta: 2 });
        }, 1500);
    } catch (e) {
        uni.hideLoading();
        console.error('[refund] 申请退款失败', e);
    }
}
</script>

<style lang="scss" scoped>
.refund-page{background:#1A1A1A;min-height:100vh;}
.nav-header{display:flex;align-items:center;padding:20rpx 30rpx 30rpx;padding-top:calc(60rpx + var(--status-bar-height,0px));}
.back-btn{width:60rpx;height:60rpx;display:flex;align-items:center;justify-content:center;margin-right:20rpx;}
.back-icon{font-size:48rpx;color:#FFF;}
.nav-title{font-size:34rpx;color:#FFF;font-weight:600;}
.content{padding:0 30rpx;}
.dark-card{margin:0 0 20rpx 0;}
.section-title{font-size:28rpx;color:#808080;margin-bottom:16rpx;display:block;}
.info-row{display:flex;justify-content:space-between;padding:14rpx 0;}
.info-label{font-size:26rpx;color:#808080;}
.info-value{font-size:26rpx;color:#FFF;}
.info-value.price{font-weight:600;}
.info-value.green{color:#4CD964;}
.reason-list{display:flex;flex-direction:column;}
.reason-item{display:flex;align-items:center;justify-content:space-between;padding:24rpx 0;border-bottom:1px solid #2A2A2A;font-size:28rpx;color:#B0B0B0;}
.reason-item:last-child{border-bottom:none;}
.reason-item.active{color:#FF6B3D;}
.check{color:#FF6B3D;font-weight:700;}
.remark-input{width:100%;height:160rpx;background:#333;border-radius:12rpx;padding:20rpx;font-size:26rpx;color:#FFF;box-sizing:border-box;}
.char-count{text-align:right;font-size:22rpx;color:#808080;display:block;margin-top:10rpx;}
.refund-info-card{padding-bottom:20rpx;}
.info-title{font-size:26rpx;color:#B0B0B0;display:block;margin-bottom:12rpx;}
.info-text{font-size:24rpx;color:#808080;line-height:2;display:block;}
.gradient-btn{margin-top:20rpx;margin-bottom:40rpx;}
</style>
