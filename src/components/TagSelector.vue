<template>
  <view class="tag-selector">
    <view class="tag-list">
      <view
        v-for="(item, index) in options"
        :key="index"
        class="tag"
        :class="{ active: isSelected(item) }"
        @click="handleSelect(item)"
      >
        {{ item }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string[];
  options: string[];
  multiple?: boolean;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  max: 999,
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  change: [value: string[]];
}>();

const isSelected = (item: string) => {
  return props.modelValue.includes(item);
};

const handleSelect = (item: string) => {
  let newValue: string[] = [];
  
  if (props.multiple) {
    if (isSelected(item)) {
      newValue = props.modelValue.filter((v) => v !== item);
    } else {
      if (props.modelValue.length < props.max) {
        newValue = [...props.modelValue, item];
      } else {
        uni.showToast({
          title: `最多选择${props.max}个`,
          icon: 'none',
        });
        return;
      }
    }
  } else {
    newValue = [item];
  }
  
  emit('update:modelValue', newValue);
  emit('change', newValue);
};
</script>

<style lang="scss" scoped>
.tag-selector {
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 16rpx 32rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: 2rpx solid #404040;
    color: #B0B0B0;
    background: transparent;
    transition: all 0.3s;
    
    &.active {
      background: linear-gradient(135deg, #FF6B3D, #FF3D3D);
      border-color: transparent;
      color: #FFFFFF;
    }
  }
}
</style>
