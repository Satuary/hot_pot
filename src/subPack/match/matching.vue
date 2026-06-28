<template>
    <view class="page matching-page">
        <!-- Header -->
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">{{ isBlind ? '盲盒匹配' : '精准匹配' }}</text>
        </view>

        <!-- Match Progress -->
        <view class="matching-area">
            <!-- Radar Animation -->
            <view class="radar-container">
                <view class="radar-circle" :class="{ spinning: isMatching }">
                    <view class="radar-sweep"></view>
                    <view class="radar-line line-1"></view>
                    <view class="radar-line line-2"></view>
                    <view class="radar-line line-3"></view>
                    <view class="radar-line line-4"></view>
                    <view class="radar-dot dot-1" v-if="isMatching">👤</view>
                    <view class="radar-dot dot-2" v-if="isMatching">👤</view>
                    <view class="radar-dot dot-3" v-if="isMatching">👤</view>
                </view>
                <view class="radar-center-icon">
                    <text class="center-emoji">🍲</text>
                </view>
            </view>

            <!-- Status Text -->
            <view class="status-area">
                <text v-if="phase === 'searching'" class="status-text">正在为你寻找火锅搭子...</text>
                <text v-else-if="phase === 'found'" class="status-text success">找到 {{ matchCount }} 位潜在搭子</text>
                <text v-else-if="phase === 'success'" class="status-text success">🎉 匹配成功！</text>
                <text v-else-if="phase === 'fail'" class="status-text fail">暂无匹配结果，再试试吧</text>
            </view>

            <!-- Matching Details -->
            <view class="match-details" v-if="isMatching || phase === 'found'">
                <view class="detail-item">
                    <text class="detail-label">匹配条件</text>
                    <text class="detail-value">{{ req.gender }} · {{ req.ageMin }}-{{ req.ageMax }}岁</text>
                </view>
                <view class="detail-item">
                    <text class="detail-label">火锅偏好</text>
                    <text class="detail-value">{{ req.hotpotType.join('、') || '不限' }}</text>
                </view>
                <view class="detail-item">
                    <text class="detail-label">预计耗时</text>
                    <text class="detail-value">约 {{ matchDuration }} 秒</text>
                </view>
            </view>
        </view>

        <!-- Found Users (when matching is done) -->
        <scroll-view class="found-list" scroll-y v-if="phase === 'found'">
            <view
                v-for="user in foundUsers"
                :key="user.id"
                class="found-card dark-card"
                @click="viewProfile(user)"
            >
                <view class="found-avatar">
                    <text>👤</text>
                </view>
                <view class="found-info">
                    <text class="found-name">{{ user.nickname }}</text>
                    <text class="found-meta">{{ user.gender }} · {{ user.age }}岁</text>
                    <text class="found-match">匹配度 {{ user.matchRate }}%</text>
                </view>
                <text class="view-detail">查看 ›</text>
            </view>
        </scroll-view>

        <!-- Bottom Actions -->
        <view class="bottom-actions">
            <view v-if="phase === 'idle'" class="gradient-btn active_btn" @click="startMatching">
                开始匹配
            </view>
            <view v-if="phase === 'fail'" class="actions-row">
                <view class="action-btn outline" @click="goPostRequirement">修改需求</view>
                <view class="action-btn primary" @click="startMatching">重新匹配</view>
            </view>
            <view v-if="phase === 'found'" class="actions-row">
                <view class="action-btn outline" @click="startMatching">重新匹配</view>
                <view class="action-btn primary" @click="goMatchSuccess">确认搭子</view>
            </view>
        </view>

        <!-- Match Success Modal -->
        <view class="success-overlay" v-if="showSuccess" @click="showSuccess = false">
            <view class="success-modal" @click.stop>
                <view class="success-fireworks">
                    <text class="firework-emoji">🎉</text>
                </view>
                <text class="success-title">匹配成功！</text>
                <text class="success-desc">恭喜你找到火锅搭子</text>
                <view class="matched-avatar">
                    <text>👤</text>
                </view>
                <text class="matched-name">火锅小公主</text>
                <text class="matched-meta">女 · 25岁 · 165cm</text>
                <view class="matched-tags">
                    <text class="matched-tag">重庆火锅</text>
                    <text class="matched-tag">麻辣</text>
                </view>
                <view class="success-actions">
                    <view class="action-btn primary" @click="contactNow">查看联系方式</view>
                    <view class="action-btn outline" @click="showSuccess = false">稍后再说</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { appState } from '@/utils/store';

const req = appState.matchRequirement;
const isBlind = ref(false);
const isMatching = ref(false);
const phase = ref<'idle' | 'searching' | 'found' | 'success' | 'fail'>('idle');
const matchCount = ref(3);
const matchDuration = ref(30);
const showSuccess = ref(false);

let matchTimer: any = null;
let durationTimer: any = null;

const foundUsers = ref([
    { id: 'u1', nickname: '火锅小公主', gender: '女', age: '25', matchRate: 95 },
    { id: 'u2', nickname: '麻辣达人', gender: '男', age: '28', matchRate: 87 },
    { id: 'u3', nickname: '吃货小明', gender: '女', age: '23', matchRate: 82 },
]);

onMounted(() => {
    // Auto start on page load
    startMatching();
});

onUnmounted(() => {
    clearTimers();
});

function clearTimers() {
    if (matchTimer) clearTimeout(matchTimer);
    if (durationTimer) clearInterval(durationTimer);
}

function goBack() {
    clearTimers();
    uni.navigateBack();
}

function startMatching() {
    clearTimers();
    isMatching.value = true;
    phase.value = 'searching';
    matchDuration.value = 5;

    durationTimer = setInterval(() => {
        matchDuration.value--;
        if (matchDuration.value <= 0) {
            clearInterval(durationTimer);
            finishMatching();
        }
    }, 1000);

    matchTimer = setTimeout(() => {
        finishMatching();
    }, 5000);
}

function finishMatching() {
    clearTimers();
    isMatching.value = false;
    // Simulate success/fail
    phase.value = Math.random() > 0.3 ? 'found' : 'fail';
    matchCount.value = Math.floor(Math.random() * 5) + 1;
}

function viewProfile(user: any) {
    uni.navigateTo({
        url: '/subPack/match/profileView?id=' + user.id,
    });
}

function goMatchSuccess() {
    showSuccess.value = true;
}

function goPostRequirement() {
    uni.navigateTo({
        url: '/subPack/match/postRequirement',
    });
}

function contactNow() {
    showSuccess.value = false;
    uni.showToast({ title: '已发送联系方式', icon: 'success' });
    setTimeout(() => {
        uni.switchTab({ url: '/pages/tabBar/view' });
    }, 1500);
}
</script>

<style lang="scss" scoped>
.matching-page {
    background: #1A1A1A;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.nav-header {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    padding-top: calc(60rpx + var(--status-bar-height, 0px));
    z-index: 10;
}

.back-btn {
    width: 60rpx; height: 60rpx;
    display: flex; align-items: center; justify-content: center;
    margin-right: 20rpx;
}

.back-icon {
    font-size: 48rpx; color: #FFF;
}

.nav-title {
    font-size: 34rpx; color: #FFF; font-weight: 600;
}

.matching-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
}

/* Radar */
.radar-container {
    position: relative;
    width: 500rpx;
    height: 500rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.radar-circle {
    width: 400rpx;
    height: 400rpx;
    border-radius: 50%;
    position: relative;
    border: 2px solid rgba(255,107,61,0.2);
    background: rgba(255,107,61,0.02);
}

.radar-circle.spinning {
    animation: spin 3s linear infinite;
}

.radar-sweep {
    position: absolute;
    top: 0; left: 50%;
    width: 50%;
    height: 50%;
    background: conic-gradient(from 0deg, rgba(255,107,61,0.15), transparent 60deg);
    transform-origin: bottom right;
    border-radius: 0 0 200rpx 0;
}

.radar-line {
    position: absolute;
    background: rgba(255,107,61,0.08);
}

.line-1 { top: 50%; left: 0; right: 0; height: 1px; }
.line-2 { left: 50%; top: 0; bottom: 0; width: 1px; }
.line-3 { top: 10%; left: 10%; right: 10%; height: 1px; transform: rotate(-45deg); }
.line-4 { top: 10%; left: 10%; right: 10%; height: 1px; transform: rotate(45deg); }

.radar-dot {
    position: absolute;
    font-size: 32rpx;
    animation: dotPulse 2s ease-in-out infinite;
}

.dot-1 { top: 20%; right: 20%; animation-delay: 0s; }
.dot-2 { bottom: 25%; left: 20%; animation-delay: 0.7s; }
.dot-3 { top: 30%; left: 25%; animation-delay: 1.4s; }

.radar-center-icon {
    position: absolute;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.center-emoji {
    font-size: 48rpx;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
}

/* Status */
.status-area {
    margin-top: 40rpx;
    text-align: center;
}

.status-text {
    font-size: 30rpx;
    color: #B0B0B0;
}

.status-text.success {
    color: #FFD700;
}

.status-text.fail {
    color: #FF3B30;
}

/* Match Details */
.match-details {
    width: 600rpx;
    background: #242424;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-top: 40rpx;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 12rpx 0;
}

.detail-label {
    font-size: 26rpx;
    color: #808080;
}

.detail-value {
    font-size: 26rpx;
    color: #B0B0B0;
}

/* Found List */
.found-list {
    flex: 1;
    padding: 0 30rpx;
}

.found-card {
    margin: 0 0 20rpx 0;
    display: flex;
    align-items: center;
}

.found-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    font-size: 36rpx;
}

.found-info {
    flex: 1;
}

.found-name {
    font-size: 28rpx;
    color: #FFF;
    font-weight: 500;
    display: block;
}

.found-meta {
    font-size: 24rpx;
    color: #808080;
    margin-top: 4rpx;
    display: block;
}

.found-match {
    font-size: 24rpx;
    color: #FF6B3D;
    margin-top: 4rpx;
    display: block;
}

.view-detail {
    font-size: 26rpx;
    color: #FF6B3D;
}

/* Bottom */
.bottom-actions {
    padding: 30rpx;
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.actions-row {
    display: flex;
    gap: 20rpx;
}

.action-btn {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    border-radius: 50rpx;
    font-size: 30rpx;
    font-weight: 600;
}

.action-btn.primary {
    background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
    color: #FFF;
}

.action-btn.outline {
    border: 2rpx solid #4A4A4A;
    color: #B0B0B0;
}

/* Success Modal */
.success-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-modal {
    width: 600rpx;
    background: #242424;
    border-radius: 32rpx;
    padding: 60rpx 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.success-fireworks {
    margin-bottom: 20rpx;
}

.firework-emoji {
    font-size: 80rpx;
}

.success-title {
    font-size: 40rpx;
    color: #FFD700;
    font-weight: 700;
    margin-bottom: 10rpx;
}

.success-desc {
    font-size: 28rpx;
    color: #B0B0B0;
    margin-bottom: 30rpx;
}

.matched-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56rpx;
    margin-bottom: 16rpx;
}

.matched-name {
    font-size: 32rpx;
    color: #FFF;
    font-weight: 600;
    margin-bottom: 6rpx;
}

.matched-meta {
    font-size: 24rpx;
    color: #808080;
    margin-bottom: 16rpx;
}

.matched-tags {
    display: flex;
    gap: 16rpx;
    margin-bottom: 30rpx;
}

.matched-tag {
    background: rgba(255,107,61,0.15);
    color: #FF8C66;
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
}

.success-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}
</style>
