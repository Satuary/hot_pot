import request from '@/utils/request';

// 常量配置
export const APP_CONFIG = {
  appid: 'wx83d751801e23f53d',
  host: 'https://cost.xx.com/api',
};

// ============= 用户相关 API =============

/**
 * 获取用户信息
 */
export const getPersonInfo = (data?: any) => {
  return request('/api/user/info', 'GET', data);
};

/**
 * 更新用户信息
 */
export const updatePersonInfo = (data: any) => {
  return request('/api/user/update', 'POST', data);
};

/**
 * 微信登录
 */
export const wechatLogin = (data: { code: string }) => {
  return request('/api/auth/wechat', 'POST', data);
};

/**
 * 手机号登录
 */
export const phoneLogin = (data: { phone: string; code: string }) => {
  return request('/api/auth/phone', 'POST', data);
};

/**
 * 发送验证码
 */
export const sendSmsCode = (data: { phone: string }) => {
  return request('/api/auth/sms', 'POST', data);
};

// ============= 匹配相关 API =============

/**
 * 发布匹配需求
 */
export const postRequirement = (data: {
  storeId: string;
  time: string;
  peopleCount: number;
  gender?: string;
  tags?: string[];
  remark?: string;
}) => {
  return request('/api/match/publish', 'POST', data);
};

/**
 * 获取匹配列表
 */
export const getMatchList = (data?: { page?: number; pageSize?: number }) => {
  return request('/api/match/list', 'GET', data);
};

/**
 * 开始匹配
 */
export const startMatch = (data: { requirementId: string }) => {
  return request('/api/match/start', 'POST', data);
};

/**
 * 取消匹配
 */
export const cancelMatch = (data: { matchId: string }) => {
  return request('/api/match/cancel', 'POST', data);
};

/**
 * 确认匹配
 */
export const confirmMatch = (data: { matchId: string }) => {
  return request('/api/match/confirm', 'POST', data);
};

// ============= 店铺相关 API =============

/**
 * 获取店铺列表
 */
export const getStoreList = (data?: {
  keyword?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request('/api/store/list', 'GET', data);
};

/**
 * 获取店铺详情
 */
export const getStoreDetail = (data: { storeId: string }) => {
  return request('/api/store/detail', 'GET', data);
};

// ============= 订单相关 API =============

/**
 * 获取订单列表
 */
export const getOrderList = (data?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request('/api/order/list', 'GET', data);
};

/**
 * 获取订单详情
 */
export const getOrderDetail = (data: { orderId: string }) => {
  return request('/api/order/detail', 'GET', data);
};

/**
 * 申请退款
 */
export const applyRefund = (data: { orderId: string; reason: string }) => {
  return request('/api/order/refund', 'POST', data);
};

// ============= 支付相关 API =============

/**
 * 微信支付
 */
export const wechatPay = (data: { orderId?: string; amount?: number; type?: string }) => {
  return request('/api/pay/wechat', 'POST', data);
};

/**
 * 充值
 */
export const recharge = (data: { amount: number; payType: string }) => {
  return request('/api/pay/recharge', 'POST', data);
};

/**
 * 获取交易明细
 */
export const getTransactionList = (data?: { page?: number; pageSize?: number }) => {
  return request('/api/pay/transactions', 'GET', data);
};

// ============= 其他 API =============

/**
 * 上传图片
 */
export const uploadImage = (filePath: string) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: APP_CONFIG.host + '/api/upload/image',
      filePath,
      name: 'file',
      header: {
        Authorization: uni.getStorageSync('token') || '',
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.data);
        } else {
          reject(data);
        }
      },
      fail: reject,
    });
  });
};

/**
 * 获取配置信息
 */
export const getAppConfig = () => {
  return request('/api/config', 'GET');
};



