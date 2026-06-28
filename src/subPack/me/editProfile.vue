<template>
    <view class="page edit-page">
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">编辑资料</text>
        </view>

        <scroll-view class="content" scroll-y>
            <!-- Avatar -->
            <view class="avatar-section">
                <view class="avatar-circle">
                    <text>👤</text>
                </view>
                <text class="change-avatar">更换头像</text>
            </view>

            <!-- Nickname -->
            <view class="form-row">
                <text class="label">昵称</text>
                <view class="value">
                    <input class="inline-input" v-model="profile.nickname" placeholder="请输入昵称" placeholder-style="color:#555" />
                </view>
            </view>

            <!-- Gender -->
            <view class="form-row" @click="showGenderPicker = true">
                <text class="label">性别</text>
                <view class="value">
                    <text>{{ profile.gender || '请选择' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Birthday -->
            <view class="form-row" @click="showBirthdayPicker = true">
                <text class="label">出生年月</text>
                <view class="value">
                    <text>{{ profile.birthday || '请选择' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Height/Weight -->
            <view class="form-row" @click="showHwPicker = true">
                <text class="label">身高/体重</text>
                <view class="value">
                    <text>{{ profile.height }}cm / {{ profile.weight }}kg</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Hotpot Type -->
            <view class="form-row" @click="showHotpotPicker = true">
                <text class="label">喜欢的火锅类型</text>
                <view class="value">
                    <text>{{ profile.hotpotType.join('、') || '请选择' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Taste -->
            <view class="form-row" @click="showTastePicker = true">
                <text class="label">口味偏好</text>
                <view class="value">
                    <text>{{ profile.taste.join('、') || '请选择' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- WeChat -->
            <view class="form-row">
                <text class="label">微信号</text>
                <view class="value">
                    <input class="inline-input" v-model="profile.wechat" placeholder="选填" placeholder-style="color:#555" />
                </view>
            </view>
        </scroll-view>

        <view class="bottom-btn">
            <view class="gradient-btn active_btn" @click="saveProfile">保存</view>
        </view>

        <!-- Pickers (same as setup page, simplified) -->
        <view class="picker-overlay" v-if="showGenderPicker" @click="showGenderPicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">选择性别</text>
                <view class="picker-options">
                    <view v-for="g in ['男','女']" :key="g" class="picker-option" :class="{active:profile.gender===g}" @click="profile.gender=g;showGenderPicker=false">
                        <text>{{g}}</text><text v-if="profile.gender===g" class="check">✓</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="picker-overlay" v-if="showHwPicker" @click="showHwPicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">身高/体重</text>
                <picker-view class="wheel-picker" :value="hwIdx" @change="onHwChange" indicator-style="height:50px">
                    <picker-view-column><view v-for="h in heights" :key="h" class="wheel-item">{{h}}cm</view></picker-view-column>
                    <picker-view-column><view v-for="w in weights" :key="w" class="wheel-item">{{w}}kg</view></picker-view-column>
                </picker-view>
                <view class="picker-confirm" @click="confirmHw">确定</view>
            </view>
        </view>

        <view class="picker-overlay" v-if="showHotpotPicker" @click="showHotpotPicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">火锅类型（可多选）</text>
                <view class="tag-grid">
                    <view v-for="t in hotpotTypeOptions" :key="t" class="tag" :class="{active:profile.hotpotType.includes(t)}" @click="toggleHotpot(t)">{{t}}</view>
                </view>
                <view class="picker-confirm" @click="showHotpotPicker=false">确定</view>
            </view>
        </view>

        <view class="picker-overlay" v-if="showTastePicker" @click="showTastePicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">口味偏好（可多选）</text>
                <view class="tag-grid">
                    <view v-for="t in tasteOptions" :key="t" class="tag" :class="{active:profile.taste.includes(t)}" @click="toggleTaste(t)">{{t}}</view>
                </view>
                <view class="picker-confirm" @click="showTastePicker=false">确定</view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { appState, hotpotTypeOptions, tasteOptions } from '@/utils/store';

const profile = appState.userProfile;
const showGenderPicker = ref(false);
const showBirthdayPicker = ref(false);
const showHwPicker = ref(false);
const showHotpotPicker = ref(false);
const showTastePicker = ref(false);

const heights = Array.from({length:81},(_,i)=>String(140+i));
const weights = Array.from({length:121},(_,i)=>String(30+i));
const hwIdx = ref([30,30]);

function goBack() { uni.navigateBack(); }

function onHwChange(e:any) { hwIdx.value = e.detail.value; }
function confirmHw() {
    profile.height = heights[hwIdx.value[0]];
    profile.weight = weights[hwIdx.value[1]];
    showHwPicker.value = false;
}

function toggleHotpot(t:string) {
    const i = profile.hotpotType.indexOf(t);
    if(i>-1) profile.hotpotType.splice(i,1);
    else profile.hotpotType.push(t);
}

function toggleTaste(t:string) {
    const i = profile.taste.indexOf(t);
    if(i>-1) profile.taste.splice(i,1);
    else profile.taste.push(t);
}

function saveProfile() {
    uni.showToast({title:'保存成功',icon:'success'});
    setTimeout(()=>uni.navigateBack(),1000);
}
</script>

<style lang="scss" scoped>
.edit-page{background:#1A1A1A;height:100vh;display:flex;flex-direction:column;}
.nav-header{display:flex;align-items:center;padding:20rpx 30rpx 30rpx;padding-top:calc(60rpx + var(--status-bar-height,0px));border-bottom:1px solid #2A2A2A;}
.back-btn{width:60rpx;height:60rpx;display:flex;align-items:center;justify-content:center;margin-right:20rpx;}
.back-icon{font-size:48rpx;color:#FFF;}
.nav-title{font-size:34rpx;color:#FFF;font-weight:600;}
.content{flex:1;padding:0 40rpx;padding-bottom:160rpx;overflow-y:auto;}
.avatar-section{display:flex;flex-direction:column;align-items:center;padding:50rpx 0;}
.avatar-circle{width:140rpx;height:140rpx;border-radius:50%;background:linear-gradient(135deg,#FF6B3D,#FF3D3D);display:flex;align-items:center;justify-content:center;font-size:64rpx;margin-bottom:16rpx;}
.change-avatar{font-size:26rpx;color:#FF6B3D;}
.form-row{display:flex;align-items:center;justify-content:space-between;padding:36rpx 0;border-bottom:1px solid #2A2A2A;}
.label{font-size:30rpx;color:#FFF;}
.value{font-size:28rpx;color:#B0B0B0;display:flex;align-items:center;}
.arrow{font-size:36rpx;color:#808080;margin-left:8rpx;}
.inline-input{text-align:right;font-size:28rpx;color:#FFF;flex:1;}
.bottom-btn{position:fixed;left:0;right:0;bottom:0;background:#1A1A1A;padding:30rpx 40rpx;padding-bottom:calc(30rpx + env(safe-area-inset-bottom));z-index:10;}
.picker-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:999;display:flex;align-items:flex-end;}
.picker-panel{width:100%;background:#242424;border-radius:32rpx 32rpx 0 0;padding:40rpx 30rpx;padding-bottom:calc(40rpx + env(safe-area-inset-bottom));}
.picker-title{font-size:32rpx;color:#FFF;font-weight:600;text-align:center;display:block;margin-bottom:30rpx;}
.picker-options{max-height:600rpx;overflow-y:auto;}
.picker-option{display:flex;align-items:center;justify-content:space-between;padding:30rpx 20rpx;border-bottom:1px solid #333;font-size:30rpx;color:#B0B0B0;}
.picker-option.active{color:#FF6B3D;}
.check{color:#FF6B3D;font-weight:700;}
.wheel-picker{width:100%;height:400rpx;margin-bottom:20rpx;}
.wheel-item{display:flex;align-items:center;justify-content:center;font-size:30rpx;color:#FFF;}
.picker-confirm{width:100%;text-align:center;padding:24rpx;background:linear-gradient(135deg,#FF6B3D,#FF3D3D);border-radius:50rpx;color:#FFF;font-size:30rpx;font-weight:600;margin-top:20rpx;}
.tag-grid{display:flex;flex-wrap:wrap;padding:10rpx 0;}
.tag-grid .tag{padding:16rpx 30rpx;margin:10rpx;font-size:28rpx;}
</style>
