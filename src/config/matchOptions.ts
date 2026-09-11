/**
 * 匹配需求选项与映射（与后端 /mini/demand/publish、/mini/demand/list 的索引契约对齐）
 *
 * 索引规则（依据 api.ts 中 DemandItem 的字段注释）：
 *  - hotpotType：0=重庆火锅 1=潮汕火锅 2=海鲜火锅 3=小火锅（0 起）
 *  - taste：1=麻辣 2=清汤 3=番茄 4=菌锅（1 起）
 *  - motivation：0=尝鲜打卡 1=解馋吃货 2=轻松社交 3=治愈心情（0 起）
 *  - gender：1=男 2=女
 *  - payType：0=我请客 1=AA 2=对方请客
 */

// ============= 性别 =============
export interface GenderOption {
  value: string;
  label: string;
  imgNormal: string;
  imgActive: string;
  /** 后端枚举值 */
  code: number;
}

export const genderOptions: GenderOption[] = [
  { value: 'male', label: '男生', imgNormal: '/static/imgs/boy_d.png', imgActive: '/static/imgs/boys.png', code: 1 },
  { value: 'female', label: '女生', imgNormal: '/static/imgs/girls_d.png', imgActive: '/static/imgs/girls.png', code: 2 },
];

/** 前端 value → 后端 code */
export const genderMap: Record<string, number> = { male: 1, female: 2 };
/** 后端 code → 中文标签（展示用） */
export const genderCodeText: Record<number, string> = { 1: '男', 2: '女' };

// ============= 火锅类型（0 起） =============
export const hotpotTypes = ['重庆火锅', '潮汕火锅', '海鲜火锅', '小火锅'];
/** 后端 code → 中文标签 */
export const hotpotTypeText: Record<number, string> = hotpotTypes.reduce(
  (m, name, idx) => ((m[idx] = name), m),
  {} as Record<number, string>,
);

// ============= 口味（1 起） =============
/** 数组下标 0 占位，1 起为有效枚举，便于后端 code 直接做下标 */
export const flavors = ['', '麻辣', '清汤', '番茄', '菌锅'];
/** 后端 code → 中文标签 */
export const flavorText: Record<number, string> = flavors.reduce(
  (m, name, idx) => (idx === 0 ? m : ((m[idx] = name), m)),
  {} as Record<number, string>,
);
/** 口味枚举数组（不含占位，用于标签渲染） */
export const flavorOptions = flavors.slice(1);

// ============= 动力（0 起） =============
export const motivations = ['尝鲜打卡', '解馋吃货', '轻松社交', '治愈心情'];
export const motivationText: Record<number, string> = motivations.reduce(
  (m, name, idx) => ((m[idx] = name), m),
  {} as Record<number, string>,
);

// ============= 付费方式 =============
export interface PaymentOption {
  value: string;
  label: string;
  code: number;
}

export const paymentMethods: PaymentOption[] = [
  { value: 'me', label: '我请客', code: 0 },
  { value: 'AA', label: 'AA', code: 1 },
  { value: 'other', label: '对方请客', code: 2 },
];

/** 前端 value → 后端 code */
export const payTypeMap: Record<string, number> = paymentMethods.reduce(
  (m, item) => ((m[item.value] = item.code), m),
  {} as Record<string, number>,
);
/** 后端 code → 中文标签 */
export const payTypeCodeText: Record<number, string> = paymentMethods.reduce(
  (m, item) => ((m[item.code] = item.label), m),
  {} as Record<number, string>,
);

// ============= 工具方法 =============
/** 前端口味标签 → 后端 code（1 起） */
export const flavorToCode = (label: string): number => flavors.indexOf(label);
/** 前端口味标签 → 后端 code 字符串（1 起） */
export const flavorToCodeStr = (label: string): string => String(flavorToCode(label));
