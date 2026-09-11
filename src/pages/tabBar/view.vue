<template>
  <view class="page-container">
    <!-- 背景图 -->
    <image class="page-bg" src="/static/imgs/index_bg.png" mode="aspectFill"></image>
    <!-- 顶部状态栏占位 -->
    <view class="status-bar"></view>

    <!-- 顶部头像与连接区域 -->
    <view class="header-section" v-if="matchDetail">
      <!-- 左侧头像 -->
      <view class="avatar-box left-avatar">
        <image
          :src="myAvatar"
          mode="aspectFill"
          class="avatar-img"
        ></image>
      </view>

      <!-- 中间连接图标 -->
      <view class="link-icon-box">
        <image class="link-icon-text" src="/static/imgs/link.png" mode="aspectFit"></image>
      </view>

      <!-- 对方 + 右侧头像 + 标签 -->
      <view class="right-wrapper">
        <view class="avatar-box right-avatar">
          <image
            :src="otherAvatar"
            mode="aspectFill"
            class="avatar-img"
          ></image>
        </view>
        <!-- 点击查看标签 -->
        <view class="click-tag" @click="goToPartnerProfile">点击查看</view>
      </view>
    </view>

    <!-- 等待对方同意弹窗 -->
    <view class="waiting-mask" v-if="showWaitingPopup" @click="closeWaitingPopup">
      <view class="waiting-popup" @click.stop>
        <text class="waiting-title">等待对方同意</text>
        <view class="countdown">
          <view class="countdown-digit">{{ countdownStr[0] }}</view>
          <view class="countdown-digit">{{ countdownStr[1] }}</view>
          <text class="countdown-colon">:</text>
          <view class="countdown-digit">{{ countdownStr[2] }}</view>
          <view class="countdown-digit">{{ countdownStr[3] }}</view>
        </view>
        <view class="waiting-cancel" @click="handleCancelMatch">取消</view>
      </view>
    </view>

    <!-- 中间信息卡片：渲染当前匹配详情 -->
    <view class="info-card" v-if="matchDetail">
      <!-- 左侧时间区 -->
      <view class="time-section">
        <text class="date-text">{{ displayDate }}</text>
        <text class="time-text">{{ displayTime }}</text>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 右侧详情区 -->
      <view class="detail-section">
        <view class="title-row">
          <view class="icon-pin">
            <image class="icon-fire" src="/static/imgs/location.png" mode="aspectFit"></image>
          </view>
          <text class="shop-name">{{ shopName }}</text>
        </view>

        <view class="info-row">
          <text class="label">火锅类型：</text>
          <text class="value">{{ hotpotTypeText }}</text>
        </view>

        <view class="info-row">
          <text class="label">付费方式：</text>
          <text class="value">{{ payTypeText }}</text>
        </view>

        <!-- 取消按钮 -->
        <view class="cancel-btn" @click="handleCancelMatch">取消</view>
      </view>
    </view>

    <!-- 无匹配数据时的空状态：加载完成且没有匹配记录才展示 -->
    <view class="empty-state" v-else-if="!detailLoading">
      <text class="empty-icon">🍲</text>
      <text class="empty-text">还没有进行中的匹配</text>
      <view class="empty-btn" @click="goToMatch">快去发起匹配吧</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { onShow, onHide } from '@dcloudio/uni-app';
import { isLogin, isProfileComplete } from '@/utils/auth';
import { getMatchDetail, cancelMatchRecord } from '@/api/api';
import { hotpotTypeText as hotpotTypeTextMap, payTypeCodeText } from '@/config/matchOptions';
import type { MatchDetailItem } from '@/api/api';
import { onWsMessage } from '@/utils/websocket';
import { WS_EVENT } from '@/common/matchSocket';

const showWaitingPopup = ref(false);
const remainingSeconds = ref(10 * 60); // 默认 10 分钟倒计时
// 等待倒计时持久化：本地存截止时间戳（毫秒），离开/刷新页面后按它恢复剩余时间，不重置
const WAITING_DEADLINE_KEY = 'waitingDeadline';
const WAITING_TOTAL_SECONDS = 10 * 60;
const recordId = ref('');
// const demandId = ref('');
let countdownTimer:any = null;
// 全局 socket 消息退订函数
let unsubscribeWs: (() => void) | null = null;


const countdownStr = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60);
  const seconds = remainingSeconds.value % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}${ss}`;
});

// 倒计时
function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  countdownTimer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value -= 1;
    } else {
      clearInterval(countdownTimer);
      countdownTimer = null;
      handleCountdownTimeout();
    }
  }, 1000);
}

// 倒计时结束（含恢复时发现已过期）：清理等待标记，取消匹配记录，提示后跳转到匹配页
function handleCountdownTimeout() {
  uni.removeStorageSync(WAITING_DEADLINE_KEY);
  uni.removeStorageSync('showWaitingPopup');
  showWaitingPopup.value = false;
  handleCancelMatch();
  uni.showToast({ title: '等待超时，已自动取消', icon: 'none', duration: 1500 });
  setTimeout(() => {
    uni.switchTab({ url: '/pages/tabBar/match' });
  }, 1500);
}

// 开启等待倒计时：剩余时间以本地持久化的截止时间戳为准，离开/刷新回来不重置
function startWaitingCountdown() {
  const now = Date.now();
  let deadline = Number(uni.getStorageSync(WAITING_DEADLINE_KEY)) || 0;
  if (!deadline) {
    // 首次展示等待弹窗：以当前时间 + 10 分钟作为截止点并持久化
    deadline = now + WAITING_TOTAL_SECONDS * 1000;
    uni.setStorageSync(WAITING_DEADLINE_KEY, deadline);
  }
  if (deadline <= now) {
    // 持久化的截止时间已过：按超时取消处理
    handleCountdownTimeout();
    return;
  }
  remainingSeconds.value = Math.ceil((deadline - now) / 1000);
  startCountdown();
}

// 点击查看对方主页
function goToPartnerProfile() {
  // 联系方式交换等操作以匹配记录 recordId 为参数，优先内存，其次详情返回
  const id = recordId.value || matchDetail.value?.recordId || '';
  // otherUserId 供对方资料页 mini/user/getUserInfo 使用
  const uid = matchDetail.value?.otherUserId || '';
  uni.navigateTo({ url: `/subPack/match/partnerProfile?from=view&recordId=${id}&otherUserId=${uid}` });
}

// 关闭等待弹窗
function closeWaitingPopup() {
  showWaitingPopup.value = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

// 取消匹配：调用取消接口后关闭等待弹窗
async function handleCancelMatch() {
  if (recordId.value) {
    try {
      await cancelMatchRecord({ recordId: recordId.value });
      // 取消成功进入终态，清掉缓存与内存中的 recordId、等待弹窗与倒计时标记
      uni.removeStorageSync('recordId');
      uni.removeStorageSync('showWaitingPopup');
      uni.removeStorageSync(WAITING_DEADLINE_KEY);
      recordId.value = '';
    } catch {
      // 取消失败不阻塞关闭弹窗，错误提示已由 request 统一处理
    }
  }
  closeWaitingPopup();
}

// 匹配详情：一次只有一条有效匹配，进入页面用 recordId 拉取详情渲染
const matchDetail = ref<MatchDetailItem | null>(null);
// 详情请求中标记：请求期间不显示空状态，避免无数据时闪烁
const detailLoading = ref(false);

// 空状态：去发起匹配（跳转到匹配 tab 页）
function goToMatch() {
  uni.switchTab({ url: '/pages/tabBar/match' });
}

// 我的头像（缺省回退占位图）
const myAvatar = computed(() => matchDetail.value?.myAvatar || 'https://picsum.photos/200');
// 对方头像（缺省回退占位图）
const otherAvatar = computed(
  () =>
    matchDetail.value?.otherAvatar ||
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
);

// 店铺名称：详情接口直接返回 shopName
const shopName = computed(() => matchDetail.value?.shopName || '');

// meetingTime 如 "2026-09-03 15:30"，拆成左侧日期与时间展示
const displayDate = computed(() => {
  const t = matchDetail.value?.meetingTime || '';
  const date = t.split(' ')[0] || '';
  return date.length >= 10 ? date.slice(5) : date;
});

// 显示时间
const displayTime = computed(() => {
  const t = matchDetail.value?.meetingTime || '';
  return t.split(' ')[1] || '';
});

// 火锅类型
// hotpotType 返回单个索引数字（0=重庆火锅 1=潮汕火锅 2=海鲜火锅 3=小火锅），兼容逗号分隔多选
const hotpotTypeText = computed(() => {
  const raw = matchDetail.value?.hotpotType;
  if (raw == null) return '';
  return String(raw)
    .split(',')
    .map((idx) => hotpotTypeTextMap[Number(idx)] || '')
    .filter(Boolean)
    .join('、');
});

// 请客类型
const payTypeText = computed(() => {
  const t = matchDetail.value?.payType;
  return t != null ? payTypeCodeText[t] || '' : '';
});

// 请求匹配详情，用返回的店铺/时间/火锅类型/付费方式/头像等渲染卡片
const fetchMatchDetail = async () => {
  if (!recordId.value) {
    return;
  }
  detailLoading.value = true;
  try {
    const detail = await getMatchDetail({ recordId: recordId.value });
    matchDetail.value = detail || null;
  } catch {
    // 请求失败按无有效匹配处理，回落空状态
    matchDetail.value = null;
  } finally {
    detailLoading.value = false;
  }
};

// 全局 socket 推送的匹配结果事件：关闭等待弹窗并同步页面状态
// （结果文案/结果弹窗由全局 matchSocket 统一提示，这里只处理本页 UI）
const handleMatchWsEvent = (data: any) => {
  const type = data?.type || data?.eventType || data?.event;
  if (!type) return;
  if (type === WS_EVENT.MATCH_CONFIRMED) {
    // 对方已同意：结束等待，刷新匹配详情卡片
    uni.removeStorageSync('showWaitingPopup');
    uni.removeStorageSync(WAITING_DEADLINE_KEY);
    closeWaitingPopup();
    if (data?.recordId) {
      recordId.value = String(data.recordId);
    }
    fetchMatchDetail();
  } else if (
    type === WS_EVENT.MATCH_REJECTED ||
    type === WS_EVENT.MATCH_CANCELED ||
    type === WS_EVENT.MATCH_TIMEOUT
  ) {
    // 对方拒绝/取消/超时：结束等待并清理本页匹配记录与弹窗标记
    uni.removeStorageSync('showWaitingPopup');
    uni.removeStorageSync(WAITING_DEADLINE_KEY);
    closeWaitingPopup();
    recordId.value = '';
    matchDetail.value = null;
  }
};

onShow(() => {
  // TabBar 页面守卫：每次显示时检查登录和资料完善状态
  if (!isLogin()) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }
  if (!isProfileComplete()) {
    uni.reLaunch({ url: '/pages/profile/complete' });
    return;
  }

  // 等待对方同意弹窗：标记持久化在本地，用户未取消且未收到对方结果前一直保留，
  // 离开/刷新后回到本页仍展示；倒计时剩余时间也持久化，按截止时间戳恢复而非重置
  const shouldShow = uni.getStorageSync('showWaitingPopup');
  if (shouldShow) {
    showWaitingPopup.value = true;
    startWaitingCountdown();
  }

  // 读取匹配记录ID：优先内存，其次缓存；不删除缓存，整个匹配周期复用，终态（取消等）才清理
  const storedRecordId = uni.getStorageSync('recordId');
  console.log('storedRecordId', storedRecordId);
  if (storedRecordId) {
    recordId.value = storedRecordId;
  }
  if (recordId.value) {
    // 每次进入页面用匹配详情接口校验匹配状态，仍有效则显示等待弹窗
    fetchMatchDetail();
  }

  // 订阅全局匹配推送：等待弹窗期间收到对方同意/拒绝/取消/超时事件时自动更新
  if (!unsubscribeWs) {
    unsubscribeWs = onWsMessage(handleMatchWsEvent);
  }
});


onHide(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  if (unsubscribeWs) {
    unsubscribeWs();
    unsubscribeWs = null;
  }
});
</script>

<style lang="scss" scoped>
/* 全局容器 */
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}

/* 页面背景图 */
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.status-bar {
  height: var(--status-bar-height);
  width: 100%;
  position: relative;
  z-index: 1;
}

/* 顶部头像区域 - 精确间距与层级 */
.header-section {
  margin-top: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  z-index: 1;
}

.avatar-box {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  overflow: hidden;
  background-color: #eee;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.left-avatar {
  margin-right: 60rpx;
}

.right-avatar {
}

.right-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 60rpx;
}

/* 点击查看标签 - 精确位置与样式 */
.click-tag {
  position: absolute;
  bottom: 0rpx;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  color: #333;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 中间连接图标 - 精确尺寸与阴影 */
.link-icon-box {
  width: 60rpx;
  height: 60rpx;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
  z-index: 3;
}

/* 中间信息卡片 - 精确尺寸、毛玻璃与阴影 */
.info-card {
  margin-top: 80rpx;
  width: 640rpx;
  height: 240rpx;
  background: linear-gradient( 45deg, rgba(92,175,255,0.2) 0%, rgba(198,43,255,0.2) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  padding: 30rpx;
  box-sizing: border-box;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

/* 左侧时间区 - 精确间距与字体 */
.time-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 140rpx;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
  margin-right: 30rpx;
}

.date-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.time-text {
  color: #ffffff;
  font-size: 44rpx;
  font-weight: bold;
}

.divider {
  display: none;
}

/* 右侧详情区 - 精确布局与字体 */
.detail-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.icon-pin {
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  .icon-fire{
    width: 32rpx;
    height: 32rpx;
  }
}

.shop-name {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.value {
  color: #ffffff;
  font-size: 24rpx;
}

/* 取消按钮 - 精确位置与样式 */
.cancel-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 24rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

/* 无匹配数据空状态 */
.empty-state {
  margin-top: 160rpx;
  width: 640rpx;
  padding: 80rpx 40rpx;
  box-sizing: border-box;
  background: linear-gradient( 45deg, rgba(92,175,255,0.2) 0%, rgba(198,43,255,0.2) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.empty-icon {
  font-size: 90rpx;
  line-height: 1;
  margin-bottom: 30rpx;
}

.empty-text {
  color: #ffffff;
  font-size: 30rpx;
  margin-bottom: 50rpx;
}

.empty-btn {
  background: linear-gradient(270deg, #58b4ff 0%, #c927ff 100%);
  color: #ffffff;
  font-size: 28rpx;
  padding: 18rpx 60rpx;
  border-radius: 44rpx;
  box-shadow: 0 8rpx 24rpx rgba(88, 180, 255, 0.4);

  &:active {
    transform: scale(0.96);
  }
}

/* 等待对方同意弹窗 */
.waiting-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.waiting-popup {
  width: 560rpx;
  background: rgba(0, 0, 0, 0.8);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(20rpx);
}

.waiting-title {
  font-size: 34rpx;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 40rpx;
}

.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 50rpx;
}

.countdown-digit {
  width: 68rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: linear-gradient(180deg, #58B4FF 0%, #C927FF 100%);
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 600;
  margin: 0 8rpx;
}

.countdown-colon {
  font-size: 44rpx;
  color: #ffffff;
  font-weight: 600;
  margin: 0 8rpx;
}

.waiting-cancel {
  width: 320rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  background: #ffffff;
  color: #333333;
  font-size: 30rpx;
}
</style>