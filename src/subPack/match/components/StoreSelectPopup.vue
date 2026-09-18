<template>
  <view class="store-popup" v-if="visible" @click="handleMaskClick">
    <view class="popup-panel" @click.stop>
      <view class="popup-header">
        <view class="title-wrap">
          <text class="title">{{ title }}</text>
          <text class="subtitle">选择火锅店吧~</text>
        </view>
        <view class="close-btn" @click="close">
          <uni-icons type="closeempty" size="24" color="#ffffff"></uni-icons>
        </view>
      </view>

      <view class="sort-bar">
        <view class="sort-trigger" @click="toggleSort">
          <text class="sort-text">{{ currentSort.label }}</text>
          <uni-icons
            type="down"
            size="12"
            color="#ffffff"
            :class="{ rotate: sortOpen }"
            class="sort-icon"
          ></uni-icons>
        </view>
        <view class="sort-dropdown" v-if="sortOpen">
          <view
            v-for="item in sortOptions"
            :key="item.value"
            class="sort-option"
            :class="{ active: currentSort.value === item.value }"
            @click="changeSort(item)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
      
      <scroll-view class="store-list" scroll-y @scrolltolower="loadMore" lower-threshold="80">
        <view v-if="loading && sortedStores.length === 0" class="loading-wrap">
          <view class="spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>
        <block v-else>
          <view
            v-for="store in sortedStores"
            :key="store.id"
            class="store-card"
            @click="handleSelect(store)"
          >
            <image
              class="store-image"
              :src="store.image || defaultImage"
              mode="aspectFill"
            ></image>
            <view class="store-info">
              <text class="store-name">{{ store.name }}</text>
              <view class="rating-row">
                <view class="stars">
                  <uni-icons
                    v-for="i in 5"
                    :key="i"
                    type="star-filled"
                    size="12"
                    :color="i <= Math.round(store.rating || 0) ? '#FFD700' : '#555555'"
                  ></uni-icons>
                </view>
                <text class="rating-score">{{ store.rating || '0.0' }}</text>
                <!-- <text class="rating-count">0条评价</text> -->
              </view>
              <view class="tags">
                <text class="tag">{{ store.tags }}</text>
              </view>
              <view class="distance-row">
                <uni-icons type="location-filled" size="12" color="#999999"></uni-icons>
                <text class="distance-text">直线距离{{ store.distance }}</text>
              </view>
              <!-- <text class="status">暂未入住</text> -->
            </view>
          </view>
          <view v-if="loadingMore" class="load-more-tip">
            <view class="spinner small"></view>
            <text class="loading-text inline">加载更多...</text>
          </view>
          <view v-else-if="hasMore" class="load-more-tip">
            <text class="no-more-text">上拉加载更多</text>
          </view>
          <view v-else-if="sortedStores.length > 0" class="load-more-tip">
            <text class="no-more-text">没有更多了</text>
          </view>
        </block>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Store } from '@/utils/store';

interface SortOption {
  label: string;
  value: string;
}

interface Props {
  visible: boolean;
  stores?: Store[];
  /** 首屏加载中 */
  loading?: boolean;
  /** 加载更多中（底部） */
  loadingMore?: boolean;
  /** 是否还有下一页 */
  hasMore?: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  stores: () => [],
  loading: false,
  loadingMore: false,
  hasMore: false,
  title: '选择想要去的火锅店',
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  select: [store: Store];
  /** 滚动到底部，请求父组件加载下一页 */
  'load-more': [];
}>();

const defaultImage = '/static/imgs/logo.png';
const sortOpen = ref(false);
const currentSort = ref<SortOption>({ label: '综合排序', value: 'default' });

const sortOptions: SortOption[] = [
  { label: '综合排序', value: 'default' },
  { label: '距离最近', value: 'distance' },
  { label: '评分最高', value: 'rating' },
];

const sortedStores = computed(() => {
  const list = [...props.stores];
  if (currentSort.value.value === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (currentSort.value.value === 'distance') {
    list.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
  }
  return list;
});

function loadMore() {
  if (props.hasMore && !props.loadingMore) {
    emit('load-more');
  }
}

function parseDistance(distance?: string): number {
  if (!distance) return Infinity;
  const match = distance.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

function toggleSort() {
  sortOpen.value = !sortOpen.value;
}

function changeSort(item: SortOption) {
  currentSort.value = item;
  sortOpen.value = false;
}

function close() {
  sortOpen.value = false;
  emit('update:visible', false);
}

function handleMaskClick() {
  close();
}

function handleSelect(store: Store) {
  emit('select', store);
  close();
}
</script>

<style lang="scss" scoped>
.store-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.popup-panel {
  width: 100%;
  height: 82vh;
  background: #000;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease-out;
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  border-bottom: none;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 40rpx 32rpx 24rpx;
}

.title-wrap {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFF;
  line-height: 1.4;
}

.subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999999;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.sort-bar {
  position: relative;
  padding: 0 32rpx 24rpx;
}

.sort-trigger {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 24rpx;
  border-radius: 48rpx;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 1rpx solid #ffffff;
}

.sort-text {
  font-size: 26rpx;
  color: #FFF;
}

.sort-icon {
  margin-left: 8rpx;
  transition: transform 0.2s;

  &.rotate {
    transform: rotate(180deg);
  }
}

.sort-dropdown {
  position: absolute;
  top: 72rpx;
  left: 32rpx;
  z-index: 10;
  min-width: 200rpx;
  background: #000;
  border-radius: 16rpx;
  padding: 12rpx 0;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.sort-option {
  padding: 18rpx 28rpx;
  font-size: 26rpx;
  color: #929292;

  &.active {
    color: #58B4FF;
  }
}

.store-list {
  flex: 1;
  min-height: 200px;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 160rpx;
}

.spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba(88, 180, 255, 0.2);
  border-top-color: #58B4FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  &.small {
    width: 32rpx;
    height: 32rpx;
    border-width: 3rpx;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #999999;

  &.inline {
    margin-top: 0;
    margin-left: 12rpx;
    font-size: 24rpx;
  }
}

.store-card {
  display: flex;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  padding: 24rpx;
  margin: 24rpx;
}

.store-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #333;
}

.store-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}

.store-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFF;
  line-height: 1.3;
}

.rating-row {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.stars {
  display: flex;
  align-items: center;
}

.rating-score {
  margin-left: 12rpx;
  font-size: 24rpx;
  color: #FFD700;
  font-weight: 500;
}

.rating-count {
  margin-left: 12rpx;
  font-size: 22rpx;
  color: #999999;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #929292;
  background: rgba(0, 0, 0, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.15);
}

.distance-row {
  display: flex;
  align-items: center;
  // margin-top: 14rpx;
}

.distance-text {
  margin-left: 6rpx;
  font-size: 22rpx;
  color: #999999;
}

.status {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #929292;
}

.load-more-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0 48rpx;
}

.no-more-text {
  font-size: 24rpx;
  color: #666666;
}
</style>
