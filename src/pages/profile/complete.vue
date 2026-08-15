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
                    <view v-for="item in genderOptions" :key="item.value" class="gender-item" :class="{ active: form.gender === item.value }" @click="selectGender(item.value)">
                        <image class="gender-img" :src="form.gender === item.value ? item.imgActive : item.imgNormal" mode="aspectFit" />
                    </view>
                </view>
            </view>

            <!-- 年龄 -->
            <view class="form-group">
                <view class="form-label">选择你的年龄</view>
                <view class="picker-cell birthday-cell" @click="openBirthdayPicker">
                    <view class="picker-value birthday-value">
                        <template v-if="birthdayParts">
                            <text>{{ birthdayParts.y }}年</text>
                            <text>{{ birthdayParts.m }}月</text>
                            <text>{{ birthdayParts.d }}日</text>
                        </template>
                        <uni-icons type="right" size="14" color="#ffffff"></uni-icons>
                    </view>
                </view>
            </view>

            <!-- 身高体重 -->
            <view class="form-group">
                <view class="form-label">选择你的身高体重</view>
                <view class="hw-row">
                    <view class="picker-cell half" @click="openHwPicker">
                        <text class="picker-value">{{ form.height }} cm</text>
                        <uni-icons type="right" size="14" color="#ffffff"></uni-icons>
                    </view>
                    <view class="picker-cell half" @click="openHwPicker">
                        <text class="picker-value">{{ form.weight }} kg</text>
                        <uni-icons type="right" size="14" color="#ffffff"></uni-icons>
                    </view>
                </view>
            </view>

            <!-- 火锅类型 -->
            <view class="form-group">
                <view class="form-label">火锅类型</view>
                <scroll-view scroll-x class="tag-list" :show-scrollbar="false">
                    <view class="tag-scroll-inner">
                        <view v-for="item in hotpotTypeOptions" :key="item" class="tag-item" :class="{ active: form.hotpotType === item }" @click="form.hotpotType = item">
                            {{ item }}
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 口味 -->
            <view class="form-group">
                <view class="form-label">口味</view>
                <scroll-view scroll-x class="tag-list" :show-scrollbar="false">
                    <view class="tag-scroll-inner">
                        <view v-for="item in tasteOptions" :key="item" class="tag-item" :class="{ active: form.taste === item }" @click="form.taste = item">
                            {{ item }}
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 动力 -->
            <view class="form-group">
                <view class="form-label">动力</view>
                <scroll-view scroll-x class="tag-list" :show-scrollbar="false">
                    <view class="tag-scroll-inner">
                        <view v-for="item in motivationOptions" :key="item" class="tag-item" :class="{ active: form.motivation === item }" @click="form.motivation = item">
                            {{ item }}
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 预留微信 -->
            <view class="form-group">
                <view class="form-label">预留微信</view>
                <input v-model="form.wechat" class="form-input" placeholder="方便联系" placeholder-class="placeholder" />
            </view>

            <!-- 艺名 -->
            <view class="form-group">
                <view class="form-label">艺名</view>
                <input v-model="form.nickname" class="form-input" placeholder="取一个好听的名字" placeholder-class="placeholder" />
            </view>

            <view class="bottom-space"></view>
        </scroll-view>

        <!-- 确认按钮 -->
        <view class="footer">
            <view class="submit-btn" :class="{ disabled: !canSubmit }" @click="onSubmit"> 确认 </view>
        </view>

        <!-- 年龄选择器弹窗 -->
        <view v-if="birthdayVisible" class="mask age-mask" @click="closeBirthdayPicker">
            <view class="picker-modal age-picker-modal" @click.stop>
                <view class="picker-modal-title">选择年龄</view>
                <view class="picker-body age-picker-body">
                    <picker-view
                        class="picker-view age-picker-view"
                        :value="[yearIndex, monthIndex, dayIndex]"
                        indicator-style="height: 88rpx;"
                        mask-style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)), linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)); background-position: top, bottom;"
                        @change="onBirthdayColChange"
                    >
                        <picker-view-column>
                            <view v-for="y in yearRange" :key="y" class="picker-view-item age-picker-item">{{ y }}年</view>
                        </picker-view-column>
                        <picker-view-column>
                            <view v-for="m in monthRange" :key="m" class="picker-view-item age-picker-item">{{ m }}月</view>
                        </picker-view-column>
                        <picker-view-column>
                            <view v-for="d in dayRange" :key="d" class="picker-view-item age-picker-item">{{ d }}日</view>
                        </picker-view-column>
                    </picker-view>
                </view>
                <view class="picker-actions age-picker-actions">
                    <view class="picker-btn cancel" @click="closeBirthdayPicker">取消</view>
                    <view class="picker-btn confirm" @click="confirmBirthday">确认</view>
                </view>
            </view>
        </view>

        <!-- 身高体重选择器弹窗 -->
        <view v-if="hwVisible" class="mask hw-mask" @click="closeHwPicker">
            <view class="picker-modal hw-picker-modal" @click.stop>
                <view class="picker-modal-title">选择身高体重</view>
                <view class="hw-divider"></view>

                <!-- 身高选择器 -->
                <view class="ruler-section">
                    <text class="ruler-label">身高</text>
                    <view class="ruler-wrap" @touchstart="onHeightTouchStart" @touchmove.stop.prevent="onHeightTouchMove" @touchend="onHeightTouchEnd">
                        <view class="ruler-arrow left" @click.stop="adjustHeight(-1)">
                            <view class="arrow-triangle"></view>
                        </view>
                        <view class="ruler-viewport" :style="heightViewportStyle">
                            <view class="ruler-ticks">
                                <view v-for="(item, idx) in visibleHeightRange" :key="idx" class="ruler-tick" :class="{ active: item.isCurrent, empty: item.value === null }"></view>
                            </view>
                            <view class="ruler-values">
                                <view v-for="(item, idx) in visibleHeightRange" :key="idx" class="ruler-value-box" :class="{ active: item.isCurrent }">
                                    <template v-if="item.value !== null">
                                        <text class="ruler-value-num">{{ item.value }}</text>
                                        <text v-if="item.isCurrent" class="ruler-value-unit">cm</text>
                                    </template>
                                </view>
                            </view>
                        </view>
                        <view class="ruler-arrow right" @click.stop="adjustHeight(1)">
                            <view class="arrow-triangle"></view>
                        </view>
                    </view>
                </view>

                <!-- 体重选择器 -->
                <view class="ruler-section">
                    <text class="ruler-label">体重</text>
                    <view class="ruler-wrap" @touchstart="onWeightTouchStart" @touchmove.stop.prevent="onWeightTouchMove" @touchend="onWeightTouchEnd">
                        <view class="ruler-arrow left" @click.stop="adjustWeight(-1)">
                            <view class="arrow-triangle"></view>
                        </view>
                        <view class="ruler-viewport" :style="weightViewportStyle">
                            <view class="ruler-ticks">
                                <view v-for="(item, idx) in visibleWeightRange" :key="idx" class="ruler-tick" :class="{ active: item.isCurrent, empty: item.value === null }"></view>
                            </view>
                            <view class="ruler-values">
                                <view v-for="(item, idx) in visibleWeightRange" :key="idx" class="ruler-value-box" :class="{ active: item.isCurrent }">
                                    <template v-if="item.value !== null">
                                        <text class="ruler-value-num">{{ item.value }}</text>
                                        <text v-if="item.isCurrent" class="ruler-value-unit">kg</text>
                                    </template>
                                </view>
                            </view>
                        </view>
                        <view class="ruler-arrow right" @click.stop="adjustWeight(1)">
                            <view class="arrow-triangle"></view>
                        </view>
                    </view>
                </view>

                <view class="picker-actions hw-picker-actions">
                    <view class="picker-btn cancel" @click="closeHwPicker">取消</view>
                    <view class="picker-btn confirm" @click="confirmHw">确认</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { hotpotTypeOptions, tasteOptions, motivationOptions, appState } from '@/utils/store';
import { completeUserInfo } from '@/api/api';
import { setProfileComplete, isProfileComplete } from '@/utils/auth';

const today = new Date();
const defaultBirthday = `${today.getFullYear() - 20}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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

const heightIndex = computed(() => heightRange.findIndex((v) => v === tempHeight.value));
const weightIndex = computed(() => weightRange.findIndex((v) => v === tempWeight.value));

const selectGender = (gender: string) => {
    form.gender = gender;
};

const birthdayParts = computed(() => {
    if (!form.birthday) return null;
    const [y, m, d] = form.birthday.split('-');
    return { y, m: Number(m), d: Number(d) };
});

const canSubmit = computed(() => {
    return form.gender && form.birthday && form.height && form.weight && form.hotpotType && form.taste && form.motivation && form.nickname.trim();
});

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

const visibleHeightRange = computed(() => {
    const current = Number(tempHeight.value);
    const min = 140;
    const max = 220;
    const range = [];
    for (let i = -2; i <= 2; i++) {
        const val = current + i;
        range.push({
            value: val >= min && val <= max ? val : null,
            isCurrent: i === 0,
        });
    }
    return range;
});

const visibleWeightRange = computed(() => {
    const current = Number(tempWeight.value);
    const min = 30;
    const max = 150;
    const range = [];
    for (let i = -2; i <= 2; i++) {
        const val = current + i;
        range.push({
            value: val >= min && val <= max ? val : null,
            isCurrent: i === 0,
        });
    }
    return range;
});

function adjustHeight(delta: number) {
    const val = Number(tempHeight.value) + delta;
    if (val >= 140 && val <= 220) {
        tempHeight.value = String(val);
    }
}

function adjustWeight(delta: number) {
    const val = Number(tempWeight.value) + delta;
    if (val >= 30 && val <= 150) {
        tempWeight.value = String(val);
    }
}

let heightTouchStartX = 0;
let heightTouchStartValue = 0;
let weightTouchStartX = 0;
let weightTouchStartValue = 0;
const STEP_PX = 18;

// 平滑视觉偏移
const heightVisualOffset = ref(0);
const weightVisualOffset = ref(0);
const heightIsDragging = ref(false);
const weightIsDragging = ref(false);

const heightViewportStyle = computed(() => ({
    transform: `translateX(${heightVisualOffset.value}%)`,
    transition: heightIsDragging.value ? 'none' : 'transform 0.2s ease-out',
}));

const weightViewportStyle = computed(() => ({
    transform: `translateX(${weightVisualOffset.value}%)`,
    transition: weightIsDragging.value ? 'none' : 'transform 0.2s ease-out',
}));

function onHeightTouchStart(e: any) {
    heightTouchStartX = e.touches[0].clientX;
    heightTouchStartValue = Number(tempHeight.value);
    heightIsDragging.value = true;
    heightVisualOffset.value = 0;
}

function onHeightTouchMove(e: any) {
    const deltaX = e.touches[0].clientX - heightTouchStartX;
    const continuousSteps = -deltaX / STEP_PX;
    const integerSteps = Math.round(continuousSteps);
    const newVal = heightTouchStartValue + integerSteps;
    const clampedVal = Math.max(140, Math.min(220, newVal));
    if (String(clampedVal) !== tempHeight.value) {
        tempHeight.value = String(clampedVal);
    }
    heightVisualOffset.value = -(continuousSteps - integerSteps) * 20;
}

function onHeightTouchEnd(_e: any) {
    heightIsDragging.value = false;
    heightVisualOffset.value = 0;
}

function onWeightTouchStart(e: any) {
    weightTouchStartX = e.touches[0].clientX;
    weightTouchStartValue = Number(tempWeight.value);
    weightIsDragging.value = true;
    weightVisualOffset.value = 0;
}

function onWeightTouchMove(e: any) {
    const deltaX = e.touches[0].clientX - weightTouchStartX;
    const continuousSteps = -deltaX / STEP_PX;
    const integerSteps = Math.round(continuousSteps);
    const newVal = weightTouchStartValue + integerSteps;
    const clampedVal = Math.max(30, Math.min(150, newVal));
    if (String(clampedVal) !== tempWeight.value) {
        tempWeight.value = String(clampedVal);
    }
    weightVisualOffset.value = -(continuousSteps - integerSteps) * 20;
}

function onWeightTouchEnd(_e: any) {
    weightIsDragging.value = false;
    weightVisualOffset.value = 0;
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

    // 表单数据映射为接口参数
    const genderMap: Record<string, number> = { male: 1, female: 2 };
    const params = {
        nickname: form.nickname,
        avatar: appState.userProfile.avatar || '',
        gender: genderMap[form.gender] || 1,
        birthday: form.birthday,
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        hotpotType: hotpotTypeOptions.indexOf(form.hotpotType) + 1,
        taste: tasteOptions.indexOf(form.taste) + 1,
        motivation: motivationOptions.indexOf(form.motivation) + 1,
        wechat: form.wechat,
        stageName: form.nickname,
        province: '',
        city: '',
        district: '',
        address: '',
        lat: 0,
        lng: 0,
    };

    try {
        const res = await completeUserInfo(params);

        // 更新本地状态
        Object.assign(appState.userProfile, {
            gender: form.gender,
            birthday: form.birthday,
            height: form.height,
            weight: form.weight,
            hotpotType: [form.hotpotType],
            taste: [form.taste],
            motivation: form.motivation,
            wechat: form.wechat,
            nickname: form.nickname,
            avatar: res.avatar || appState.userProfile.avatar,
        });

        setProfileComplete(true);

        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
            uni.switchTab({ url: '/pages/tabBar/match' });
        }, 800);
    } catch (err) {
        console.error('完善资料失败:', err);
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
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
    border: 2rpx solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 32rpx;

    &.half {
        flex: 1;
    }

    &.birthday-cell {
        :deep(uni-icons) {
            position: static;
        }
    }

    .picker-value {
        font-size: 30rpx;
        color: #fff;
        text-align: center;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &.birthday-value {
            flex: 1;
        }
    }

    :deep(uni-icons) {
        position: absolute;
        right: 32rpx;
    }
}

.hw-row {
    display: flex;
    gap: 24rpx;
}

.tag-list {
    width: 100%;
    white-space: nowrap;
}

.tag-scroll-inner {
    display: inline-flex;
    gap: 20rpx;
    padding: 4rpx 0;
}

.tag-item {
    flex-shrink: 0;
    padding: 18rpx 32rpx;
    border-radius: 36rpx;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
    border: 2rpx solid rgba(255, 255, 255, 0.2);
    font-size: 28rpx;
    color: #929292;
    transition: all 0.2s;

    &.active {
        // background: linear-gradient(90deg, #6d5dfc 0%, #c84dfb 100%);
        border-color: transparent;
        color: #ffffff;
        border: 2rpx solid rgba(255, 255, 255, 0.9);
    }
}

.form-input {
    height: 92rpx;
    border-radius: 46rpx;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.1) 100%);
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
    background: linear-gradient(270deg, #58b4ff 0%, #c927ff 100%);
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
    // background: #1a1a1a;
    background: rgba(0,0,0,0.9);
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

/* 年龄选择器弹框样式 */
.mask.age-mask {
    align-items: center;
    justify-content: center;
}

.picker-modal.age-picker-modal {
    width: 620rpx;
    border-radius: 32rpx;
    padding: 40rpx 32rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    padding-bottom: 40rpx;
}

.age-picker-body {
    height: 400rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
}

.age-picker-view {
    width: 100%;
    height: 400rpx;
    background: transparent;
}

.age-picker-item {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 36rpx;
    font-weight: 600;
    color: #ffffff;
}

.age-picker-actions {
    margin-top: 32rpx;

    .picker-btn.cancel {
        background: #ffffff;
        color: #000000;
    }

    .picker-btn.confirm {
        background: linear-gradient(90deg, #58b4ff 0%, #c927ff 100%);
    }
}

/* 身高体重选择器弹框样式 - 刻度尺 */
.mask.hw-mask {
    align-items: center;
    justify-content: center;
}

.picker-modal.hw-picker-modal {
    width: 620rpx;
    border-radius: 32rpx;
    padding: 32rpx 32rpx 40rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.95);
}

.hw-divider {
    height: 1rpx;
    background: rgba(255, 255, 255, 0.08);
    margin: 0 -32rpx 32rpx;
}

.ruler-section {
    margin-bottom: 40rpx;
}

.ruler-label {
    display: block;
    text-align: center;
    font-size: 30rpx;
    color: #fff;
    margin-bottom: 20rpx;
    font-weight: 500;
}

.ruler-wrap {
    display: flex;
    align-items: center;
    gap: 4rpx;
}

.ruler-arrow {
    width: 36rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.left .arrow-triangle {
        width: 0;
        height: 0;
        border-top: 7rpx solid transparent;
        border-bottom: 7rpx solid transparent;
        border-right: 9rpx solid rgba(255, 255, 255, 0.45);
    }

    &.right .arrow-triangle {
        width: 0;
        height: 0;
        border-top: 7rpx solid transparent;
        border-bottom: 7rpx solid transparent;
        border-left: 9rpx solid rgba(255, 255, 255, 0.45);
    }
}

.ruler-viewport {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.ruler-ticks {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    width: 100%;
    height: 36rpx;
    margin-bottom: 12rpx;
    position: relative;
}

.ruler-tick {
    width: 2rpx;
    height: 14rpx;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 1rpx;

    &.empty {
        background: transparent;
    }

    &.active {
        height: 36rpx;
        background: #fff;
    }
}

.ruler-values {
    display: flex;
    justify-content: space-around;
    align-items: baseline;
    width: 100%;
    height: 60rpx;
}

.ruler-value-box {
    display: flex;
    align-items: baseline;
    justify-content: center;
    width: 80rpx;
    transition: all 0.15s ease;

    .ruler-value-num {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.2);
    }

    .ruler-value-unit {
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.35);
        margin-left: 4rpx;
    }

    &.active {
        .ruler-value-num {
            font-size: 48rpx;
            color: #fff;
            font-weight: 600;
        }

        .ruler-value-unit {
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.5);
        }
    }
}

.hw-picker-actions {
    margin-top: 16rpx;

    .picker-btn.cancel {
        background: #ffffff;
        color: #000000;
    }

    .picker-btn.confirm {
        background: linear-gradient(90deg, #58b4ff 0%, #c927ff 100%);
    }
}
</style>
