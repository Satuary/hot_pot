<template>
    <view class="page order-list-page">
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">查看订单</text>
        </view>

        <scroll-view class="content" scroll-y>
            <view v-if="orders.length === 0" class="empty-state">
                <text class="empty-icon">📋</text>
                <text class="empty-text">暂无订单</text>
            </view>

            <view v-for="order in orders" :key="order.id" class="order-item dark-card" @click="viewDetail(order)">
                <view class="order-header">
                    <text class="order-status" :class="order.status">{{ order.statusText }}</text>
                    <text class="order-no">#{{ order.id }}</text>
                </view>
                <view class="order-body">
                    <text class="order-store">{{ order.requirement.store || '未指定店铺' }}</text>
                    <text class="order-time">{{ order.requirement.time }}</text>
                </view>
                <view class="order-footer">
                    <text class="order-amount">¥{{ order.amount.toFixed(2) }}</text>
                    <text class="order-date">{{ order.createTime }}</text>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MatchOrder } from '@/utils/store';

const orders = ref<MatchOrder[]>([
    {
        id:'20230628001',status:'matched',statusText:'已匹配',
        createTime:'2023-06-28 14:30',
        requirement:{gender:'女',ageMin:'20',ageMax:'30',hotpotType:['重庆火锅'],taste:['麻辣'],motivation:'吃货交友',store:'海底捞(闵行店)',storeAddress:'闵行区都市路5001号',time:'今晚 19:00',payment:'AA'},
        amount:99.00,
    },
    {
        id:'20230627002',status:'completed',statusText:'已完成',
        createTime:'2023-06-27 18:00',
        requirement:{gender:'男',ageMin:'25',ageMax:'35',hotpotType:['成都火锅'],taste:['清汤'],motivation:'解馋',store:'小龙坎(七宝店)',storeAddress:'',time:'昨天 19:30',payment:'AA'},
        amount:128.00,
    },
]);

function goBack() { uni.navigateBack(); }

function viewDetail(order: MatchOrder) {
    uni.navigateTo({ url: '/subPack/me/orderDetail?id=' + order.id });
}
</script>

<style lang="scss" scoped>
.order-list-page{background:#1A1A1A;min-height:100vh;}
.nav-header{display:flex;align-items:center;padding:20rpx 30rpx 30rpx;padding-top:calc(60rpx + var(--status-bar-height,0px));}
.back-btn{width:60rpx;height:60rpx;display:flex;align-items:center;justify-content:center;margin-right:20rpx;}
.back-icon{font-size:48rpx;color:#FFF;}
.nav-title{font-size:34rpx;color:#FFF;font-weight:600;}
.content{flex:1;padding:0 30rpx;}
.empty-state{display:flex;flex-direction:column;align-items:center;padding:200rpx 0;}
.empty-icon{font-size:80rpx;margin-bottom:20rpx;}
.empty-text{font-size:28rpx;color:#808080;}
.order-item{margin:0 0 20rpx 0;}
.order-header{display:flex;justify-content:space-between;margin-bottom:16rpx;}
.order-status{font-size:22rpx;padding:4rpx 14rpx;border-radius:8rpx;}
.order-status.matched{color:#FF6B3D;background:rgba(255,107,61,.15);}
.order-status.completed{color:#4CD964;background:rgba(76,217,100,.15);}
.order-no{font-size:24rpx;color:#808080;}
.order-body{margin-bottom:16rpx;}
.order-store{font-size:28rpx;color:#FFF;display:block;margin-bottom:8rpx;}
.order-time{font-size:24rpx;color:#B0B0B0;display:block;}
.order-footer{display:flex;justify-content:space-between;border-top:1px solid #2A2A2A;padding-top:16rpx;}
.order-amount{font-size:30rpx;color:#FF6B3D;font-weight:600;}
.order-date{font-size:24rpx;color:#808080;}
</style>
