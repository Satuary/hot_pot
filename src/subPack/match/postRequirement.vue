<template>
  <view class="post-requirement-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <uni-icons type="left" size="22" color="#FFFFFF"></uni-icons>
      </view>
      <view class="nav-title">发布需求</view>
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
      <view class="section-title">年龄</view>
      <view class="age-selector">
        <view class="age-item" @click="showAgePicker('min')">
          <view class="age-text-wrap">
            <div class="age-num">{{ formData.ageMin }}</div>
            <div class="age-unit">岁</div>
          </view>
          <uni-icons type="right" size="20" color="#ffffff"></uni-icons>
        </view>
        <view class="age-item" @click="showAgePicker('max')">
          <view class="age-text-wrap">
            <div class="age-num">{{ formData.ageMax }}</div>
            <div class="age-unit">岁</div>
          </view>
          <uni-icons type="right" size="20" color="#fffff"></uni-icons>
        </view>
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
        <uni-icons type="right" size="20" color="#fffff"></uni-icons>
      </view>
    </view>

    <!-- 选择时间 -->
    <view class="section">
      <view class="section-title">选择时间</view>
      <picker
        mode="multiSelector"
        :range="dateTimeRange"
        :value="dateTimeValue"
        @change="onDateTimeChange"
      >
        <view class="selector-item">
          <text class="selector-text">{{ formattedDateTime }}</text>
          <uni-icons type="right" size="20" color="#fffff"></uni-icons>
        </view>
      </picker>
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

    <!-- 年龄选择器 -->
    <picker
      v-if="showPicker"
      mode="selector"
      :range="ageRange"
      :value="currentAgeIndex"
      @change="onAgeChange"
      @cancel="showPicker = false"
    >
      <view></view>
    </picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { postRequirement } from '@/api/api';

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

// 性别选项
const genderOptions = [
  { value: 'male', label: '男生', imgNormal: '/static/imgs/boy_d.png', imgActive: '/static/imgs/boys.png' },
  { value: 'female', label: '女生', imgNormal: '/static/imgs/girls_d.png', imgActive: '/static/imgs/girls.png' },
];

// 火锅类型
const hotpotTypes = ['重庆火锅', '潮汕火锅', '海鲜火锅', '小火锅'];

// 口味
const flavors = ['麻辣', '清汤', '番茄', '菌锅'];

// 动力
const motivations = ['尝鲜打卡', '解馋吃货', '轻松社交', '治愈心情'];

// 付费方式
const paymentMethods = [
  { value: 'me', label: '我请客' },
  { value: 'AA', label: 'AA' },
  { value: 'other', label: '对方请客' },
];

// 年龄选择器相关
const showPicker = ref(false);
const currentAgeType = ref<'min' | 'max'>('min');
const currentAgeIndex = ref(0);
const ageRange = Array.from({ length: 83 }, (_, i) => `${i + 18} 岁`);

// 日期时间选择器相关
const dateTimeValue = ref([0, 0, 0]);
const dateTimeRange = ref<string[][]>([[], [], []]);

// 格式化显示的日期时间
const formattedDateTime = computed(() => {
  if (!formData.value.dateTime) {
    // 默认显示
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    return `${year}-${month}-${day} 15:30`;
  }
  return formData.value.dateTime;
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 选择性别
const selectGender = (gender: string) => {
  formData.value.gender = gender;
};

// 显示年龄选择器
const showAgePicker = (type: 'min' | 'max') => {
  currentAgeType.value = type;
  const currentAge = type === 'min' ? formData.value.ageMin : formData.value.ageMax;
  currentAgeIndex.value = currentAge - 18;
  showPicker.value = true;
  
  // 触发选择器
  setTimeout(() => {
    showPicker.value = false;
    uni.showActionSheet({
      itemList: ageRange,
      success: (res) => {
        const selectedAge = res.tapIndex + 18;
        if (type === 'min') {
          formData.value.ageMin = selectedAge;
          if (formData.value.ageMin > formData.value.ageMax) {
            formData.value.ageMax = selectedAge;
          }
        } else {
          formData.value.ageMax = selectedAge;
          if (formData.value.ageMax < formData.value.ageMin) {
            formData.value.ageMin = selectedAge;
          }
        }
      },
    });
  }, 50);
};

// 年龄选择器变化
const onAgeChange = (e: any) => {
  const selectedAge = e.detail.value + 18;
  if (currentAgeType.value === 'min') {
    formData.value.ageMin = selectedAge;
  } else {
    formData.value.ageMax = selectedAge;
  }
  showPicker.value = false;
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

// 选择火锅店
const selectStore = () => {
  uni.navigateTo({
    url: '/subPack/match/storeSelection',
    events: {
      selectStore: (data: any) => {
        formData.value.storeId = data.id;
        formData.value.storeName = data.name;
      },
    },
  });
};

// 初始化日期时间选择器数据
const initDateTimeRange = () => {
  const dates: string[] = [];
  const hours: string[] = [];
  const minutes: string[] = [];

  // 生成未来30天的日期
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    dates.push(`${month}-${day}`);
  }

  // 生成小时 (00-23)
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, '0')}`);
  }

  // 生成分钟 (00, 15, 30, 45)
  minutes.push('00', '15', '30', '45');

  dateTimeRange.value = [dates, hours, minutes];

  // 设置默认值为今天 15:30
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const todayStr = `${currentMonth}-${currentDay}`;
  const todayIndex = dates.indexOf(todayStr);
  
  dateTimeValue.value = [
    todayIndex >= 0 ? todayIndex : 0,
    15, // 15点
    2, // 30分
  ];
};


// 日期时间选择器变化
const onDateTimeChange = (e: any) => {
  const [dateIndex, hourIndex, minuteIndex] = e.detail.value;
  const dateStr = dateTimeRange.value[0][dateIndex];
  const hour = dateTimeRange.value[1][hourIndex];
  const minute = dateTimeRange.value[2][minuteIndex];
  
  // 解析月份和日期
  const [month, day] = dateStr.split('-').map(Number);
  
  // 计算正确的年份：如果月份小于当前月份，说明跨年了
  const now = new Date();
  let year = now.getFullYear();
  if (month < now.getMonth() + 1) {
    year += 1;
  }
  
  formData.value.dateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${hour}:${minute}`;
};

// 提交需求
const submitRequirement = async () => {
  // 验证必填项
  if (!formData.value.storeId) {
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

  try {
    uni.showLoading({
      title: '提交中...',
    });

    const params = {
      gender: formData.value.gender,
      ageMin: formData.value.ageMin,
      ageMax: formData.value.ageMax,
      hotpotType: formData.value.hotpotType,
      flavor: formData.value.flavor,
      motivation: formData.value.motivation,
      storeId: formData.value.storeId,
      storeName: formData.value.storeName,
      dateTime: formData.value.dateTime,
      paymentMethod: formData.value.paymentMethod,
    };

    // 这里调用实际的 API
    // const res = await postRequirement(params);
    
    uni.hideLoading();
    uni.showToast({
      title: '发布成功',
      icon: 'success',
    });

    // 跳转到匹配页面
    setTimeout(() => {
      uni.navigateTo({
        url: '/subPack/match/matching',
      });
    }, 1500);
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error.message || '发布失败',
      icon: 'none',
    });
  }
};

onMounted(() => {
  initDateTimeRange();
  // 设置默认日期时间显示
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
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
  height: 88rpx;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
  padding-top: var(--status-bar-height, 0px);
  z-index: 100;

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

    :deep(uni-icons) {
      position: absolute;
      right: 32rpx;
    }

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
}

// 标签列表
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .tag-item {
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
</style>
