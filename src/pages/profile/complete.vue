<template>
  <view class="page-wrap">
    <!-- Header -->
    <view class="header" :style="headerStyle">
      <view class="back" @click="goBack">
        <text class="iconfont icon-fanhui"></text>
      </view>
      <text class="title">完善资料</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view scroll-y class="main">
      <!-- 性别 -->
      <view class="form-group">
        <view class="form-label">选择你的性别</view>
        <view class="gender-selector">
          <view
            v-for="item in genderOptions"
            :key="item.value"
            class="gender-item"
            :class="{ active: form.gender === item.value }"
            @click="selectGender(item.value)"
          >
            <image
              class="gender-img"
              :src="form.gender === item.value ? item.imgActive : item.imgNormal"
              mode="aspectFit"
            />
          </view>
        </view>
      </view>

      <!-- 年龄 -->
      <view class="form-group">
        <view class="form-label">选择你的年龄</view>
        <view class="picker-cell" @click="openBirthdayPicker">
          <text class="picker-value">{{ formatBirthday(form.birthday) }}</text>
          <text class="iconfont icon-you"></text>
        </view>
      </view>

      <!-- 身高体重 -->
      <view class="form-group">
        <view class="form-label">选择你的身高体重</view>
        <view class="hw-row">
          <view class="picker-cell half" @click="openHwPicker">
            <text class="picker-value">{{ form.height }} cm</text>
            <text class="iconfont icon-you"></text>
          </view>
          <view class="picker-cell half" @click="openHwPicker">
            <text class="picker-value">{{ form.weight }} kg</text>
            <text class="iconfont icon-you"></text>
          </view>
        </view>
      </view>

      <!-- 火锅类型 -->
      <view class="form-group">
        <view class="form-label">火锅类型</view>
        <view class="tag-list">
          <view
            v-for="item in hotpotTypeOptions"
            :key="item"
            class="tag-item"
            :class="{ active: form.hotpotType === item }"
            @click="form.hotpotType = item"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <!-- 口味 -->
      <view class="form-group">
        <view class="form-label">口味</view>
        <view class="tag-list">
          <view
            v-for="item in tasteOptions"
            :key="item"
            class="tag-item"
            :class="{ active: form.taste === item }"
            @click="form.taste = item"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <!-- 动力 -->
      <view class="form-group">
        <view class="form-label">动力</view>
        <view class="tag-list">
          <view
            v-for="item in motivationOptions"
            :key="item"
            class="tag-item"
            :class="{ active: form.motivation === item }"
            @click="form.motivation = item"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <!-- 预留微信 -->
      <view class="form-group">
        <view class="form-label">预留微信</view>
        <input
          v-model="form.wechat"
          class="form-input"
          placeholder="方便联系"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 艺名 -->
      <view class="form-group">
        <view class="form-label">艺名</view>
        <input
          v-model="form.nickname"
          class="form-input"
          placeholder="取一个好听的名字"
          placeholder-class="placeholder"
        />
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 确认按钮 -->
    <view class="footer">
      <view class="submit-btn" :class="{ disabled: !canSubmit }" @click="onSubmit">
        确认
      </view>
    </view>

    <!-- 生日选择器弹窗 -->
    <view v-if="birthdayVisible" class="mask" @click="closeBirthdayPicker">
      <view class="picker-modal" @click.stop>
        <view class="picker-modal-title">选择出生日期</view>
        <view class="picker-body birthday-picker-body">
          <picker-view
            class="picker-view birthday-picker"
            :value="[yearIndex, monthIndex, dayIndex]"
            indicator-style="height: 44px; border-radius: 12rpx;"
            mask-style="background-image: linear-gradient(to bottom, rgba(26, 26, 26, 0.45), rgba(26, 26, 26, 0)), linear-gradient(to top, rgba(26, 26, 26, 0.45), rgba(26, 26, 26, 0)); background-position: top, bottom; background-size: 100% 80rpx; background-repeat: no-repeat;"
            @change="onBirthdayColChange"
          >
            <picker-view-column>
              <view v-for="y in yearRange" :key="y" class="picker-view-item">{{ y }}年</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="m in monthRange" :key="m" class="picker-view-item">{{ m }}月</view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="d in dayRange" :key="d" class="picker-view-item">{{ d }}日</view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="picker-actions">
          <view class="picker-btn cancel" @click="closeBirthdayPicker">取消</view>
          <view class="picker-btn confirm" @click="confirmBirthday">确认</view>
        </view>
      </view>
    </view>

    <!-- 身高体重选择器弹窗 -->
    <view v-if="hwVisible" class="mask" @click="closeHwPicker">
      <view class="picker-modal" @click.stop>
        <view class="picker-modal-title">选择身高体重</view>
        <view class="picker-body">
          <view class="picker-column-box">
            <text class="picker-column-label">身高</text>
            <picker-view
              class="picker-view"
              :value="[heightIndex]"
              indicator-style="height: 44px;border-radius: 12rpx;"
              mask-style="background-image: linear-gradient(to bottom, rgba(26, 26, 26, 0.45), rgba(26, 26, 26, 0)), linear-gradient(to top, rgba(26, 26, 26, 0.45), rgba(26, 26, 26, 0)); background-position: top, bottom; background-size: 100% 80rpx; background-repeat: no-repeat;"
              @change="onHeightChange"
            >
              <picker-view-column>
                <view v-for="h in heightRange" :key="h" class="picker-view-item">
                  {{ h }}
                </view>
              </picker-view-column>
            </picker-view>
            <text class="picker-unit">cm</text>
          </view>
          <view class="picker-column-box">
            <text class="picker-column-label">体重</text>
            <picker-view
              class="picker-view"
              :value="[weightIndex]"
              indicator-style="height: 44px; border-radius: 12rpx;"
              mask-style="background-image: linear-gradient(to bottom, rgba(26, 26, 26, 0.45), rgba(26, 26, 26, 0)), linear-gradient(to top, rgba(26, 26, 26, 0.45), rgba(26, 26, 26, 0)); background-position: top, bottom; background-size: 100% 80rpx; background-repeat: no-repeat;"
              @change="onWeightChange"
            >
              <picker-view-column>
                <view v-for="w in weightRange" :key="w" class="picker-view-item">
                  {{ w }}
                </view>
              </picker-view-column>
            </picker-view>
            <text class="picker-unit">kg</text>
          </view>
        </view>
        <view class="picker-actions">
          <view class="picker-btn cancel" @click="closeHwPicker">取消</view>
          <view class="picker-btn confirm" @click="confirmHw">确认</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import {
  hotpotTypeOptions,
  tasteOptions,
  motivationOptions,
  appState,
} from '@/utils/store';
import { updatePersonInfo, getPersonInfo } from '@/api/api';
import { setProfileComplete, isProfileComplete } from '@/utils/auth';

const today = new Date();
const defaultBirthday = `${today.getFullYear() - 20}-${String(
  today.getMonth() + 1
).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const genderOptions = [
  { value: 'male', label: '男生', imgNormal: '/static/imgs/boy_d.png', imgActive: '/static/imgs/boys.png' },
  { value: 'female', label: '女生', imgNormal: '/static/imgs/girls_d.png', imgActive: '/static/imgs/girls.png' },
];

// 随机艺名生成
function randomNickname(): string {
  const prefixes = ['爱吃火锅的', '麻辣', '烫烫', '沸腾', '酸酸', '鲜香', '飘香', '热辣', '翻滚'];
  const suffixes = ['小达人', '选手', '探险家', '美食家', '吃货', '小能手', '侠客', '先锋', '掌门', '大师'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const s = suffixes[Math.floor(Math.random() * suffixes.length)];
  const num = Math.floor(Math.random() * 100);
  return `${p}${s}${num}`;
}

const form = reactive({
  gender: 'male',
  birthday: defaultBirthday,
  height: '178',
  weight: '70',
  hotpotType: hotpotTypeOptions[0],
  taste: tasteOptions[0],
  motivation: motivationOptions[0],
  wechat: '',
  nickname: randomNickname(),
});

const heightRange = Array.from({ length: 81 }, (_, i) => String(140 + i));
const weightRange = Array.from({ length: 121 }, (_, i) => String(30 + i));

const hwVisible = ref(false);
const tempHeight = ref(form.height);
const tempWeight = ref(form.weight);

// 生日选择器
const birthdayVisible = ref(false);
const currentYear = new Date().getFullYear();
const yearRange = Array.from({ length: 100 }, (_, i) => currentYear - i);
const monthRange = Array.from({ length: 12 }, (_, i) => i + 1);

const tempYear = ref(currentYear - 20);
const tempMonth = ref(1);
const tempDay = ref(1);

// 胶囊对齐
const menuTop = ref(0);
const menuHeight = ref(0);

interface MenuRect {
  top: number;
  height: number;
}

onMounted(() => {
  try {
    // #ifdef MP-WEIXIN
    const rect: MenuRect = uni.getMenuButtonBoundingClientRect();
    menuTop.value = rect.top;
    menuHeight.value = rect.height;
    // #endif
  } catch {
    menuTop.value = 0;
  }
});

const headerStyle = computed(() => {
  if (menuTop.value > 0) {
    return {
      paddingTop: `${menuTop.value}px`,
      height: `${menuHeight.value}px`,
    };
  }
  return {};
});

const yearIndex = computed(() => yearRange.findIndex((v) => v === tempYear.value));
const monthIndex = computed(() => monthRange.findIndex((v) => v === tempMonth.value));
const dayIndex = computed(() => dayRange.value.findIndex((v) => v === tempDay.value));

const dayRange = computed(() => {
  const daysInMonth = new Date(tempYear.value, tempMonth.value, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
});

const heightIndex = computed(() =>
  heightRange.findIndex((v) => v === tempHeight.value)
);
const weightIndex = computed(() =>
  weightRange.findIndex((v) => v === tempWeight.value)
);

const selectGender = (gender: string) => {
  form.gender = gender;
};

const canSubmit = computed(() => {
  return (
    form.gender &&
    form.birthday &&
    form.height &&
    form.weight &&
    form.hotpotType &&
    form.taste &&
    form.motivation &&
    form.nickname.trim()
  );
});

function formatBirthday(date: string) {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
}

function parseBirthday(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function openBirthdayPicker() {
  const { year, month, day } = parseBirthday(form.birthday);
  tempYear.value = year;
  tempMonth.value = month;
  const maxDay = new Date(year, month, 0).getDate();
  tempDay.value = Math.min(day, maxDay);
  birthdayVisible.value = true;
}

function closeBirthdayPicker() {
  birthdayVisible.value = false;
}

function onBirthdayColChange(e: any) {
  const [yi, mi, di] = e.detail.value;
  tempYear.value = yearRange[yi];
  tempMonth.value = monthRange[mi];
  // dayRange 动态变化，注意 di 不要越界
  const maxDay = dayRange.value.length;
  tempDay.value = Math.min(di + 1, maxDay);
}

function confirmBirthday() {
  form.birthday = `${tempYear.value}-${String(tempMonth.value).padStart(2, '0')}-${String(tempDay.value).padStart(2, '0')}`;
  closeBirthdayPicker();
}

function openHwPicker() {
  tempHeight.value = form.height;
  tempWeight.value = form.weight;
  hwVisible.value = true;
}

function closeHwPicker() {
  hwVisible.value = false;
}

function onHeightChange(e: any) {
  tempHeight.value = heightRange[e.detail.value[0]];
}

function onWeightChange(e: any) {
  tempWeight.value = weightRange[e.detail.value[0]];
}

function confirmHw() {
  form.height = tempHeight.value;
  form.weight = tempWeight.value;
  closeHwPicker();
}

function goBack() {
  // 资料未完善时不允许返回
  if (!isProfileComplete()) {
    uni.showToast({ title: '请先完善个人信息', icon: 'none' });
    return;
  }
  uni.navigateBack({ delta: 1 });
}

async function onSubmit() {
  if (!canSubmit.value) {
    uni.showToast({ title: '请完善全部资料', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '保存中...' });
  try {
    await updatePersonInfo({
      gender: form.gender,
      birthday: form.birthday,
      height: form.height,
      weight: form.weight,
      hotpotType: form.hotpotType,
      taste: form.taste,
      motivation: form.motivation,
      wechat: form.wechat,
      nickname: form.nickname,
    });

    // 刷新本地用户信息
    const res: any = await getPersonInfo();
    if (res && res.data) {
      Object.assign(appState.userProfile, res.data);
    }

    // 标记资料已完善
    setProfileComplete(true);

    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/tabBar/match' });
    }, 800);
  } catch (err: any) {
    uni.showToast({
      title: err?.msg || '保存失败，请重试',
      icon: 'none',
    });
  } finally {
    uni.hideLoading();
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  min-height: 100vh;
  background: #0d0d0d;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx 30rpx;

  .back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont {
      font-size: 40rpx;
      color: #fff;
    }
  }

  .title {
    font-size: 34rpx;
    font-weight: 600;
    color: #fff;
  }

  .placeholder {
    width: 60rpx;
  }
}

.main {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 44rpx;
}

.form-label {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 24rpx;
}

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

.picker-cell {
  height: 92rpx;
  border-radius: 46rpx;
  background: linear-gradient( 180deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.1) 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;

  &.half {
    flex: 1;
  }

  .picker-value {
    font-size: 30rpx;
    color: #fff;
  }

  .iconfont {
    font-size: 28rpx;
    color: #999;
  }
}

.hw-row {
  display: flex;
  gap: 24rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag-item {
  padding: 18rpx 32rpx;
  border-radius: 36rpx;
  background: linear-gradient( 180deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.1) 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  font-size: 28rpx;
  color: #929292;
  transition: all 0.2s;

  &.active {
    // background: linear-gradient(90deg, #6d5dfc 0%, #c84dfb 100%);
    border-color: transparent;
    color: #FFFFFF;
    border: 2rpx solid rgba(255, 255, 255, 0.9);
  }
}

.form-input {
  height: 92rpx;
  border-radius: 46rpx;
  background: linear-gradient( 180deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.1) 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  padding: 0 32rpx;
  font-size: 30rpx;
  color: #fff;
}

.placeholder {
  color: #666;
}

.bottom-space {
  height: 160rpx;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(10rpx);
}

.submit-btn {
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient( 270deg, #58B4FF 0%, #C927FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.picker-modal {
  width: 100%;
  background: #1a1a1a;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.picker-modal-title {
  font-size: 32rpx;
  color: #fff;
  text-align: center;
  margin-bottom: 24rpx;
}

.picker-body {
  display: flex;
  gap: 40rpx;
  height: 420rpx;
}

.birthday-picker-body {
  padding: 0 40rpx;
}

.birthday-picker {
  background: #1a1a1a;

  ::-webkit-scrollbar {
    display: none;
  }
}

.picker-column-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.picker-column-label {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.picker-view {
  flex: 1;
  width: 100%;
  height: 340rpx;
  background: #1a1a1a;
}

.picker-view-item {
  line-height: 88rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #fff;
}

.picker-unit {
  position: absolute;
  right: 30rpx;
  top: 196rpx;
  font-size: 28rpx;
  color: #999;
}

.picker-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.picker-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;

  &.cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.confirm {
    background: linear-gradient(90deg, #6d5dfc 0%, #c84dfb 100%);
    color: #fff;
  }
}
</style>
