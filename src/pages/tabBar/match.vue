<template>
  <view class="match-page">
    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-inner">
        <view class="location-picker" @click="chooseLocation">
          <text class="pin">📍</text>
          <text class="city">{{ location }}</text>
          <text class="arrow">▼</text>
        </view>
        
        <view class="nav-right">
          <view class="notice-btn" @click="showNotification">
            <text class="bell">🔔</text>
            <view class="dot"></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 主内容 -->
    <scroll-view scroll-y class="main-scroll" :style="{ paddingTop: (statusBarHeight + 88) + 'px' }">
      <!-- 用户状态卡 -->
      <view class="user-status">
        <view class="user-left">
          <image
            :src="userInfo.avatar || 'https://picsum.photos/200'"
            class="user-avatar"
            mode="aspectFill"
          ></image>
          <view class="user-meta">
            <text class="user-name">{{ userInfo.nickname || '火锅爱好者' }}</text>
            <view class="user-stats">
              <text class="stat-item">{{ userInfo.matchCount || 0 }} 次</text>
              <text class="divider">·</text>
              <text class="stat-item balance">¥{{ userInfo.balance || 0 }}</text>
            </view>
          </view>
        </view>
        <view class="recharge-btn" @click="goToRecharge">
          <text class="btn-label">充值</text>
        </view>
      </view>
      
      <!-- 匹配模式 -->
      <view class="match-modes">
        <view class="section-head">
          <text class="head-title">选择模式</text>
        </view>
        
        <view class="mode-grid">
          <view
            class="mode-item"
            :class="{ selected: matchMode === 'precise' }"
            @click="matchMode = 'precise'"
          >
            <text class="mode-emoji">🎯</text>
            <text class="mode-label">精准</text>
            <text class="mode-hint">按偏好匹配</text>
            <view v-if="matchMode === 'precise'" class="check-mark">✓</view>
          </view>
          
          <view
            class="mode-item"
            :class="{ selected: matchMode === 'blind' }"
            @click="matchMode = 'blind'"
          >
            <text class="mode-emoji">🎁</text>
            <text class="mode-label">盲盒</text>
            <text class="mode-hint">随机惊喜</text>
            <view v-if="matchMode === 'blind'" class="check-mark">✓</view>
          </view>
        </view>
      </view>
      
      <!-- CTA -->
      <view class="cta-section">
        <view class="cta-btn" @click="goToPostRequirement">
          <text class="cta-text">开始拼桌</text>
          <text class="cta-arrow">→</text>
        </view>
      </view>
      
      <!-- 最近记录 -->
      <view class="recent-section">
        <view class="section-head">
          <text class="head-title">最近</text>
          <text class="head-action" @click="goToOrderList">全部 →</text>
        </view>
        
        <view v-if="recentMatches.length > 0" class="recent-list">
          <view
            v-for="match in recentMatches"
            :key="match.id"
            class="recent-card"
            @click="goToOrderDetail(match.id)"
          >
            <view class="card-top">
              <view class="status-badge" :class="'status-' + match.status">
                {{ getStatusText(match.status) }}
              </view>
              <text class="card-time">{{ formatTime(match.createTime) }}</text>
            </view>
            
            <view class="card-main">
              <view class="card-info">
                <text class="store-title">{{ match.storeName }}</text>
                <text class="match-meta">{{ match.time }} · {{ match.peopleCount }}人</text>
              </view>
              
              <image
                v-if="match.matchedUser"
                :src="match.matchedUser.avatar"
                class="partner-avatar"
                mode="aspectFill"
              ></image>
            </view>
          </view>
        </view>
        
        <view v-else class="empty-box">
          <text class="empty-emoji">🍲</text>
          <text class="empty-text">还没有拼桌记录</text>
          <text class="empty-hint">开始第一次拼桌吧</text>
        </view>
      </view>
      
      <view class="bottom-pad"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserInfo } from '@/utils/auth';
import { appState } from '@/utils/store';

const statusBarHeight = ref(0);
const location = ref('上海 闵行');
const matchMode = ref('precise');
const userInfo = ref(getUserInfo() || {});
const recentMatches = ref<any[]>([]);

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
  
  // 加载最近匹配记录
  loadRecentMatches();
});

// 加载最近匹配 - 使用假数据
const loadRecentMatches = async () => {
  // 模拟数据
  recentMatches.value = [
    {
      id: 'order_001',
      status: 'paid',
      createTime: new Date(Date.now() - 3600000).toISOString(),
      storeName: '海底捞火锅(闵行店)',
      time: '今天 18:00',
      peopleCount: 2,
      amount: 298,
      matchedUser: {
        id: 'user_101',
        nickname: '火锅小姐姐',
        avatar: 'https://picsum.photos/100',
      },
    },
    {
      id: 'order_002',
      status: 'pending',
      createTime: new Date(Date.now() - 7200000).toISOString(),
      storeName: '小龙坎老火锅',
      time: '明天 19:00',
      peopleCount: 2,
      amount: 268,
      matchedUser: {
        id: 'user_102',
        nickname: '麻辣爱好者',
        avatar: 'https://picsum.photos/101',
      },
    },
    {
      id: 'order_003',
      status: 'completed',
      createTime: new Date(Date.now() - 86400000).toISOString(),
      storeName: '哥老官重庆美蛙鱼头',
      time: '昨天 20:00',
      peopleCount: 2,
      amount: 328,
      matchedUser: {
        id: 'user_103',
        nickname: '吃货达人',
        avatar: 'https://picsum.photos/102',
      },
    },
  ];
};

// 选择位置
const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.name || res.address;
    },
  });
};

// 显示通知
const showNotification = () => {
  uni.navigateTo({
    url: '/subPack/me/notifications',
  });
};

// 去充值
const goToRecharge = () => {
  uni.navigateTo({
    url: '/subPack/me/recharge',
  });
};

// 发布匹配需求
const goToPostRequirement = () => {
  appState.matchMode = matchMode.value as any;
  uni.navigateTo({
    url: '/subPack/match/postRequirement',
  });
};

// 查看订单列表
const goToOrderList = () => {
  uni.switchTab({
    url: '/pages/tabBar/view',
  });
};

// 查看订单详情
const goToOrderDetail = (id: string) => {
  uni.navigateTo({
    url: `/subPack/me/orderDetail?id=${id}`,
  });
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    paid: '已支付',
    completed: '已完成',
    refunded: '已退款',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${Math.floor(diff / 86400000)}天前`;
};
</script>

<style lang="scss" scoped>
.match-page {
  min-height: 100vh;
  background: #0D0D0D;
}

// 导航栏
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  
  .navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 40rpx;
  }
  
  .location-picker {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .pin {
      font-size: 28rpx;
    }
    
    .city {
      font-size: 30rpx;
      font-weight: 600;
      color: #FFFFFF;
    }
    
    .arrow {
      font-size: 18rpx;
      color: rgba(255, 255, 255, 0.4);
      transform: scale(0.8);
    }
  }
  
  .nav-right {
    .notice-btn {
      position: relative;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .bell {
        font-size: 36rpx;
      }
      
      .dot {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        width: 12rpx;
        height: 12rpx;
        background: #FF4D4F;
        border-radius: 50%;
        border: 2rpx solid #0D0D0D;
      }
    }
  }
}

// 主滚动区
.main-scroll {
  height: 100vh;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

// 用户状态卡
.user-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx 40rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
  
  .user-left {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }
  
  .user-avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 107, 61, 0.3);
  }
  
  .user-meta {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }
  
  .user-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #FFFFFF;
  }
  
  .user-stats {
    display: flex;
    align-items: center;
    gap: 12rpx;
    
    .stat-item {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.4);
      
      &.balance {
        color: #FFB946;
      }
    }
    
    .divider {
      font-size: 20rpx;
      color: rgba(255, 255, 255, 0.2);
    }
  }
  
  .recharge-btn {
    padding: 16rpx 32rpx;
    background: rgba(255, 107, 61, 0.1);
    border-radius: 20rpx;
    
    .btn-label {
      font-size: 26rpx;
      color: #FF6B3D;
      font-weight: 500;
    }
    
    &:active {
      background: rgba(255, 107, 61, 0.15);
    }
  }
}

// 匹配模式
.match-modes {
  margin: 0 40rpx 40rpx;
  
  .section-head {
    margin-bottom: 28rpx;
    
    .head-title {
      font-size: 28rpx;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .mode-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
  }
  
  .mode-item {
    position: relative;
    padding: 36rpx 28rpx;
    background: rgba(255, 255, 255, 0.03);
    border: 1rpx solid rgba(255, 255, 255, 0.08);
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    transition: all 0.3s;
    
    &:active {
      transform: scale(0.97);
    }
    
    &.selected {
      background: rgba(255, 107, 61, 0.08);
      border-color: rgba(255, 107, 61, 0.3);
    }
    
    .mode-emoji {
      font-size: 56rpx;
    }
    
    .mode-label {
      font-size: 28rpx;
      font-weight: 600;
      color: #FFFFFF;
    }
    
    .mode-hint {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.3);
    }
    
    .check-mark {
      position: absolute;
      top: 12rpx;
      right: 12rpx;
      width: 32rpx;
      height: 32rpx;
      background: #FF6B3D;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20rpx;
      color: #FFFFFF;
    }
  }
}

// CTA按钮
.cta-section {
  margin: 0 40rpx 60rpx;
  
  .cta-btn {
    height: 96rpx;
    border-radius: 48rpx;
    background: linear-gradient(135deg, #FF6B3D 0%, #E5533D 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 61, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 36rpx;
    transition: all 0.2s;
    
    &:active {
      transform: scale(0.97);
    }
    
    .cta-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #FFFFFF;
    }
    
    .cta-arrow {
      font-size: 40rpx;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 300;
    }
  }
}

// 最近记录
.recent-section {
  margin: 0 40rpx;
  
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28rpx;
    
    .head-title {
      font-size: 28rpx;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .head-action {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  
  .recent-card {
    padding: 28rpx;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 20rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s;
    
    &:active {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;
    }
    
    .status-badge {
      padding: 8rpx 20rpx;
      border-radius: 16rpx;
      font-size: 22rpx;
      font-weight: 500;
      
      &.status-pending {
        background: rgba(255, 107, 61, 0.12);
        color: #FF6B3D;
      }
      
      &.status-paid {
        background: rgba(82, 196, 26, 0.12);
        color: #52C41A;
      }
      
      &.status-completed {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.4);
      }
    }
    
    .card-time {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.3);
    }
    
    .card-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
    }
    
    .store-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #FFFFFF;
    }
    
    .match-meta {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .partner-avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      border: 2rpx solid rgba(255, 255, 255, 0.1);
    }
  }
  
  .empty-box {
    padding: 100rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20rpx;
    
    .empty-emoji {
      font-size: 100rpx;
      opacity: 0.2;
    }
    
    .empty-text {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.3);
    }
    
    .empty-hint {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.2);
    }
  }
}

.bottom-pad {
  height: 60rpx;
}
</style>
