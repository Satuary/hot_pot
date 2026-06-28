<template>
    <view class="page post-page">
        <!-- Header -->
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">发布需求</text>
        </view>

        <scroll-view class="content" scroll-y>
            <!-- Gender -->
            <view class="form-row" @click="showGenderPicker = true">
                <text class="label">性别要求</text>
                <view class="value">
                    <text>{{ req.gender }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Age Range -->
            <view class="form-row" @click="showAgePicker = true">
                <text class="label">年龄范围</text>
                <view class="value">
                    <text>{{ req.ageMin }}-{{ req.ageMax }}岁</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Hot Pot Type -->
            <view class="form-row" @click="showHotpotPicker = true">
                <text class="label">火锅类型</text>
                <view class="value">
                    <text>{{ req.hotpotType.join('、') || '不限' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Taste -->
            <view class="form-row" @click="showTastePicker = true">
                <text class="label">口味偏好</text>
                <view class="value">
                    <text>{{ req.taste.join('、') || '不限' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Motivation -->
            <view class="form-row" @click="showMotivationPicker = true">
                <text class="label">约锅动机</text>
                <view class="value">
                    <text>{{ req.motivation || '不限' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Store Selection -->
            <view class="form-row" @click="goStoreSelection">
                <text class="label">选择店铺</text>
                <view class="value">
                    <text>{{ req.store || '请选择' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Time -->
            <view class="form-row" @click="showTimePicker = true">
                <text class="label">约锅时间</text>
                <view class="value">
                    <text>{{ req.time || '请选择' }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>

            <!-- Payment -->
            <view class="form-row" @click="showPaymentPicker = true">
                <text class="label">付款方式</text>
                <view class="value">
                    <text>{{ req.payment }}</text>
                    <text class="arrow">›</text>
                </view>
            </view>
        </scroll-view>

        <!-- Submit -->
        <view class="bottom-area">
            <view class="gradient-btn active_btn" @click="submitRequirement">
                发布需求
            </view>
        </view>

        <!-- Gender Picker -->
        <view class="picker-overlay" v-if="showGenderPicker" @click="showGenderPicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">选择性别</text>
                <view class="picker-options">
                    <view
                        v-for="g in ['男', '女', '不限']"
                        :key="g"
                        class="picker-option"
                        :class="{ active: req.gender === g }"
                        @click="req.gender = g; showGenderPicker = false"
                    >
                        <text>{{ g }}</text>
                        <text v-if="req.gender === g" class="check">✓</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- Age Range Picker -->
        <view class="picker-overlay" v-if="showAgePicker" @click="showAgePicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">选择年龄范围</text>
                <picker-view
                    class="wheel-picker"
                    :value="ageIndex"
                    @change="onAgeChange"
                    indicator-style="height: 50px;"
                >
                    <picker-view-column>
                        <view v-for="a in ages" :key="a" class="wheel-item">{{ a }}岁</view>
                    </picker-view-column>
                    <picker-view-column>
                        <view v-for="a in ages" :key="a" class="wheel-item">{{ a }}岁</view>
                    </picker-view-column>
                </picker-view>
                <view class="picker-confirm" @click="confirmAge">确定</view>
            </view>
        </view>

        <!-- Time Picker -->
        <view class="picker-overlay" v-if="showTimePicker" @click="showTimePicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">选择时间</text>
                <view class="quick-time-grid">
                    <view
                        v-for="t in quickTimes"
                        :key="t.value"
                        class="quick-time-item"
                        :class="{ active: req.time === t.value }"
                        @click="req.time = t.value; showTimePicker = false"
                    >
                        <text class="quick-time-label">{{ t.label }}</text>
                        <text class="quick-time-desc">{{ t.desc }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- Payment Picker -->
        <view class="picker-overlay" v-if="showPaymentPicker" @click="showPaymentPicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">选择付款方式</text>
                <view class="picker-options">
                    <view
                        v-for="p in paymentOptions"
                        :key="p"
                        class="picker-option"
                        :class="{ active: req.payment === p }"
                        @click="req.payment = p; showPaymentPicker = false"
                    >
                        <text>{{ p }}</text>
                        <text v-if="req.payment === p" class="check">✓</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- Multi-select Pickers -->
        <view class="picker-overlay" v-if="showHotpotPicker" @click="showHotpotPicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">选择火锅类型（可多选）</text>
                <view class="tag-grid">
                    <view
                        v-for="t in hotpotTypeOptions"
                        :key="t"
                        class="tag"
                        :class="{ active: req.hotpotType.includes(t) }"
                        @click="toggleHotpotType(t)"
                    >{{ t }}</view>
                </view>
                <view class="picker-confirm" @click="showHotpotPicker = false">确定</view>
            </view>
        </view>

        <view class="picker-overlay" v-if="showTastePicker" @click="showTastePicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">选择口味偏好（可多选）</text>
                <view class="tag-grid">
                    <view
                        v-for="t in tasteOptions"
                        :key="t"
                        class="tag"
                        :class="{ active: req.taste.includes(t) }"
                        @click="toggleTaste(t)"
                    >{{ t }}</view>
                </view>
                <view class="picker-confirm" @click="showTastePicker = false">确定</view>
            </view>
        </view>

        <view class="picker-overlay" v-if="showMotivationPicker" @click="showMotivationPicker = false">
            <view class="picker-panel" @click.stop>
                <text class="picker-title">选择约锅动机</text>
                <view class="tag-grid">
                    <view
                        v-for="m in motivationOptions"
                        :key="m"
                        class="tag"
                        :class="{ active: req.motivation === m }"
                        @click="req.motivation = m; showMotivationPicker = false"
                    >{{ m }}</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { appState, hotpotTypeOptions, tasteOptions, motivationOptions, paymentOptions } from '@/utils/store';

const req = appState.matchRequirement;

const showGenderPicker = ref(false);
const showAgePicker = ref(false);
const showHotpotPicker = ref(false);
const showTastePicker = ref(false);
const showMotivationPicker = ref(false);
const showTimePicker = ref(false);
const showPaymentPicker = ref(false);

const ages = Array.from({ length: 51 }, (_, i) => String(18 + i));
const ageIndex = ref([0, 17]);

const quickTimes = [
    { label: '今天', desc: '今天', value: '今天' },
    { label: '明天', desc: '明天', value: '明天' },
    { label: '本周', desc: '本周内', value: '本周内' },
    { label: '本周末', desc: '周六/周日', value: '本周末' },
];

function goBack() {
    uni.navigateBack();
}

function goStoreSelection() {
    uni.navigateTo({
        url: '/subPack/match/storeSelection',
    });
}

function onAgeChange(e: any) {
    ageIndex.value = e.detail.value;
}

function confirmAge() {
    req.ageMin = ages[ageIndex.value[0]];
    req.ageMax = ages[ageIndex.value[1]];
    showAgePicker.value = false;
}

function toggleHotpotType(t: string) {
    const idx = req.hotpotType.indexOf(t);
    if (idx > -1) req.hotpotType.splice(idx, 1);
    else req.hotpotType.push(t);
}

function toggleTaste(t: string) {
    const idx = req.taste.indexOf(t);
    if (idx > -1) req.taste.splice(idx, 1);
    else req.taste.push(t);
}

function submitRequirement() {
    uni.navigateTo({
        url: '/subPack/match/matching',
    });
}
</script>

<style lang="scss" scoped>
.post-page {
    background: #1A1A1A;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.nav-header {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx 30rpx;
    padding-top: calc(60rpx + var(--status-bar-height, 0px));
    border-bottom: 1px solid #2A2A2A;
}

.back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
}

.back-icon {
    font-size: 48rpx;
    color: #FFFFFF;
}

.nav-title {
    font-size: 34rpx;
    color: #FFFFFF;
    font-weight: 600;
}

.content {
    flex: 1;
    padding: 0 40rpx;
}

.form-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 36rpx 0;
    border-bottom: 1px solid #2A2A2A;
}

.label {
    font-size: 30rpx;
    color: #FFFFFF;
}

.value {
    font-size: 28rpx;
    color: #B0B0B0;
    display: flex;
    align-items: center;
}

.arrow {
    font-size: 36rpx;
    color: #808080;
    margin-left: 8rpx;
}

.bottom-area {
    padding: 30rpx 40rpx;
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

/* Picker */
.picker-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    z-index: 999;
    display: flex;
    align-items: flex-end;
}

.picker-panel {
    width: 100%;
    background: #242424;
    border-radius: 32rpx 32rpx 0 0;
    padding: 40rpx 30rpx;
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.picker-title {
    font-size: 32rpx;
    color: #FFF;
    font-weight: 600;
    text-align: center;
    display: block;
    margin-bottom: 30rpx;
}

.picker-options {
    max-height: 600rpx;
    overflow-y: auto;
}

.picker-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 20rpx;
    border-bottom: 1px solid #333;
    font-size: 30rpx;
    color: #B0B0B0;
}

.picker-option.active {
    color: #FF6B3D;
}

.check {
    color: #FF6B3D;
    font-weight: 700;
}

.wheel-picker {
    width: 100%;
    height: 400rpx;
    margin-bottom: 20rpx;
}

.wheel-item {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    color: #FFF;
}

.picker-confirm {
    width: 100%;
    text-align: center;
    padding: 24rpx;
    background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
    border-radius: 50rpx;
    color: #FFF;
    font-size: 30rpx;
    font-weight: 600;
    margin-top: 20rpx;
}

.tag-grid {
    display: flex;
    flex-wrap: wrap;
    padding: 10rpx 0;
}

.tag-grid .tag {
    padding: 16rpx 30rpx;
    margin: 10rpx;
    font-size: 28rpx;
}

/* Quick Time */
.quick-time-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.quick-time-item {
    flex: 1;
    min-width: 40%;
    background: #333;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    text-align: center;
    border: 2rpx solid transparent;
}

.quick-time-item.active {
    border-color: #FF6B3D;
    background: rgba(255,107,61,0.1);
}

.quick-time-label {
    font-size: 28rpx;
    color: #FFF;
    display: block;
}

.quick-time-desc {
    font-size: 22rpx;
    color: #808080;
    display: block;
    margin-top: 6rpx;
}
</style>
