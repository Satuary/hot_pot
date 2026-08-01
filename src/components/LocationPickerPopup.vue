<template>
  <view class="location-popup" v-if="visible" @click="handleMaskClick">
    <view class="popup-panel" @click.stop>
      <!-- 头部 -->
      <view class="panel-header">
        <text class="header-title">选择匹配地址</text>
        <view class="close-btn" @click="close">
          <uni-icons type="closeempty" size="22" color="#666"></uni-icons>
        </view>
      </view>

      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-input-wrap" @click="openSearch">
          <uni-icons type="search" size="18" color="#999"></uni-icons>
          <input
            class="search-input"
            v-model="searchKeyword"
            placeholder="搜索地址"
            placeholder-style="color:#bbb"
            :disabled="true"
            @click="openSearch"
          />
        </view>
      </view>

      <!-- 当前定位 -->
      <view class="current-location" @click="relocate">
        <view class="loc-left">
          <image class="loc-icon" src="/static/imgs/map-pin-2-line.png" mode="aspectFit" />
          <view class="loc-info">
            <text class="loc-label">当前定位</text>
            <text class="loc-address">{{ currentAddress }}</text>
          </view>
        </view>
        <view class="relocate-btn">
          <text class="relocate-text">{{ locating ? '定位中...' : '重新定位' }}</text>
          <uni-icons type="refresh" size="14" color="#58B4FF" :class="{ spinning: locating }"></uni-icons>
        </view>
      </view>

      <view class="divider"></view>

      <!-- 附近热门地点 -->
      <view class="section" v-if="nearbyLandmarks.length > 0">
        <view class="section-header">
          <text class="section-title">附近热门地点</text>
        </view>
        <scroll-view class="section-list" scroll-y>
          <view
            v-for="item in nearbyLandmarks"
            :key="item.id"
            class="location-item"
            @click="handleSelect(item)"
          >
            <view class="item-left">
              <image class="item-icon" src="/static/imgs/map-pin-2-line.png" mode="aspectFit" />
              <view class="item-info">
                <text class="item-name">{{ item.name }}</text>
                <text class="item-address">{{ item.address }}</text>
              </view>
            </view>
            <text class="item-distance" v-if="item.distance">{{ item.distance }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 最近使用的位置 -->
      <view class="section" v-if="recentLocations.length > 0">
        <view class="section-header">
          <text class="section-title">最近使用</text>
        </view>
        <view class="section-list">
          <view
            v-for="item in recentLocations"
            :key="item.id"
            class="location-item"
            @click="handleSelect(item)"
          >
            <view class="item-left">
              <uni-icons type="location-filled" size="18" color="#58B4FF"></uni-icons>
              <view class="item-info">
                <text class="item-name">{{ item.name }}</text>
                <text class="item-address">{{ item.address }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态：无附近地点 -->
      <view class="empty-state" v-if="!loading && nearbyLandmarks.length === 0">
        <text class="empty-text">暂无附近地点信息</text>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <view class="spinner"></view>
        <text class="loading-text">正在获取位置信息...</text>
      </view>
    </view>

    <!-- 地址搜索子页面 -->
    <view class="search-panel" v-if="searchVisible">
      <view class="search-header">
        <view class="search-input-wrap active">
          <uni-icons type="search" size="18" color="#999"></uni-icons>
          <input
            class="search-input"
            v-model="searchKeyword"
            placeholder="请输入地址"
            placeholder-style="color:#bbb"
            focus
            :adjust-position="true"
            :hold-keyboard="true"
            @input="onSearchInput"
          />
        </view>
        <text class="cancel-btn" @click="closeSearch">取消</text>
      </view>
      <scroll-view class="search-results" scroll-y v-if="searchResults.length > 0">
        <view
          v-for="item in searchResults"
          :key="item.id"
          class="location-item"
          @click="handleSelect(item)"
        >
          <view class="item-left">
            <uni-icons type="location-filled" size="18" color="#58B4FF"></uni-icons>
            <view class="item-info">
              <text class="item-name" v-html="highlightMatch(item.name)"></text>
              <text class="item-address">{{ item.address }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="search-empty" v-else-if="searchKeyword && !searchLoading">
        <text class="empty-text">未找到相关地址</text>
      </view>
      <view class="search-loading" v-if="searchLoading">
        <view class="spinner"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  getUserLocation,
  reverseGeocode,
  searchNearbyLandmarks,
  type UserLocation,
  type NearbyPoi,
} from '@/utils/map';
import { AMAP_KEY, AMAP_HOST } from '@/config/map';

interface Props {
  visible: boolean;
  /** 初始位置名称（可能来自外部存储） */
  initialName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialName: '',
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  select: [item: LocationItem];
}>();

/** 选中的位置项 */
export interface LocationItem {
  id: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  distance: string;
}

const RECENT_LOCATIONS_KEY = 'recent_locations';

// 状态
const currentAddress = ref('正在定位...');
const currentLocation = ref<UserLocation | null>(null);
const loading = ref(true);
const locating = ref(false);
const nearbyLandmarks = ref<NearbyPoi[]>([]);
const recentLocations = ref<LocationItem[]>([]);

// 搜索状态
const searchVisible = ref(false);
const searchKeyword = ref('');
const searchResults = ref<NearbyPoi[]>([]);
const searchLoading = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | null = null;

// 监听 visible 变化，打开时自动定位
watch(
  () => props.visible,
  (val) => {
    if (val) {
      initLocation();
    }
  },
);

/** 初始化定位 */
async function initLocation() {
  loading.value = true;
  loadRecentLocations();

  try {
    // 1. 获取用户定位
    const loc = await getUserLocation();
    currentLocation.value = loc;

    // 2. 逆地理编码获取地址
    const addrInfo = await reverseGeocode(loc);
    currentAddress.value = addrInfo.shortDescription || addrInfo.formattedAddress;

    // 3. 搜索附近热门地标
    const landmarks = await searchNearbyLandmarks(loc);
    nearbyLandmarks.value = landmarks;
  } catch (err: any) {
    console.error('定位失败:', err);
    currentAddress.value = '定位失败，点击重新定位';
    uni.showToast({ title: err.message || '定位失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

/** 重新定位 */
async function relocate() {
  locating.value = true;
  try {
    await initLocation();
    uni.showToast({ title: '位置已更新', icon: 'success' });
  } finally {
    locating.value = false;
  }
}

/** 打开搜索 */
function openSearch() {
  searchVisible.value = true;
  searchKeyword.value = '';
  searchResults.value = [];
}

/** 关闭搜索 */
function closeSearch() {
  searchVisible.value = false;
  searchKeyword.value = '';
  searchResults.value = [];
}

/** 搜索防抖 */
function onSearchInput() {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    doSearch();
  }, 400);
}

/** 执行地址搜索（高德输入提示 API） */
async function doSearch() {
  const kw = searchKeyword.value.trim();
  if (!kw) {
    searchResults.value = [];
    return;
  }

  searchLoading.value = true;
  try {
    const res = await new Promise<{ status: string; tips: any[] }>((resolve, reject) => {
      uni.request({
        url: `${AMAP_HOST}/v3/assistant/inputtips`,
        data: {
          key: AMAP_KEY,
          keywords: kw,
          datatype: 'all',
        },
        success(r) {
          resolve(r.data as any);
        },
        fail(err) {
          reject(err);
        },
      });
    });

    if (res.status === '1' && res.tips) {
      searchResults.value = res.tips
        .filter((t: any) => t.name && t.location && t.location !== '0,0')
        .map((t: any) => ({
          id: t.id || t.name,
          name: t.name,
          address: t.address || t.district || '',
          distance: '',
          direction: '',
          location: t.location || '0,0',
        }));
    } else {
      searchResults.value = [];
    }
  } catch {
    searchResults.value = [];
  } finally {
    searchLoading.value = false;
  }
}

/** 高亮匹配文字 */
function highlightMatch(name: string): string {
  if (!searchKeyword.value) return name;
  const kw = searchKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${kw})`, 'gi');
  return name.replace(regex, '<text style="color:#58B4FF;">$1</text>');
}

/** 选择位置 */
function handleSelect(item: NearbyPoi | LocationItem) {
  // 兼容两种类型：NearbyPoi 有 location 字符串，LocationItem 有 longitude/latitude
  let lng: number, lat: number;
  if ('longitude' in item && 'latitude' in item) {
    lng = item.longitude;
    lat = item.latitude;
  } else {
    const parts = ((item as NearbyPoi).location || '0,0').split(',').map(Number);
    lng = parts[0] || 0;
    lat = parts[1] || 0;
  }

  const locationItem: LocationItem = {
    id: item.id,
    name: item.name,
    address: item.address || item.name,
    longitude: lng,
    latitude: lat,
    distance: item.distance || '',
  };

  saveRecentLocation(locationItem);
  emit('select', locationItem);
  close();
}

/** 加载最近使用的位置 */
function loadRecentLocations() {
  try {
    const stored = uni.getStorageSync(RECENT_LOCATIONS_KEY);
    if (stored) {
      recentLocations.value = JSON.parse(stored).slice(0, 5);
    }
  } catch {
    recentLocations.value = [];
  }
}

/** 保存最近使用的位置 */
function saveRecentLocation(item: LocationItem) {
  try {
    const stored = uni.getStorageSync(RECENT_LOCATIONS_KEY);
    let list: LocationItem[] = stored ? JSON.parse(stored) : [];
    list = list.filter((l) => l.id !== item.id);
    list.unshift(item);
    list = list.slice(0, 10);
    uni.setStorageSync(RECENT_LOCATIONS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function close() {
  emit('update:visible', false);
}

function handleMaskClick() {
  close();
}
</script>

<style lang="scss" scoped>
.location-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.popup-panel {
  width: 100%;
  height: 75vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

// 头部
.panel-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 32rpx 16rpx;
  position: relative;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}

.close-btn {
  position: absolute;
  right: 24rpx;
  top: 32rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 搜索栏
.search-bar {
  padding: 16rpx 32rpx 24rpx;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 48rpx;
  padding: 16rpx 24rpx;

  &.active {
    flex: 1;
    background: #f0f0f0;
  }
}

.search-input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #333;
}

// 当前定位
.current-location {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
}

.loc-left {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.loc-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.loc-info {
  margin-left: 16rpx;
  flex: 1;
  overflow: hidden;
}

.loc-label {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.loc-address {
  font-size: 30rpx;
  color: #58B4FF;
  font-weight: 500;
  margin-top: 4rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relocate-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 20rpx;
  border-radius: 48rpx;
  background: #fff;
  border: 1rpx solid #58B4FF;
  flex-shrink: 0;
}

.relocate-text {
  font-size: 24rpx;
  color: #58B4FF;
  margin-right: 4rpx;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  height: 1rpx;
  background: #eee;
  margin: 0 32rpx;
}

// 区域
.section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  padding: 24rpx 32rpx 12rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
}

.section-list {
  flex: 1;
  padding: 0 32rpx;
}

// 位置项
.location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.item-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  opacity: 0.6;
}

.item-info {
  margin-left: 16rpx;
  flex: 1;
  overflow: hidden;
}

.item-name {
  font-size: 28rpx;
  color: #222;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-address {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-distance {
  font-size: 22rpx;
  color: #bbb;
  flex-shrink: 0;
  margin-left: 16rpx;
}

// 空状态 & 加载
.empty-state,
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #bbb;
}

.loading-text {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #999;
}

.spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(88, 180, 255, 0.2);
  border-top-color: #58B4FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

// 搜索面板
.search-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.search-header {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx 20rpx;
  gap: 20rpx;
  flex-shrink: 0;
}

.cancel-btn {
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.search-results,
.search-empty,
.search-loading {
  flex: 1;
  padding: 0 32rpx;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
