import { reactive } from 'vue';
import type { UserLocation } from './map';

// Global app state
export interface UserProfile {
    id: string;
    userSn: string;
    phone: string;
    nickname: string;
    gender: number;
    birthday: string;
    location: string;
    height: number;
    weight: number;
    hotpotType: number;
    taste: number;
    motivation: number;
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

export const appState = reactive({
    isLoggedIn: false,
    token: '',
    userProfile: {
        id: '',
        userSn: '',
        phone: '',
        nickname: '',
        gender: 0,
        birthday: '',
        location: '',
        height: 170,
        weight: 60,
        hotpotType: 0,
        taste: 0,
        motivation: 0,
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
    location: '',
    userLocation: null as UserLocation | null,
    transactions: [] as any[]
});
