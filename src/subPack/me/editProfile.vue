<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <view class="nav-bar" :style="navBarStyle">
            <uni-icons type="left" size="24" color="#ffffff" @click="handleBack"></uni-icons>
            <text class="nav-title">编辑资料</text>
            <view class="nav-placeholder"></view>
        </view>

        <!-- 可滚动区域 -->
        <scroll-view scroll-y class="main-content">
            <!-- 头像区域 -->
            <view class="avatar-section">
                <view class="avatar-wrapper" @click="handleChangeAvatar">
                    <image class="avatar-img" :src="form.avatar || defaultAvatar" mode="aspectFill"></image>
                    <view class="camera-btn">
                        <uni-icons type="camera-filled" size="16" color="#000000"></uni-icons>
                    </view>
                </view>
            </view>

            <!-- 列表区域 -->
            <view class="list-container">
                <!-- 昵称 -->
                <view class="list-item" @click="openModal('nickname')">
                    <text class="label">昵称</text>
                    <view class="value-row">
                        <text class="value-text">{{ form.nickname || '未设置' }}</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>

                <!-- 性别 -->
                <view class="list-item" @click="openModal('gender')">
                    <text class="label">性别</text>
                    <view class="value-row">
                        <text class="value-text">{{ genderLabel }}</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>

                <!-- 生日 -->
                <view class="list-item" @click="openModal('birthday')">
                    <text class="label">生日</text>
                    <view class="value-row">
                        <text class="value-text">{{ birthdayLabel }}</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>

                <!-- 所在地 -->
                <view class="list-item" @click="openModal('location')">
                    <text class="label">所在地</text>
                    <view class="value-row">
                        <text class="value-text">{{ form.location || '未设置' }}</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>

                <!-- 火锅号 (静态) -->
                <view class="list-item">
                    <text class="label">火锅号</text>
                    <view class="value-row">
                        <text class="value-text static-text">{{ form.id || '523656' }}</text>
                    </view>
                </view>

                <!-- 身高体重 -->
                <view class="list-item" @click="openModal('hw')">
                    <text class="label">身高体重</text>
                    <view class="value-row">
                        <text class="value-text">{{ form.height }}cm / {{ form.weight }}kg</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>

                <!-- 火锅类型 -->
                <view class="list-item" @click="openModal('hotpotType')">
                    <text class="label">火锅类型</text>
                    <view class="value-row">
                        <text class="value-text">{{ form.hotpotType || '未设置' }}</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>

                <!-- 口味 -->
                <view class="list-item" @click="openModal('taste')">
                    <text class="label">口味</text>
                    <view class="value-row">
                        <text class="value-text">{{ form.taste || '未设置' }}</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>

                <!-- 动力 -->
                <view class="list-item" @click="openModal('motivation')">
                    <text class="label">动力</text>
                    <view class="value-row">
                        <text class="value-text">{{ form.motivation || '未设置' }}</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>

                <!-- 微信 -->
                <view class="list-item" @click="openModal('wechat')">
                    <text class="label">微信</text>
                    <view class="value-row">
                        <text class="value-text">{{ form.wechat || '未设置' }}</text>
                        <uni-icons type="right" size="16" color="#666666" class="arrow-icon"></uni-icons>
                    </view>
                </view>
            </view>

            <view class="bottom-space"></view>
        </scroll-view>

        <!-- 底部保存按钮 -->
        <view class="footer">
            <view class="save-btn" :class="{ disabled: !canSave }" @click="onSave"> 保存 </view>
        </view>

        <!-- ========== 性别选择弹窗 ========== -->
        <view v-if="modalType === 'gender'" class="mask" @click="closeModal">
            <view class="modal-content" @click.stop>
                <view class="modal-title">选择性别</view>
                <view class="gender-selector">
                    <view
                        v-for="item in genderOptions"
                        :key="item.value"
                        class="gender-item"
                        :class="{ active: tempForm.gender === item.value }"
                        @click="tempForm.gender = item.value"
                    >
                        <image
                            class="gender-img"
                            :src="tempForm.gender === item.value ? item.imgActive : item.imgNormal"
                            mode="aspectFit"
                        />
                    </view>
                </view>
                <view class="modal-actions">
                    <view class="modal-btn cancel" @click="closeModal">取消</view>
                    <view class="modal-btn confirm" @click="confirmModal('gender')">确认</view>
                </view>
            </view>
        </view>

        <!-- ========== 生日选择弹窗 ========== -->
        <view v-if="modalType === 'birthday'" class="mask age-mask" @click="closeModal">
            <view class="modal-content age-modal" @click.stop>
                <view class="modal-title">选择生日</view>
                <view class="picker-body">
                    <picker-view
                        class="picker-view"
                        :value="[yearIndex, monthIndex, dayIndex]"
                        indicator-style="height: 88rpx;"
                        mask-style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.5)), linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5)); background-position: top, bottom;"
                        @change="onBirthdayColChange"
                    >
                        <picker-view-column>
                            <view v-for="y in yearRange" :key="y" class="picker-item">{{ y }}年</view>
                        </picker-view-column>
                        <picker-view-column>
                            <view v-for="m in monthRange" :key="m" class="picker-item">{{ m }}月</view>
                        </picker-view-column>
                        <picker-view-column>
                            <view v-for="d in dayRange" :key="d" class="picker-item">{{ d }}日</view>
                        </picker-view-column>
                    </picker-view>
                </view>
                <view class="modal-actions">
                    <view class="modal-btn cancel" @click="closeModal">取消</view>
                    <view class="modal-btn confirm" @click="confirmModal('birthday')">确认</view>
                </view>
            </view>
        </view>

        <!-- ========== 身高体重选择弹窗 (刻度尺) ========== -->
        <view v-if="modalType === 'hw'" class="mask hw-mask" @click="closeModal">
            <view class="modal-content hw-modal" @click.stop>
                <view class="modal-title">选择身高体重</view>
                <view class="hw-divider"></view>

                <!-- 身高 -->
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

                <!-- 体重 -->
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

                <view class="modal-actions">
                    <view class="modal-btn cancel" @click="closeModal">取消</view>
                    <view class="modal-btn confirm" @click="confirmModal('hw')">确认</view>
                </view>
            </view>
        </view>

        <!-- ========== 标签选择弹窗（火锅类型/口味/动力） ========== -->
        <view v-if="tagModalTypes.includes(modalType)" class="mask" @click="closeModal">
            <view class="modal-content tag-modal" @click.stop>
                <view class="modal-title">{{ tagModalTitle }}</view>
                <scroll-view scroll-y class="tag-scroll-area">
                    <view class="tag-grid">
                        <view
                            v-for="item in currentTagOptions"
                            :key="item"
                            class="tag-item"
                            :class="{ active: getTempValue(modalType!) === item }"
                            @click="setTempValue(modalType!, item)"
                        >
                            {{ item }}
                        </view>
                    </view>
                </scroll-view>
                <view class="modal-actions">
                    <view class="modal-btn cancel" @click="closeModal">取消</view>
                    <view class="modal-btn confirm" @click="confirmModal(modalType)">确认</view>
                </view>
            </view>
        </view>

        <!-- ========== 所在地选择弹窗（三级联动 picker-view） ========== -->
        <view v-if="modalType === 'location'" class="mask location-mask" @click="closeModal">
            <view class="modal-content location-modal" @click.stop>
                <view class="modal-title">选择所在地</view>
                <view class="picker-body">
                    <picker-view
                        class="picker-view"
                        :value="[locationProvinceIndex, locationCityIndex, locationDistrictIndex]"
                        indicator-style="height: 88rpx;"
                        mask-style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.5)), linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5)); background-position: top, bottom;"
                        @change="onLocationColChange"
                    >
                        <picker-view-column>
                            <view v-for="p in regionOptions" :key="p.name" class="picker-item">{{ p.name }}</view>
                        </picker-view-column>
                        <picker-view-column>
                            <view v-for="c in currentCityOptions" :key="c" class="picker-item">{{ c }}</view>
                        </picker-view-column>
                        <picker-view-column>
                            <view v-for="d in currentDistrictOptions" :key="d" class="picker-item">{{ d }}</view>
                        </picker-view-column>
                    </picker-view>
                </view>
                <view class="modal-actions">
                    <view class="modal-btn cancel" @click="closeModal">取消</view>
                    <view class="modal-btn confirm" @click="confirmModal('location')">确认</view>
                </view>
            </view>
        </view>

        <!-- ========== 文本输入弹窗（昵称/微信） ========== -->
        <view v-if="textModalTypes.includes(modalType)" class="mask" @click="closeModal">
            <view class="modal-content text-modal" @click.stop>
                <view class="modal-title">{{ textModalTitle }}</view>
                <input
                    v-model="tempTextValue"
                    class="text-input"
                    :placeholder="textModalPlaceholder"
                    placeholder-class="placeholder"
                />
                <view class="modal-actions">
                    <view class="modal-btn cancel" @click="closeModal">取消</view>
                    <view class="modal-btn confirm" @click="confirmModal(modalType)">确认</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { hotpotTypeOptions, tasteOptions, motivationOptions, appState } from '@/utils/store';
import { setProfileComplete } from '@/utils/auth';
import { regionData, findRegionIndexes } from '@/utils/region-data';

const defaultAvatar = 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';

// 表单数据 - 读取已有数据
const form = reactive({
    avatar: '',
    nickname: '',
    gender: 'male',
    birthday: '2006-01-01',
    location: '',
    height: '178',
    weight: '70',
    hotpotType: '',
    taste: '',
    motivation: '',
    wechat: '',
    id: '',
});

// 初始化时从 appState 加载已有数据
onMounted(() => {
    const profile = appState.userProfile;
    if (profile.nickname) form.nickname = profile.nickname;
    if (profile.gender) form.gender = profile.gender;
    if (profile.birthday) form.birthday = profile.birthday;
    if (profile.height) form.height = profile.height;
    if (profile.weight) form.weight = profile.weight;
    if (profile.wechat) form.wechat = profile.wechat;
    if (profile.avatar) form.avatar = profile.avatar;
    if (profile.id) form.id = profile.id;
    if (profile.location) form.location = profile.location;
    // hotpotType/taste 在 store 中是数组，这里用字符串存储单选值
    if (profile.hotpotType && profile.hotpotType.length > 0) form.hotpotType = profile.hotpotType[0];
    if (profile.taste && profile.taste.length > 0) form.taste = profile.taste[0];
    if (profile.motivation) form.motivation = profile.motivation;
});

// 性别选项
const genderOptions = [
    { value: 'male', label: '男生', imgNormal: '/static/imgs/boy_d.png', imgActive: '/static/imgs/boys.png' },
    { value: 'female', label: '女生', imgNormal: '/static/imgs/girls_d.png', imgActive: '/static/imgs/girls.png' },
];

const genderLabel = computed(() => {
    return form.gender === 'male' ? '男' : form.gender === 'female' ? '女' : '未设置';
});

// 生日显示
const birthdayLabel = computed(() => {
    if (!form.birthday) return '未设置';
    const [y, m, d] = form.birthday.split('-');
    return `${y}年${Number(m)}月${Number(d)}日`;
});

// ========== 弹窗管理 ==========
type ModalType = 'nickname' | 'gender' | 'birthday' | 'location' | 'hw' | 'hotpotType' | 'taste' | 'motivation' | 'wechat' | null;

const modalType = ref<ModalType>(null);
const tagModalTypes: ModalType[] = ['hotpotType', 'taste', 'motivation'];
const textModalTypes: ModalType[] = ['nickname', 'wechat'];

const tagModalTitle = computed(() => {
    const map: Record<string, string> = { hotpotType: '选择火锅类型', taste: '选择口味', motivation: '选择动力' };
    return map[modalType.value || ''] || '';
});

const textModalTitle = computed(() => {
    const map: Record<string, string> = { nickname: '修改昵称', wechat: '修改微信' };
    return map[modalType.value || ''] || '';
});

const textModalPlaceholder = computed(() => {
    const map: Record<string, string> = { nickname: '取一个好听的名字', wechat: '方便联系' };
    return map[modalType.value || ''] || '';
});

// 所在地三级联动数据
const regionOptions = regionData;
const locationProvinceIndex = ref(0);
const locationCityIndex = ref(0);
const locationDistrictIndex = ref(0);

const currentCityOptions = computed(() => {
    const p = regionOptions[locationProvinceIndex.value];
    return p ? p.cities.map((c) => c.name) : [];
});

const currentDistrictOptions = computed(() => {
    const p = regionOptions[locationProvinceIndex.value];
    if (!p) return [];
    const c = p.cities[locationCityIndex.value];
    return c ? c.districts : [];
});

const currentTagOptions = computed(() => {
    const map: Record<string, string[]> = {
        hotpotType: hotpotTypeOptions as any,
        taste: tasteOptions as any,
        motivation: motivationOptions as any,
    };
    return map[modalType.value || ''] || [];
});

// 临时表单数据（弹窗中修改，确认后才同步）
const tempForm = reactive({
    nickname: '',
    gender: 'male',
    birthday: '',
    location: '',
    height: '178',
    weight: '70',
    hotpotType: '',
    taste: '',
    motivation: '',
    wechat: '',
});

// 辅助函数：安全读写 tempForm（模板中使用，避免 null index type 报错）
function getTempValue(key: string): string {
    return (tempForm as any)[key] || '';
}
function setTempValue(key: string, val: string) {
    (tempForm as any)[key] = val;
}

// 文本输入弹窗的双向绑定（解决 modalType 可能为 null 的 TS 问题）
const tempTextValue = computed({
    get: () => (modalType.value ? (tempForm as any)[modalType.value] || '' : ''),
    set: (val: string) => { if (modalType.value) (tempForm as any)[modalType.value] = val; },
});

function openModal(type: ModalType) {
    modalType.value = type;
    if (type === 'nickname') tempForm.nickname = form.nickname;
    if (type === 'gender') tempForm.gender = form.gender;
    if (type === 'birthday') {
        tempForm.birthday = form.birthday;
        const { year, month, day } = parseBirthday(form.birthday || '2006-01-01');
        tempYear.value = year;
        tempMonth.value = month;
        const maxDay = new Date(year, month, 0).getDate();
        tempDay.value = Math.min(day, maxDay);
    }
    if (type === 'location') {
        const indexes = findRegionIndexes(form.location);
        if (indexes) {
            locationProvinceIndex.value = indexes.pi;
            // 重新设置 city index 可能超出 range，做保护
            const cityCount = regionOptions[indexes.pi]?.cities.length || 0;
            locationCityIndex.value = indexes.ci < cityCount ? indexes.ci : 0;
            const districtCount = regionOptions[indexes.pi]?.cities[locationCityIndex.value]?.districts.length || 0;
            locationDistrictIndex.value = indexes.di < districtCount ? indexes.di : 0;
        } else {
            locationProvinceIndex.value = 0;
            locationCityIndex.value = 0;
            locationDistrictIndex.value = 0;
        }
    }
    if (type === 'hw') {
        tempForm.height = form.height;
        tempForm.weight = form.weight;
    }
    if (type === 'hotpotType') tempForm.hotpotType = form.hotpotType;
    if (type === 'taste') tempForm.taste = form.taste;
    if (type === 'motivation') tempForm.motivation = form.motivation;
    if (type === 'wechat') tempForm.wechat = form.wechat;
}

function closeModal() {
    modalType.value = null;
}

function confirmModal(type: ModalType) {
    if (type === 'nickname') form.nickname = tempForm.nickname;
    if (type === 'gender') form.gender = tempForm.gender;
    if (type === 'birthday') {
        form.birthday = `${tempYear.value}-${String(tempMonth.value).padStart(2, '0')}-${String(tempDay.value).padStart(2, '0')}`;
    }
    if (type === 'location') {
        const pi = locationProvinceIndex.value;
        const ci = locationCityIndex.value;
        const di = locationDistrictIndex.value;
        const province = regionOptions[pi]?.name || '';
        const city = regionOptions[pi]?.cities[ci]?.name || '';
        const district = regionOptions[pi]?.cities[ci]?.districts[di] || '';
        form.location = [province, city, district].filter(Boolean).join(' ');
    }
    if (type === 'hw') {
        form.height = tempForm.height;
        form.weight = tempForm.weight;
    }
    if (type === 'hotpotType') form.hotpotType = tempForm.hotpotType;
    if (type === 'taste') form.taste = tempForm.taste;
    if (type === 'motivation') form.motivation = tempForm.motivation;
    if (type === 'wechat') form.wechat = tempForm.wechat;
    closeModal();
}

// ========== 生日选择器逻辑 ==========
const currentYear = new Date().getFullYear();
const yearRange = Array.from({ length: 100 }, (_, i) => currentYear - i);
const monthRange = Array.from({ length: 12 }, (_, i) => i + 1);

const tempYear = ref(currentYear - 20);
const tempMonth = ref(1);
const tempDay = ref(1);

const dayRange = computed(() => {
    const daysInMonth = new Date(tempYear.value, tempMonth.value, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
});

const yearIndex = computed(() => yearRange.findIndex((v) => v === tempYear.value));
const monthIndex = computed(() => monthRange.findIndex((v) => v === tempMonth.value));
const dayIndex = computed(() => {
    const idx = dayRange.value.findIndex((v) => v === tempDay.value);
    return idx >= 0 ? idx : 0;
});

function parseBirthday(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return { year: y, month: m, day: d };
}

function onBirthdayColChange(e: any) {
    const [yi, mi, di] = e.detail.value;
    tempYear.value = yearRange[yi];
    tempMonth.value = monthRange[mi];
    const maxDay = dayRange.value.length;
    tempDay.value = Math.min(di + 1, maxDay);
}

function onLocationColChange(e: any) {
    const [pi, ci, di] = e.detail.value;
    // 省份切换时，重置城市和区为 0
    if (pi !== locationProvinceIndex.value) {
        locationProvinceIndex.value = pi;
        locationCityIndex.value = 0;
        locationDistrictIndex.value = 0;
        return;
    }
    // 城市切换时，重置区为 0
    if (ci !== locationCityIndex.value) {
        locationCityIndex.value = ci;
        locationDistrictIndex.value = 0;
        return;
    }
    // 仅区切换
    locationDistrictIndex.value = di;
}

// ========== 身高体重刻度尺逻辑 ==========

const visibleHeightRange = computed(() => {
    const current = Number(tempForm.height);
    const min = 140;
    const max = 220;
    const range = [];
    for (let i = -2; i <= 2; i++) {
        const val = current + i;
        range.push({ value: val >= min && val <= max ? val : null, isCurrent: i === 0 });
    }
    return range;
});

const visibleWeightRange = computed(() => {
    const current = Number(tempForm.weight);
    const min = 30;
    const max = 150;
    const range = [];
    for (let i = -2; i <= 2; i++) {
        const val = current + i;
        range.push({ value: val >= min && val <= max ? val : null, isCurrent: i === 0 });
    }
    return range;
});

function adjustHeight(delta: number) {
    const val = Number(tempForm.height) + delta;
    if (val >= 140 && val <= 220) tempForm.height = String(val);
}

function adjustWeight(delta: number) {
    const val = Number(tempForm.weight) + delta;
    if (val >= 30 && val <= 150) tempForm.weight = String(val);
}

// 触摸滑动
const STEP_PX = 18;
let hTouchStartX = 0, hTouchStartVal = 0;
let wTouchStartX = 0, wTouchStartVal = 0;

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
    hTouchStartX = e.touches[0].clientX;
    hTouchStartVal = Number(tempForm.height);
    heightIsDragging.value = true;
    heightVisualOffset.value = 0;
}
function onHeightTouchMove(e: any) {
    const deltaX = e.touches[0].clientX - hTouchStartX;
    const continuousSteps = -deltaX / STEP_PX;
    const integerSteps = Math.round(continuousSteps);
    const newVal = hTouchStartVal + integerSteps;
    const clamped = Math.max(140, Math.min(220, newVal));
    if (String(clamped) !== tempForm.height) tempForm.height = String(clamped);
    heightVisualOffset.value = -(continuousSteps - integerSteps) * 20;
}
function onHeightTouchEnd(_e: any) {
    heightIsDragging.value = false;
    heightVisualOffset.value = 0;
}

function onWeightTouchStart(e: any) {
    wTouchStartX = e.touches[0].clientX;
    wTouchStartVal = Number(tempForm.weight);
    weightIsDragging.value = true;
    weightVisualOffset.value = 0;
}
function onWeightTouchMove(e: any) {
    const deltaX = e.touches[0].clientX - wTouchStartX;
    const continuousSteps = -deltaX / STEP_PX;
    const integerSteps = Math.round(continuousSteps);
    const newVal = wTouchStartVal + integerSteps;
    const clamped = Math.max(30, Math.min(150, newVal));
    if (String(clamped) !== tempForm.weight) tempForm.weight = String(clamped);
    weightVisualOffset.value = -(continuousSteps - integerSteps) * 20;
}
function onWeightTouchEnd(_e: any) {
    weightIsDragging.value = false;
    weightVisualOffset.value = 0;
}

// ========== 保存 ==========
const canSave = computed(() => {
    return form.nickname.trim() || true; // 至少要有昵称
});

function onSave() {
    if (!form.nickname.trim()) {
        uni.showToast({ title: '请输入昵称', icon: 'none' });
        return;
    }
    // 同步到全局状态
    Object.assign(appState.userProfile, {
        nickname: form.nickname,
        gender: form.gender,
        birthday: form.birthday,
        height: form.height,
        weight: form.weight,
        hotpotType: form.hotpotType ? [form.hotpotType] : [],
        taste: form.taste ? [form.taste] : [],
        motivation: form.motivation,
        wechat: form.wechat,
        location: form.location,
        avatar: form.avatar || appState.userProfile.avatar,
    });
    // 标记资料已完善
    setProfileComplete(true);
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
        uni.navigateBack({ delta: 1 });
    }, 800);
}

// ========== 头像更换 ==========
function handleChangeAvatar() {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            form.avatar = res.tempFilePaths[0];
        },
    });
}

// ========== 导航栏 ==========
const menuTop = ref(0);
const menuHeight = ref(0);
const statusBarHeight = ref(0);

onMounted(() => {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight || 0;
    try {
        // #ifdef MP-WEIXIN
        const rect = uni.getMenuButtonBoundingClientRect();
        menuTop.value = rect.top;
        menuHeight.value = rect.height;
        // #endif
    } catch {
        menuTop.value = 0;
    }
});

const navBarStyle = computed(() => {
    if (menuTop.value > 0) {
        return { paddingTop: `${menuTop.value}px`, height: `${menuHeight.value}px` };
    }
    return { paddingTop: `${statusBarHeight.value}px`, height: '44px' };
});

function handleBack() {
    uni.navigateBack({
        fail: () => {
            uni.switchTab({ url: '/pages/tabBar/me' });
        },
    });
}
</script>

<style lang="scss" scoped>
.container {
    min-height: 100vh;
    background-color: #0d0d0d;
    color: #ffffff;
    display: flex;
    flex-direction: column;
}

/* 导航栏 */
.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
    background: #0d0d0d;
}

.nav-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
}

.nav-placeholder {
    width: 48rpx;
}

/* 滚动区域 */
.main-content {
    flex: 1;
    overflow-y: auto;
}

/* 头像区域 */
.avatar-section {
    display: flex;
    justify-content: center;
    padding: 40rpx 0 60rpx;
}

.avatar-wrapper {
    position: relative;
    width: 120rpx;
    height: 120rpx;
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.camera-btn {
    position: absolute;
    bottom: -4rpx;
    right: -4rpx;
    width: 40rpx;
    height: 40rpx;
    background-color: #ffffff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3rpx solid #0d0d0d;
    box-sizing: border-box;
}

/* 列表区域 */
.list-container {
    padding: 0 32rpx;
}

.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 8rpx;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
}

.list-item:active {
    background-color: rgba(255, 255, 255, 0.03);
}

.label {
    font-size: 30rpx;
    color: #ffffff;
    line-height: 1.4;
}

.value-row {
    display: flex;
    align-items: center;
}

.value-text {
    font-size: 28rpx;
    color: #999;
    margin-right: 8rpx;
    max-width: 400rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.static-text {
    margin-right: 0;
    color: #666;
}

.arrow-icon {
    opacity: 0.4;
}

.bottom-space {
    height: 160rpx;
}

/* 底部按钮 */
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

.save-btn {
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

.save-btn.disabled {
    opacity: 0.4;
}

/* ========== 弹窗通用 ========== */
.mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    width: 100%;
    background: rgba(0, 0, 0, 0.95);
    border-radius: 32rpx 32rpx 0 0;
    padding: 40rpx 32rpx;
    padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.modal-title {
    font-size: 32rpx;
    color: #fff;
    text-align: center;
    margin-bottom: 36rpx;
    font-weight: 500;
}

.modal-actions {
    display: flex;
    gap: 24rpx;
    margin-top: 36rpx;
}

.modal-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
}

.modal-btn.cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.modal-btn.confirm {
    background: linear-gradient(90deg, #6d5dfc 0%, #c84dfb 100%);
    color: #fff;
}

/* 性别选择 */
.gender-selector {
    display: flex;
    gap: 40rpx;
    justify-content: center;
    padding: 20rpx 0;
}

.gender-item {
    width: 220rpx;
    height: 88rpx;
    opacity: 0.5;
    transition: opacity 0.2s;
}

.gender-item.active {
    opacity: 1;
}

.gender-img {
    width: 100%;
    height: 100%;
}

/* 生日选择器 */
.age-mask {
    align-items: center;
    justify-content: center;
}

.age-modal {
    width: 620rpx;
    border-radius: 32rpx;
    padding: 40rpx 32rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    padding-bottom: 40rpx;
}

/* 所在地选择器 */

.picker-body {
    height: 400rpx;
    display: flex;
    justify-content: center;
    align-items: center;
}

.picker-view {
    width: 100%;
    height: 400rpx;
    background: transparent;
}

.picker-item {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    font-weight: 600;
    color: #ffffff;
}

/* 身高体重刻度尺 */
.hw-mask {
    align-items: center;
    justify-content: center;
}

.hw-modal {
    width: 620rpx;
    border-radius: 32rpx;
    padding: 32rpx 32rpx 40rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.12);
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
}

.ruler-arrow.left .arrow-triangle {
    width: 0;
    height: 0;
    border-top: 7rpx solid transparent;
    border-bottom: 7rpx solid transparent;
    border-right: 9rpx solid rgba(255, 255, 255, 0.45);
}

.ruler-arrow.right .arrow-triangle {
    width: 0;
    height: 0;
    border-top: 7rpx solid transparent;
    border-bottom: 7rpx solid transparent;
    border-left: 9rpx solid rgba(255, 255, 255, 0.45);
}

.ruler-viewport {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.ruler-ticks {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    width: 100%;
    height: 36rpx;
    margin-bottom: 12rpx;
}

.ruler-tick {
    width: 2rpx;
    height: 14rpx;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 1rpx;
}

.ruler-tick.empty {
    background: transparent;
}

.ruler-tick.active {
    height: 36rpx;
    background: #fff;
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
}

.ruler-value-num {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.2);
}

.ruler-value-unit {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.35);
    margin-left: 4rpx;
}

.ruler-value-box.active .ruler-value-num {
    font-size: 48rpx;
    color: #fff;
    font-weight: 600;
}

.ruler-value-box.active .ruler-value-unit {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.5);
}

/* 标签选择弹窗 */
.tag-modal {
    max-height: 70vh;
    display: flex;
    flex-direction: column;
}

.tag-scroll-area {
    flex: 1;
    max-height: 400rpx;
    padding: 0 8rpx;
}

.tag-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    justify-content: flex-start;
    padding: 8rpx 0;
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
}

.tag-item.active {
    border-color: rgba(255, 255, 255, 0.9);
    color: #ffffff;
}

/* 文本输入弹窗 */
.text-input {
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
</style>
