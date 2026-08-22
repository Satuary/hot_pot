import request from '@/utils/request';

// 常量配置
export const APP_CONFIG = {
  appid: 'wxdd83019598f922ec',
  host: 'https://6xk50612jg50.vicp.fun/hotpot-api',
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
 * 后端接口通过 @RequestParam 接收 code，需以 query 参数形式传递
 */
export const wechatLogin = (data: { code: string }) => {
  return request(`/loginByWechat?code=${encodeURIComponent(data.code)}`, 'POST', undefined, { noAuth: true });
};

/**
 * 手机号登录
 */
export const phoneLogin = (data: { phone: string; code: string }) => {
  return request('/api/auth/phone', 'POST', data, { noAuth: true });
};

/**
 * 发送验证码
 */
export const sendSmsCode = (data: { phone: string }) => {
  return request('/api/auth/sms', 'POST', data, { noAuth: true });
};

// ============= 匹配相关 API =============

/**
 * 发布匹配需求
 */
export const postRequirement = (data: {
  gender: string;
  ageRange: string;
  matchType: string;
  hotpotType: string;
  taste: string;
  motivation: string;
  shop:
    | {
        id: string;
        name: string;
        address: string;
        distance: string;
        image: string;
        rating: string;
      }
    | Record<string, never>;
  meetingTime: string;
  payType: string;
}) => {
  return request('/mini/demand/publish', 'POST', data);
};

/**
 * 获取匹配列表
 */
export const getMatchList = (data?: { page?: number; pageSize?: number }) => {
  return request('/api/match/list', 'GET', data);
};

/**
 * 获取推荐用户列表（匹配成功后）
 */
export const getMatchRecommend = (data: { demandId: string }) => {
  return request('/mini/match/recommend', 'GET', data);
};

/**
 * 解锁匹配用户（创建匹配关系），参数以 query 形式拼在地址栏
 */
export const createMatch = (data: { demandId: string; matchUserId: number | string }) => {
  return request(
    `/mini/match/create?demandId=${encodeURIComponent(data.demandId)}&matchUserId=${encodeURIComponent(String(data.matchUserId))}`,
    'POST',
  );
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

// ============= 好友请求相关 API =============

/**
 * 获取待处理的好友请求列表
 */
export const getPendingRequests = (data?: { page?: number; pageSize?: number }) => {
  return request('/api/match/pending-requests', 'GET', data);
};

/**
 * 同意好友请求
 */
export const acceptRequest = (data: { requestId: string }) => {
  return request('/api/match/accept', 'POST', data);
};

/**
 * 拒绝好友请求
 */
export const rejectRequest = (data: { requestId: string }) => {
  return request('/api/match/reject', 'POST', data);
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

/**
 * 获取用户信息（编辑资料回显）
 */
export const getUserInfo = () => {
  return request('/mini/user/getUserInfo', 'GET');
};

/**
 * 完善用户信息
 */
export const completeUserInfo = (data: {
  nickname: string;
  avatar: string;
  gender: number;
  birthday: string;
  height: number;
  weight: number;
  hotpotType: number;
  taste: number;
  motivation: number;
  wechat: string;
  stageName: string;
  province: string;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
}) => {
  return request('/mini/user/completeUserInfo', 'POST', data);
};



