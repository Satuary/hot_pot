<template>
    <view class="page store-page">
        <!-- Header -->
        <view class="nav-header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <text class="nav-title">选择店铺</text>
        </view>

        <!-- Search -->
        <view class="search-area">
            <view class="search-box">
                <text class="search-icon">🔍</text>
                <input
                    class="search-input"
                    v-model="searchText"
                    placeholder="搜索火锅店"
                    placeholder-style="color:#555"
                />
            </view>
        </view>

        <!-- Store List -->
        <scroll-view class="store-list" scroll-y>
            <view
                v-for="store in filteredStores"
                :key="store.id"
                class="store-card dark-card"
                :class="{ active: selectedId === store.id }"
                @click="selectStore(store)"
            >
                <view class="store-info">
                    <text class="store-name">{{ store.name }}</text>
                    <view class="store-tags">
                        <text v-for="tag in store.tags" :key="tag" class="store-tag">{{ tag }}</text>
                    </view>
                    <view class="store-meta">
                        <text class="store-address">📍 {{ store.address }}</text>
                        <text class="store-distance">🚶 {{ store.distance }}</text>
                    </view>
                    <view class="store-rating">
                        <text class="rating-stars">⭐ {{ store.rating }}</text>
                    </view>
                </view>
                <view v-if="selectedId === store.id" class="selected-mark">
                    <text>✓</text>
                </view>
            </view>

            <!-- Load More -->
            <view class="load-more">
                <text class="load-text">— 更多火锅店敬请期待 —</text>
            </view>
        </scroll-view>

        <!-- Bottom -->
        <view class="bottom-area">
            <view class="gradient-btn active_btn" :class="{ disabled: !selectedId }" @click="confirmStore">
                确认选择
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { appState, mockStores } from '@/utils/store';

const searchText = ref('');
const selectedId = ref('');

const filteredStores = computed(() => {
    if (!searchText.value) return mockStores;
    return mockStores.filter(s =>
        s.name.includes(searchText.value) || s.address.includes(searchText.value)
    );
});

function goBack() {
    uni.navigateBack();
}

function selectStore(store: any) {
    selectedId.value = store.id;
}

function confirmStore() {
    if (!selectedId.value) return;
    const store = mockStores.find(s => s.id === selectedId.value);
    if (store) {
        appState.matchRequirement.store = store.name;
        appState.matchRequirement.storeAddress = store.address;
    }
    uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.store-page {
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
}

.back-btn {
    width: 60rpx; height: 60rpx;
    display: flex; align-items: center; justify-content: center;
    margin-right: 20rpx;
}

.back-icon {
    font-size: 48rpx;
    color: #FFF;
}

.nav-title {
    font-size: 34rpx;
    color: #FFF;
    font-weight: 600;
}

.search-area {
    padding: 20rpx 30rpx;
}

.search-box {
    display: flex;
    align-items: center;
    background: #333;
    border-radius: 50rpx;
    padding: 16rpx 30rpx;
}

.search-icon {
    font-size: 28rpx;
    margin-right: 16rpx;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    color: #FFF;
}

.store-list {
    flex: 1;
    padding: 0 30rpx;
}

.store-card {
    margin: 0 0 20rpx 0;
    position: relative;
    border: 2rpx solid transparent;
}

.store-card.active {
    border-color: #FF6B3D;
}

.store-name {
    font-size: 30rpx;
    color: #FFF;
    font-weight: 600;
    display: block;
    margin-bottom: 12rpx;
}

.store-tags {
    display: flex;
    gap: 12rpx;
    margin-bottom: 12rpx;
}

.store-tag {
    font-size: 22rpx;
    color: #FF8C66;
    background: rgba(255,107,61,0.15);
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
}

.store-meta {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    margin-bottom: 12rpx;
}

.store-address {
    font-size: 24rpx;
    color: #808080;
}

.store-distance {
    font-size: 24rpx;
    color: #808080;
}

.store-rating {
    display: flex;
    align-items: center;
}

.rating-stars {
    font-size: 26rpx;
    color: #FFD700;
}

.selected-mark {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: #FF6B3D;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFF;
    font-size: 28rpx;
    font-weight: 700;
}

.load-more {
    padding: 40rpx 0 60rpx;
    text-align: center;
}

.load-text {
    font-size: 24rpx;
    color: #555;
}

.bottom-area {
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
</style>
