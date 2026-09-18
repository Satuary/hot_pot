<template>
  <view class="post-requirement-page">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
        </view>
        <view class="nav-title">发布需求</view>
      </view>
    </view>

    <!-- 性别选择 -->
    <view class="section">
      <view class="section-title">性别</view>
      <view class="gender-selector">
        <view
          v-for="item in genderOptions"
          :key="item.value"
          class="gender-item"
          :class="{ active: formData.gender === item.value }"
          @click="selectGender(item.value)"
        >
          <image
            class="gender-img"
            :src="formData.gender === item.value ? item.imgActive : item.imgNormal"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>

    <!-- 年龄范围 -->
    <view class="section">
      <view class="section-title">年龄范围</view>
      <view class="age-selector" @click="showAgePicker">
        <view class="age-item">
          <view class="age-text-wrap">
            <div class="age-num">{{ formData.ageMin }}</div>
            <div class="age-unit">岁</div>
          </view>
        </view>
        <view class="age-separator">—</view>
        <view class="age-item">
          <view class="age-text-wrap">
            <div class="age-num">{{ formData.ageMax }}</div>
            <div class="age-unit">岁</div>
          </view>
        </view>
        <uni-icons type="right" size="20" color="#ffffff"></uni-icons>
      </view>
    </view>

    <!-- 火锅类型 -->
    <view class="section">
      <view class="section-title">火锅类型</view>
      <view class="tag-list">
        <view
          v-for="item in hotpotTypes"
          :key="item"
          class="tag-item"
          :class="{ active: formData.hotpotType === item }"
          @click="selectHotpotType(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 口味 -->
    <view class="section">
      <view class="section-title">口味</view>
      <view class="tag-list">
        <view
          v-for="item in flavors"
          :key="item"
          class="tag-item"
          :class="{ active: formData.flavor === item }"
          @click="selectFlavor(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 动力 -->
    <view class="section">
      <view class="section-title">动力</view>
      <view class="tag-list">
        <view
          v-for="item in motivations"
          :key="item"
          class="tag-item"
          :class="{ active: formData.motivation === item }"
          @click="selectMotivation(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 选择火锅店 -->
    <view class="section">
      <view class="section-title">选择火锅店</view>
      <view class="selector-item" @click="selectStore">
        <text class="selector-text" :class="{ placeholder: !formData.storeName }">
          {{ formData.storeName || '请选择火锅店' }}
        </text>
        <uni-icons type="right" size="20" color="#ffffff"></uni-icons>
      </view>
    </view>

    <!-- 选择时间 -->
    <view class="section">
      <view class="section-title">选择时间</view>
      <view class="selector-item" @click="showDateTimePicker">
        <text class="selector-text">{{ formattedDateTime }}</text>
        <uni-icons type="right" size="20" color="#ffffff"></uni-icons>
      </view>
    </view>

    <!-- 付费方式 -->
    <view class="section">
      <view class="section-title">付费方式</view>
      <view class="tag-list">
        <view
          v-for="item in paymentMethods"
          :key="item.value"
          class="tag-item"
          :class="{ active: formData.paymentMethod === item.value }"
          @click="selectPaymentMethod(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <!-- 开始匹配按钮 -->
    <view class="submit-btn" @click="submitRequirement">
      <view class="submit-text">开始匹配</view>
    </view>

    <!-- 年龄选择器弹窗 -->
    <view v-if="agePickerVisible" class="mask age-mask" @click="closeAgePicker">
      <view class="picker-modal age-picker-modal" @click.stop>
        <view class="picker-modal-title">选择年龄范围</view>
        <view class="picker-body age-picker-body">
          <picker-view
            class="picker-view age-picker-view"
            :value="agePickerValue"
            indicator-style="height: 88rpx;"
            mask-style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)), linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)); background-position: top, bottom;"
            @change="onAgePickerChange"
          >
            <picker-view-column>
              <view v-for="age in ageRangeValues" :key="age" class="picker-view-item age-picker-item">{{ age }}岁</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="age in ageRangeValues" :key="age" class="picker-view-item age-picker-item">{{ age }}岁</view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="picker-actions age-picker-actions">
          <view class="picker-btn cancel" @click="closeAgePicker">取消</view>
          <view class="picker-btn confirm" @click="confirmAge">确认</view>
        </view>
      </view>
    </view>

    <!-- 日期时间选择器弹窗 -->
    <view v-if="dateTimePickerVisible" class="mask date-mask" @click="closeDateTimePicker">
      <view class="picker-modal date-picker-modal" @click.stop>
        <view class="picker-modal-title">选择时间</view>
        <view class="date-picker-body">
          <!-- 左侧：今天、明天、后天 -->
          <view class="date-left">
            <picker-view
              class="date-picker-view"
              :value="dateTypePickerValue"
              indicator-style="height: 88rpx;"
              mask-style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)), linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)); background-position: top, bottom;"
              @change="onDateTypeChange"
            >
              <picker-view-column>
                <view v-for="item in dateOptions" :key="item.value" class="picker-view-item date-picker-item">
                  {{ item.label }}
                </view>
              </picker-view-column>
            </picker-view>
          </view>
          <!-- 分隔线 -->
          <view class="date-divider"></view>
          <!-- 右侧：时:分选择器 -->
          <view class="date-right">
            <picker-view
              class="time-picker-view"
              :value="timePickerValue"
              indicator-style="height: 88rpx;"
              mask-style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)), linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)); background-position: top, bottom;"
              @change="onTimePickerChange"
            >
              <picker-view-column>
                <view v-for="h in hourOptions" :key="h" class="picker-view-item time-picker-item">{{ h }}时</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="m in minuteOptions" :key="m" class="picker-view-item time-picker-item">{{ m }}分</view>
              </picker-view-column>
            </picker-view>
          </view>
        </view>
        <view class="picker-actions date-picker-actions">
          <view class="picker-btn cancel" @click="closeDateTimePicker">取消</view>
          <view class="picker-btn confirm" @click="confirmDateTime">确认</view>
        </view>
      </view>
    </view>

    <!-- 店铺选择弹框 -->
    <StoreSelectPopup
      v-model:visible="storePopupVisible"
      :stores="storeList"
      :loading="storeLoading"
      :loading-more="storeLoadingMore"
      :has-more="storeHasMore"
      @select="onStoreSelect"
      @load-more="loadMoreStores"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { postRequirement } from '@/api/api';
import { mockStores } from '@/utils/store';
import type { Store } from '@/utils/store';
import { getUserLocation, searchNearbyHotPotStore } from '@/utils/map';
import type { UserLocation } from '@/utils/map';
import {
  genderOptions,
  hotpotTypes,
  flavorOptions,
  motivations,
  paymentMethods,
  genderMap,
  payTypeMap,
  flavorToCodeStr,
} from '@/config/matchOptions';
import StoreSelectPopup from './components/StoreSelectPopup.vue';

// 状态栏高度
const statusBarHeight = ref(0);

// 店铺选择弹框
const storePopupVisible = ref(false);
const storeList = ref<Store[]>([]);
const storeLoading = ref(false);
const storeLoadingMore = ref(false);
// 当前页码与总条数（高德 count 字段）
const storePage = ref(1);
const storeTotal = ref(0);
// 缓存定位，供翻页复用
const storeLocation = ref<UserLocation | null>(null);
// 是否还有下一页
const storeHasMore = computed(() => storeList.value.length < storeTotal.value);
// 当前选中的店铺（用于提交 shop 字段）
const selectedStore = ref<Store | null>(null);

// 表单数据
const formData = ref({
  gender: 'male',
  ageMin: 18,
  ageMax: 38,
  hotpotType: '重庆火锅',
  flavor: '麻辣',
  motivation: '尝鲜打卡',
  storeId: '',
  storeName: '',
  dateTime: '',
  paymentMethod: 'me',
});

// 口味枚举数组（用于标签渲染）—— 配置文件中 flavors 是 1 起的数组，此处取有效项
const flavors = flavorOptions;

// 年龄选择器弹窗相关
const agePickerVisible = ref(false);
const tempAgeMin = ref(18);
const tempAgeMax = ref(38);
const ageRangeValues = Array.from({ length: 83 }, (_, i) => i + 18);
const agePickerValue = computed(() => [
  ageRangeValues.findIndex(v => v === tempAgeMin.value),
  ageRangeValues.findIndex(v => v === tempAgeMax.value),
]);

// 日期时间选择器弹窗相关
const dateTimePickerVisible = ref(false);
const tempDateType = ref('today'); // 'today' | 'tomorrow' | 'afterTomorrow'
const tempHour = ref(15);
const tempMinute = ref('30');

// 日期选项：今天、明天、后天
const dateOptions = [
  { value: 'today', label: '今天' },
  { value: 'tomorrow', label: '明天' },
  { value: 'afterTomorrow', label: '后天' },
];

// 小时选项
const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
// 分钟选项
const minuteOptions = ['00', '10', '20', '30', '40', '50'];

// 日期类型选择器当前值索引
const dateTypePickerValue = computed(() => {
  const idx = dateOptions.findIndex(item => item.value === tempDateType.value);
  return [idx >= 0 ? idx : 0];
});

// 时间选择器当前值索引
const timePickerValue = computed(() => {
  const hourIdx = tempHour.value;
  const minIdx = minuteOptions.indexOf(tempMinute.value);
  return [hourIdx, minIdx >= 0 ? minIdx : 0];
});

// 格式化显示的日期时间：年月日 时:分
const formattedDateTime = computed(() => {
  if (formData.value.dateTime) {
    const [datePart, timePart] = formData.value.dateTime.split(' ');
    const [y, m, d] = datePart.split('-');
    return `${y}年${parseInt(m)}月${parseInt(d)}日 ${timePart}`;
  }
  // 默认显示
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日 15:30`;
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 选择性别
const selectGender = (gender: string) => {
  formData.value.gender = gender;
};

// 显示年龄选择器弹窗
const showAgePicker = () => {
  tempAgeMin.value = formData.value.ageMin;
  tempAgeMax.value = formData.value.ageMax;
  agePickerVisible.value = true;
};

// 关闭年龄选择器弹窗
const closeAgePicker = () => {
  agePickerVisible.value = false;
};

// 年龄选择器滚动变化
const onAgePickerChange = (e: any) => {
  const [minIdx, maxIdx] = e.detail.value;
  tempAgeMin.value = ageRangeValues[minIdx];
  tempAgeMax.value = ageRangeValues[maxIdx];
};

// 确认年龄选择
const confirmAge = () => {
  // 确保最小值不大于最大值
  if (tempAgeMin.value > tempAgeMax.value) {
    [tempAgeMin.value, tempAgeMax.value] = [tempAgeMax.value, tempAgeMin.value];
  }
  formData.value.ageMin = tempAgeMin.value;
  formData.value.ageMax = tempAgeMax.value;
  agePickerVisible.value = false;
};

// 选择火锅类型
const selectHotpotType = (type: string) => {
  formData.value.hotpotType = type;
};

// 选择口味
const selectFlavor = (flavor: string) => {
  formData.value.flavor = flavor;
};

// 选择动力
const selectMotivation = (motivation: string) => {
  formData.value.motivation = motivation;
};

// 选择付费方式
const selectPaymentMethod = (method: string) => {
  formData.value.paymentMethod = method;
};

// 请求指定页的附近火锅店（page=1 为首屏/刷新，page>1 为加载更多，数据自动拼接）
const fetchStorePage = async (page: number) => {
  if (!storeLocation.value) return;

  if (page === 1) {
    storeLoading.value = true;
  } else {
    storeLoadingMore.value = true;
  }

  try {
    const { list, total } = await searchNearbyHotPotStore(storeLocation.value, page);
    storeTotal.value = total;

    if (page === 1) {
      storeList.value = list;
      if (list.length === 0) {
        uni.showToast({ title: '附近暂无火锅店', icon: 'none' });
      }
      console.log('通过高德地图周边搜索 API 获取附近火锅店(第1页)===', list);
    } else {
      // 按 id 去重后拼接，避免分页边界数据重复
      const existIds = new Set(storeList.value.map((s) => s.id));
      const merged = [...storeList.value, ...list.filter((s) => !existIds.has(s.id))];
      storeList.value = merged;
      console.log(`加载更多火锅店(第${page}页)===`, list, '累计:', merged.length);
    }
    storePage.value = page;
  } catch (err: any) {
    console.error('获取附近火锅店失败:', err);
    if (page === 1) {
      uni.showToast({ title: err.message || '获取附近火锅店失败，使用默认数据', icon: 'none' });
      // 高德 API 不可用时降级使用 mock 数据
      storeList.value = mockStores;
      storeTotal.value = mockStores.length;
      storePage.value = 1;
    } else {
      uni.showToast({ title: '加载更多失败', icon: 'none' });
    }
  } finally {
    storeLoading.value = false;
    storeLoadingMore.value = false;
  }
};

// 选择火锅店（通过高德地图 API 获取附近火锅店）
const selectStore = async () => {
  storePopupVisible.value = true;
  if (storeList.value.length) return;

  try {
    // 1. 使用wx api获取用户当前经纬度
    const location = await getUserLocation();
    // 测试用，固定位置在位中心84197号
    location.longitude = 113.24;
    location.latitude = 23.11;
    // 缓存定位，供后续翻页复用
    storeLocation.value = location;
    // 2. 拉取第 1 页
    await fetchStorePage(1);
  } catch (err: any) {
    console.error('定位失败:', err);
    uni.showToast({ title: err.message || '定位失败，使用默认数据', icon: 'none' });
    // 定位失败时降级使用 mock 数据
    storeList.value = mockStores;
    storeTotal.value = mockStores.length;
    storePage.value = 1;
  }
};

// 滚动到底部，加载下一页并拼接
const loadMoreStores = () => {
  if (storeLoadingMore.value || !storeHasMore.value || !storeLocation.value) return;
  fetchStorePage(storePage.value + 1);
};

// 选中店铺
const onStoreSelect = (store: Store) => {
  formData.value.storeId = store.id;
  formData.value.storeName = store.name;
  selectedStore.value = store;
};

// 显示日期时间选择器弹窗
const showDateTimePicker = () => {
  // 从当前 formData.dateTime 解析出日期类型和时分
  if (formData.value.dateTime) {
    const [dateStr, timeStr] = formData.value.dateTime.split(' ');
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':');
    
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const targetStr = `${y}-${m}-${d}`;
    const diffDays = Math.floor((new Date(targetStr).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) tempDateType.value = 'today';
    else if (diffDays === 1) tempDateType.value = 'tomorrow';
    else tempDateType.value = 'afterTomorrow';
    
    tempHour.value = parseInt(h);
    tempMinute.value = min;
  } else {
    tempDateType.value = 'today';
    tempHour.value = 15;
    tempMinute.value = '30';
  }
  dateTimePickerVisible.value = true;
};

// 关闭日期时间选择器弹窗
const closeDateTimePicker = () => {
  dateTimePickerVisible.value = false;
};

// 日期类型选择器滚动变化
const onDateTypeChange = (e: any) => {
  const idx = e.detail.value[0];
  tempDateType.value = dateOptions[idx].value;
};

// 时间选择器滚动变化
const onTimePickerChange = (e: any) => {
  const [hourIdx, minIdx] = e.detail.value;
  tempHour.value = hourIdx;
  tempMinute.value = minuteOptions[minIdx];
};

// 确认日期时间
const confirmDateTime = () => {
  const date = new Date();
  if (tempDateType.value === 'tomorrow') date.setDate(date.getDate() + 1);
  if (tempDateType.value === 'afterTomorrow') date.setDate(date.getDate() + 2);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(tempHour.value).padStart(2, '0');
  const minute = tempMinute.value;
  
  formData.value.dateTime = `${year}-${month}-${day} ${hour}:${minute}`;
  dateTimePickerVisible.value = false;
};

// 提交需求
const submitRequirement = async () => {
  // 火锅店必选
  if (!formData.value.storeName) {
    uni.showToast({
      title: '请选择火锅店',
      icon: 'none',
    });
    return;
  }

  if (!formData.value.dateTime) {
    uni.showToast({
      title: '请选择时间',
      icon: 'none',
    });
    return;
  }

  // 见面时间必须晚于当前时间（dateTime 格式 "YYYY-MM-DD HH:mm"）
  const [dateStr, timeStr] = formData.value.dateTime.split(' ');
  const meetingTs = new Date(`${dateStr}T${timeStr}:00`).getTime();
  if (Number.isNaN(meetingTs) || meetingTs <= Date.now()) {
    uni.showToast({
      title: '选择时间需大于当前时间',
      icon: 'none',
    });
    return;
  }

  try {
    uni.showLoading({
      title: '提交中...',
    });

    const shop:
      | {
          id: string;
          name: string;
          address: string;
          distance: string;
          image: string;
          rating: string;
        }
      | Record<string, never> = selectedStore.value
      ? {
          id: selectedStore.value.id,
          name: selectedStore.value.name,
          address: selectedStore.value.address,
          distance: selectedStore.value.distance,
          image: selectedStore.value.image,
          rating: String(selectedStore.value.rating),
        }
      : {};

    const params = {
      gender: String(genderMap[formData.value.gender] ?? 1),
      ageRange: `${formData.value.ageMin},${formData.value.ageMax}`,
      matchType: '0', // 0精准 1快速匹配
      hotpotType: String(hotpotTypes.indexOf(formData.value.hotpotType)),
      taste: flavorToCodeStr(formData.value.flavor),
      motivation: String(motivations.indexOf(formData.value.motivation)),
      shop,
      meetingTime: formData.value.dateTime,
      payType: String(payTypeMap[formData.value.paymentMethod] ?? ''),
    };

    const res = await postRequirement(params);
    // demandId 为需求ID，仅用于拉推荐/发起匹配，通过 URL 传给匹配页；
    // 它不是匹配记录id，匹配 recordId 由 mini/match/create 返回，切勿写入 recordId 缓存
    const demandId = res?.demandId || '';

    uni.hideLoading();
    uni.showToast({
      title: '发布成功',
      icon: 'success',
    });

    // 跳转到匹配成功页面（携带需求ID，用于拉取推荐用户）
    setTimeout(() => {
      uni.redirectTo({
        url: `/subPack/match/matchSuccess?demandId=${encodeURIComponent(demandId)}`,
      });
    }, 1500);
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error.msg || '发布失败',
      icon: 'none',
    });
  }
};

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;
  
  // 设置默认日期时间显示
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  formData.value.dateTime = `${year}-${month}-${day} 15:30`;
});
</script>

<style lang="scss" scoped>
.post-requirement-page {
  min-height: 100vh;
  background: #000;
  padding-bottom: 200rpx;
}

// 导航栏
.nav-bar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: #000;
  z-index: 100;

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    padding: 0 30rpx;
    position: relative;
  }

  .nav-back {
    position: absolute;
    left: 20rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-title {
    font-size: 34rpx;
    color: #fff;
    font-weight: 500;
  }
}

.section {
  margin-bottom: 56rpx;
  padding: 0 30rpx;

  .section-title {
    font-size: 30rpx;
    color: #999999;
    margin-bottom: 28rpx;
    font-weight: 400;
  }
}

// 性别选择器
.gender-selector {
  display: flex;
  gap: 24rpx;
  justify-content: flex-start;

  .gender-item {
    width: 194rpx;
    height: 76rpx;
    

    .gender-img {
      width: 100%;
      height: 100%;
    }
  }
}

// 年龄选择器
.age-selector {
  display: flex;
  gap: 24rpx;
  position: relative;

  .age-item {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 300rpx;
    height: 88rpx;
    padding: 0 60rpx;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
    border-radius: 152rpx;
    border: 1rpx solid #ffffff;

    .age-text-wrap {
      display: flex;
      align-items: center;

      .age-num {
        font-size: 32rpx;
        color: #ffffff;
        margin-right: 10rpx;
      }

      .age-unit {
        font-size: 30rpx;
        color: #929292;
      }
    }
  }

  .age-separator {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.5);
    align-self: center;
    flex-shrink: 0;
  }

  > :deep(uni-icons) {
    position: absolute;
    right: 32rpx;
    top: 50%;
    transform: translateY(-50%);
  }
}

// 标签列表
.tag-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 20rpx;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  .tag-item {
    flex-shrink: 0;
    padding: 18rpx 36rpx;
    background: rgba(0,0,0,0.9);
    border-radius: 48rpx;
    font-size: 28rpx;
    color: #929292;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    white-space: nowrap;
    border: solid 1rpx;

    &.active {  
      color: #fff;
      background: linear-gradient( 180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%);
      border-radius: 152rpx 152rpx 152rpx 152rpx;
      border: 1rpx solid;
    }
  }
}

// 选择器项
.selector-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 60rpx;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 152rpx;
  border: 1rpx solid #ffffff;

  .selector-text {
    font-size: 30rpx;
    color: #fff;

    &.placeholder {
      color: #929292;
    }
  }

}

// 提交按钮
.submit-btn {
  width: 650rpx;
  height: 88rpx;
  margin: 0 auto;
  background: linear-gradient(270deg, #58B4FF 0%, #C927FF 100%);
  border-radius: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(91, 156, 252, 0.4);

  .submit-text {
    font-size: 34rpx;
    color: #fff;
    font-weight: 500;
  }
}

// 弹窗遮罩
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 年龄选择器弹窗 - 居中弹框模式
.age-picker-modal {
  width: 620rpx;
  background: #000;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  padding: 40rpx 32rpx;

  .picker-modal-title {
    font-size: 30rpx;
    color: #999999;
    text-align: center;
    padding-bottom: 24rpx;
    font-weight: 400;
  }

  .picker-body {
    height: 440rpx;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 100%);
    border-radius: 24rpx;
  }

  .picker-view {
    width: 100%;
    height: 100%;
  }

  .picker-view-item {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #ffffff;
    height: 88rpx;
  }

  .picker-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24rpx;
    gap: 24rpx;

    .picker-btn {
      flex: 1;
      height: 76rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 152rpx;
      font-size: 30rpx;
      font-weight: 400;

      &.cancel {
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
        border: 1rpx solid #ffffff;
        color: #ffffff;
      }

      &.confirm {
        background: linear-gradient(270deg, #58B4FF 0%, #C927FF 100%);
        color: #ffffff;
      }
    }
  }
}

// 日期时间选择器弹窗
.date-picker-modal {
  width: 660rpx;
  background: #000;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  padding: 40rpx 32rpx;

  .picker-modal-title {
    font-size: 30rpx;
    color: #999999;
    text-align: center;
    padding-bottom: 24rpx;
    font-weight: 400;
  }

  .date-picker-body {
    display: flex;
    height: 440rpx;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 100%);
    border-radius: 24rpx;

    .date-left {
      flex: 1;
      overflow: hidden;

      .date-picker-view {
        width: 100%;
        height: 100%;
      }

      .date-picker-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: #ffffff;
        height: 88rpx;
      }
    }

    .date-divider {
      width: 1rpx;
      background: rgba(255, 255, 255, 0.15);
      margin: 24rpx 0;
    }

    .date-right {
      flex: 1;
      overflow: hidden;

      .time-picker-view {
        width: 100%;
        height: 100%;
      }

      .time-picker-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: #ffffff;
        height: 88rpx;
      }
    }
  }

  .picker-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24rpx;
    gap: 24rpx;

    .picker-btn {
      flex: 1;
      height: 76rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 152rpx;
      font-size: 30rpx;
      font-weight: 400;

      &.cancel {
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
        border: 1rpx solid #ffffff;
        color: #ffffff;
      }

      &.confirm {
        background: linear-gradient(270deg, #58B4FF 0%, #C927FF 100%);
        color: #ffffff;
      }
    }
  }
}
</style>
