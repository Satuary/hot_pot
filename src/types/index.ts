// 用户信息类型
export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unknown';
  age?: number;
  tags?: string[];
  intro?: string;
  balance?: number;
  matchCount?: number;
  createTime?: string;
  isProfileComplete?: boolean;
}

// 匹配需求类型
export interface MatchRequirement {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  storeAddress?: string;
  time: string;
  peopleCount: number;
  gender?: 'male' | 'female' | 'any';
  tags?: string[];
  remark?: string;
  status: 'pending' | 'matching' | 'matched' | 'completed' | 'cancelled';
  createTime: string;
}

// 匹配记录类型
export interface MatchRecord {
  id: string;
  requirementId: string;
  userId: string;
  matchUserId: string;
  matchUser?: UserInfo;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  createTime: string;
  confirmTime?: string;
}

// 店铺信息类型
export interface StoreInfo {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone?: string;
  rating?: number;
  distance?: number;
  tags?: string[];
  images?: string[];
}

// 订单类型
export interface Order {
  id: string;
  userId: string;
  matchId: string;
  storeId: string;
  storeName: string;
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';
  createTime: string;
  payTime?: string;
  completedTime?: string;
}

// 交易记录类型
export interface Transaction {
  id: string;
  userId: string;
  type: 'recharge' | 'pay' | 'refund';
  amount: number;
  balance: number;
  remark?: string;
  createTime: string;
}

// 分页响应类型
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
