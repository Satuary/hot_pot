<template>
    <view class="page order-page">
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">订单详情</text>
        </view>

        <scroll-view class="content" scroll-y>
            <!-- Status Card -->
            <view class="status-card dark-card">
                <view class="status-row">
                    <text class="status-badge" :class="order.status">{{ order.statusText }}</text>
                    <text class="order-no">订单号：{{ order.id }}</text>
                </view>
                <text class="order-time">创建时间：{{ order.createTime }}</text>
            </view>

            <!-- Matched User -->
            <view class="dark-card user-card" v-if="order.matchedUser">
                <text class="section-title">匹配用户</text>
                <view class="user-row">
                    <view class="user-avatar"><text>👤</text></view>
                    <view class="user-info">
                        <text class="user-name">{{ order.matchedUser.nickname }}</text>
                        <text class="user-meta">{{ order.matchedUser.gender }} · {{ order.matchedUser.height }}cm</text>
                    </view>
                </view>
            </view>

            <!-- Requirement Details -->
            <view class="dark-card">
                <text class="section-title">需求详情</text>
                <view class="detail-row">
                    <text class="detail-label">性别要求</text>
                    <text class="detail-value">{{ order.requirement.gender }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">年龄范围</text>
                    <text class="detail-value">{{ order.requirement.ageMin }}-{{ order.requirement.ageMax }}岁</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">火锅类型</text>
                    <text class="detail-value">{{ order.requirement.hotpotType.join('、') || '不限' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">口味偏好</text>
                    <text class="detail-value">{{ order.requirement.taste.join('、') || '不限' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">选择店铺</text>
                    <text class="detail-value">{{ order.requirement.store }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">约锅时间</text>
                    <text class="detail-value">{{ order.requirement.time }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">付款方式</text>
                    <text class="detail-value">{{ order.requirement.payment }}</text>
                </view>
            </view>

            <!-- Amount -->
            <view class="dark-card amount-card">
                <text class="amount-label">支付金额</text>
                <text class="amount-value">¥{{ order.amount.toFixed(2) }}</text>
            </view>

            <!-- Actions -->
            <view class="action-section" v-if="order.status === 'matched'">
                <view class="gradient-btn active_btn" @click="contactUser">联系对方</view>
                <view class="cancel-btn" @click="cancelOrder">取消订单</view>
            </view>
            <view class="action-section" v-if="order.status === 'completed' && !order.refundStatus">
                <view class="outline-btn" @click="goRefund">申请退款</view>
            </view>
            <view class="action-section" v-if="order.refundStatus === 'pending'">
                <text class="refund-info">退款申请处理中，请耐心等待...</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type { MatchOrder } from '@/utils/store';

const order = reactive<MatchOrder>({
    id: '20230628001',
    status: 'matched',
    statusText: '已匹配',
    createTime: '2023-06-28 14:30',
    requirement: {
        gender: '女', ageMin: '20', ageMax: '30',
        hotpotType: ['重庆火锅'], taste: ['麻辣'],
        motivation: '吃货交友', store: '海底捞(闵行店)',
        storeAddress: '闵行区都市路5001号',
        time: '今晚 19:00', payment: 'AA',
    },
    matchedUser: {
        id: 'u1', phone:'138****0001', nickname:'火锅小公主',
        gender:'女', birthday:'1998-06', height:'165', weight:'50',
        hotpotType:['重庆火锅'], taste:['麻辣'],
        motivation:'想找人一起吃', wechat:'hotpot_lover',
        avatar:'', balance:0, matchCount:5,
    },
    amount: 99.00,
});

function goBack() { uni.navigateBack(); }

function contactUser() {
    uni.showToast({title:'已发送联系请求',icon:'success'});
}

function cancelOrder() {
    uni.showModal({
        title:'确认取消',
        content:'确定取消此订单吗？',
        success: (res) => {
            if(res.confirm) { order.status = 'cancelled'; order.statusText = '已取消'; }
        },
    });
}

function goRefund() {
    uni.navigateTo({ url:'/subPack/me/refund?id=' + order.id });
}
</script>

<style lang="scss" scoped>
.order-page{background:#1A1A1A;min-height:100vh;display:flex;flex-direction:column;}
.nav-header{display:flex;align-items:center;padding:20rpx 30rpx 30rpx;padding-top:calc(60rpx + var(--status-bar-height,0px));}
.back-btn{width:60rpx;height:60rpx;display:flex;align-items:center;justify-content:center;margin-right:20rpx;}
.back-icon{font-size:48rpx;color:#FFF;}
.nav-title{font-size:34rpx;color:#FFF;font-weight:600;}
.content{flex:1;padding:0 30rpx;}
.dark-card{margin:0 0 20rpx 0;}
.status-card{margin-top:10rpx;}
.status-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12rpx;}
.status-badge{font-size:24rpx;padding:6rpx 16rpx;border-radius:8rpx;}
.status-badge.matched{color:#FF6B3D;background:rgba(255,107,61,.15);}
.status-badge.completed{color:#4CD964;background:rgba(76,217,100,.15);}
.status-badge.cancelled{color:#808080;background:rgba(128,128,128,.15);}
.order-no{font-size:24rpx;color:#808080;}
.order-time{font-size:24rpx;color:#808080;display:block;}
.section-title{font-size:28rpx;color:#808080;margin-bottom:16rpx;display:block;}
.user-row{display:flex;align-items:center;}
.user-avatar{width:80rpx;height:80rpx;border-radius:50%;background:#333;display:flex;align-items:center;justify-content:center;margin-right:20rpx;font-size:36rpx;}
.user-name{font-size:28rpx;color:#FFF;display:block;}
.user-meta{font-size:24rpx;color:#808080;margin-top:4rpx;display:block;}
.detail-row{display:flex;justify-content:space-between;padding:14rpx 0;border-bottom:1px solid #2A2A2A;}
.detail-row:last-child{border-bottom:none;}
.detail-label{font-size:26rpx;color:#808080;}
.detail-value{font-size:26rpx;color:#FFF;}
.amount-card{text-align:center;padding:40rpx;}
.amount-label{font-size:26rpx;color:#808080;display:block;margin-bottom:12rpx;}
.amount-value{font-size:48rpx;color:#FFD700;font-weight:700;}
.action-section{padding:20rpx 0 40rpx;}
.cancel-btn{text-align:center;padding:24rpx;color:#FF3B30;font-size:28rpx;margin-top:20rpx;}
.outline-btn{text-align:center;padding:24rpx;border:2rpx solid #4A4A4A;border-radius:50rpx;color:#B0B0B0;font-size:28rpx;}
.refund-info{text-align:center;color:#FF9500;font-size:26rpx;display:block;padding:20rpx 0;}
</style>
