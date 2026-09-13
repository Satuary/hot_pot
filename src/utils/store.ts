import { reactive } from 'vue';

// Global app state
export interface UserProfile {
    id: string;
    phone: string;
    nickname: string;
    gender: string;
    birthday: string;
    location: string;
    height: string;
    weight: string;
    hotpotType: string[];
    taste: string[];
    motivation: string;
    wechat: string;
    avatar: string;
    balance: number;
    matchCount: number;
}

export interface MatchRequirement {
    gender: string;
    ageMin: string;
    ageMax: string;
    hotpotType: string[];
    taste: string[];
    motivation: string;
    store: string;
    storeAddress: string;
    time: string;
    payment: string;
}

export interface Store {
    id: string;
    name: string;
    address: string;
    distance: string;
    rating: number;
    image: string;
    tags: string[];
}

export interface MatchOrder {
    id: string;
    status: string;
    createTime: string;
    requirement: MatchRequirement;
    currentUser?: {
        id: string;
        nickname: string;
        avatar: string;
    };
    matchedUser?: UserProfile;
    amount: number;
    refundStatus?: string;
}

export const appState = reactive({
    isLoggedIn: false,
    token: '',
    userProfile: {
        id: '',
        phone: '',
        nickname: '',
        gender: '',
        birthday: '',
        location: '',
        height: '170',
        weight: '60',
        hotpotType: [] as string[],
        taste: [] as string[],
        motivation: '',
        wechat: '',
        avatar: '',
        balance: 0,
        matchCount: 3,
    } as UserProfile,
    matchRequirement: {
        gender: '不限',
        ageMin: '18',
        ageMax: '35',
        hotpotType: [] as string[],
        taste: [] as string[],
        motivation: '',
        store: '',
        storeAddress: '',
        time: '',
        payment: 'AA',
    } as MatchRequirement,
    matchMode: 'precise' as 'precise' | 'blind',
    location: '上海闵行',
    transactions: [] as any[],
    orders: [] as MatchOrder[],
});

// Hot pot type options
export const hotpotTypeOptions = ['重庆火锅', '成都火锅', '潮汕牛肉', '老北京涮肉', '云南菌汤', '贵州酸汤', '海鲜火锅', '串串香', '椰子鸡'];

// Taste options
export const tasteOptions = ['麻辣', '微辣', '清汤', '番茄', '酸辣', '藤椒', '菌汤', '骨汤'];

// Motivation options
export const motivationOptions = ['想找人一起吃', '体验新店', '吃货交友', '庆祝', '解馋'];

// Payment options
export const paymentOptions = ['AA', '我请客', '对方请客'];

// Mock stores
export const mockStores: Store[] = [
    { id: '1', name: '海底捞火锅(闵行店)', address: '闵行区都市路5001号', distance: '1.2km', rating: 4.8, image: '', tags: ['服务好', '环境佳'] },
    { id: '2', name: '哥老官重庆美蛙鱼头', address: '闵行区莘庄龙之梦5楼', distance: '2.5km', rating: 4.6, image: '', tags: ['牛蛙', '麻辣'] },
    { id: '3', name: '小龙坎老火锅', address: '闵行区七宝万科广场B1', distance: '3.1km', rating: 4.5, image: '', tags: ['正宗川味'] },
    { id: '4', name: '呷哺呷哺(莘庄店)', address: '闵行区莘朱路200号', distance: '1.8km', rating: 4.3, image: '', tags: ['性价比高', '一人食'] },
    { id: '5', name: '左庭右院鲜牛肉火锅', address: '闵行区虹桥天地4楼', distance: '5.2km', rating: 4.7, image: '', tags: ['现切牛肉', '新鲜'] },
    { id: '6', name: '捞王锅物料理', address: '闵行区万象城3楼', distance: '4.0km', rating: 4.6, image: '', tags: ['猪肚鸡', '养生'] },
];

// Gender options
export const genderOptions = ['男', '女', '不限'];

// Age picker helpers
export function generateAgeRange(start: number, end: number): string[] {
    return Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
}

export function generateHeightRange(): string[] {
    return Array.from({ length: 81 }, (_, i) => String(140 + i));
}

export function generateWeightRange(): string[] {
    return Array.from({ length: 121 }, (_, i) => String(30 + i));
}
