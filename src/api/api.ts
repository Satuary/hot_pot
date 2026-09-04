import request from '@/utils/request';

// 常量配置
export const APP_CONFIG = {
  appid: 'wxdd83019598f922ec',
  host: 'http://159.75.239.8:9090/hotpot-api',
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
 * 需求列表项
 */
export interface DemandItem {
  /** 需求 id */
  id: number;
  /** 用户 id */
  userId: number;
  /** 性别 */
  gender: number;
  /** 年龄范围，如 "18,38" */
  ageRange: string;
  /** 匹配类型 */
  matchType: number;
  /** 火锅类型（多选，逗号分隔索引：0=重庆火锅 1=潮汕火锅 2=海鲜火锅 3=小火锅） */
  hotpotType: string;
  /** 口味（多选，逗号分隔索引：0=麻辣 1=清汤 2=番茄 3=菌锅） */
  taste: string;
  /** 动力（多选，逗号分隔索引：0=尝鲜打卡 1=解馋吃货 2=轻松社交 3=治愈心情） */
  motivation: string;
  /** 付费方式：0=我请客 1=AA 2=对方请客 */
  payType: number;
  /** 店铺 id */
  shopId: number | null;
  /** 店铺名称 */
  hotpotShop: string | null;
  /** 见面时间，如 "2025-07-19 15:30" */
  meetingTime: string;
  /** 过期时间 */
  expireTime: string;
  /** 状态 */
  status: number;
  /** 备注 */
  remark: string | null;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
  [key: string]: any;
}

/**
 * 获取需求列表
 */
export const getDemandList = (): Promise<DemandItem[]> => {
  return request('/mini/demand/list', 'GET');
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
 * 获取匹配记录详情
 */
export const getMatchDetail = (data: { recordId: string }) => {
  return request('/mini/match/detail', 'GET', data);
};

/**
 * 同意匹配（POST，recordId 拼在地址栏）
 */
export const confirmMatchRecord = (data: { recordId: string }) => {
  return request(`/mini/match/confirm?recordId=${encodeURIComponent(data.recordId)}`, 'POST');
};

/**
 * 拒绝匹配（POST，recordId 拼在地址栏）
 */
export const rejectMatchRecord = (data: { recordId: string }) => {
  return request(`/mini/match/reject?recordId=${encodeURIComponent(data.recordId)}`, 'POST');
};

/**
 * 取消匹配（POST，recordId 拼在地址栏）
 */
export const cancelMatchRecord = (data: { recordId: string }) => {
  return request(`/mini/match/cancel?recordId=${encodeURIComponent(data.recordId)}`, 'POST');
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

// ============= 联系方式交换相关 API =============

/**
 * 请求交换电话（POST）
 */
export const applyPhoneExchange = (data: { matchId: string }) => {
  return request('/mini/match/phone/apply', 'POST', data);
};

/**
 * 同意电话申请（POST）
 */
export const approvePhoneExchange = (data: { matchId: string }) => {
  return request('/mini/match/phone/approve', 'POST', data);
};

/**
 * 拒绝电话申请（POST）
 */
export const rejectPhoneExchange = (data: { matchId: string }) => {
  return request('/mini/match/phone/reject', 'POST', data);
};

/**
 * 查看对方电话（GET，参数拼在地址栏）
 */
export const viewPartnerPhone = (data: { matchId: string }) => {
  return request(`/mini/match/phone/view?matchId=${encodeURIComponent(data.matchId)}`, 'GET');
};

/**
 * 查看对方微信（GET，参数拼在地址栏）
 */
export const viewPartnerWechat = (data: { matchId: string }) => {
  return request(`/mini/match/wechat/view?matchId=${encodeURIComponent(data.matchId)}`, 'GET');
};

/**
 * 请求交换微信（POST）
 */
export const applyWechatExchange = (data: { matchId: string }) => {
  return request('/mini/match/wechat/apply', 'POST', data);
};

/**
 * 同意交换微信（POST）
 */
export const approveWechatExchange = (data: { matchId: string }) => {
  return request('/mini/match/wechat/approve', 'POST', data);
};

/**
 * 拒绝交换微信（POST）
 */
export const rejectWechatExchange = (data: { matchId: string }) => {
  return request('/mini/match/wechat/reject', 'POST', data);
};

// ============= 支付相关 API =============

/**
 * 支付套餐项
 */
export interface PackageItem {
  id: number;
  name: string;
  price: number;
  times: number;
  sort: number;
  status: number;
  /** 套餐类型：1=按次，2=按月 */
  type: number;
  remark: string | null;
}

/**
 * 支付套餐列表（按次 / 按月分组）
 */
export interface PackageListResult {
  /** 按次套餐 */
  perPackages: PackageItem[];
  /** 按月套餐 */
  monthlyPackages: PackageItem[];
}

/**
 * 获取支付套餐列表
 */
export const getPackageList = (): Promise<PackageListResult> => {
  return request('/mini/package/list', 'GET');
};

/**
 * 微信支付统一下单返回参数（小程序 requestPayment 所需）
 */
export interface WxPrepayResult {
  timeStamp: string;
  nonceStr: string;
  /** prepay_id 包装串，形如 prepay_id=xxx */
  package: string;
  signType: string;
  paySign: string;
  /** 业务订单号（如有） */
  orderNo?: string;
  [key: string]: any;
}

/**
 * 生成微信预支付订单（统一下单）
 * @param data.packageId 支付套餐 id
 */
export const wxUnifiedOrder = (data: {
  packageId: number;
}): Promise<WxPrepayResult> => {
  return request('/mini/wx/pay/unifiedOrder', 'POST', data);
};

/**
 * 微信支付订单项（交易记录）
 */
export interface WxPayOrderItem {
  /** 关联业务 id */
  relationId?: number;
  /** 订单号 */
  orderId?: string;
  /** 商户订单号 */
  outTradeNo?: string;
  /** 支付金额（单位：元） */
  price?: number;
  /** 订单类别：1=充值 */
  orderCategory?: number;
  /** 支付状态：1=已支付 */
  payStatus?: number;
  /** 购买次数 */
  payTimes?: number;
  /** 已使用次数 */
  usedTimes?: number;
  /** 使用状态 */
  useStatus?: number;
  /** 用户 id */
  userId?: number;
  /** 备注 */
  remark?: string | null;
  /** 创建时间 */
  createTime?: string;
  /** 支付时间 */
  payTime?: string;
  [key: string]: any;
}

/**
 * 微信支付订单列表返回（后端分页结构，列表在 rows）
 */
export interface WxPayOrderListResult {
  /** 当前页数据 */
  rows?: WxPayOrderItem[];
  /** 总条数 */
  total?: number;
  code?: number;
  msg?: string;
  [key: string]: any;
}

/**
 * 匹配使用记录项（使用明细）
 */
export interface MatchUsageItem {
  id: number;
  /** 使用类型 / 描述 */
  type?: number;
  /** 消耗次数 */
  count?: number;
  /** 关联的匹配记录 id */
  recordId?: number | string;
  /** 备注 / 描述 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  [key: string]: any;
}

/**
 * 匹配使用记录列表返回（后端分页结构）
 */
export interface MatchUsageListResult {
  /** 当前页数据 */
  records?: MatchUsageItem[];
  /** 总条数 */
  total?: number;
  /** 每页条数 */
  size?: number;
  /** 当前页码 */
  current?: number;
  [key: string]: any;
}

/**
 * 获取匹配使用记录列表（使用明细）
 * @param data.pageNum 页码
 * @param data.pageSize 每页条数
 */
export const getMatchUsageList = (data?: {
  pageNum?: number;
  pageSize?: number;
}): Promise<MatchUsageListResult> => {
  return request('/mini/match/usage/list', 'GET', data);
};

/**
 * 获取微信支付订单列表（交易记录）
 * @param data.pageNum 页码
 * @param data.pageSize 每页条数
 * @param data.orderCategory 订单类别（可选，1=充值）
 */
export const getWxPayOrderList = (data?: {
  pageNum?: number;
  pageSize?: number;
  orderCategory?: number;
}): Promise<WxPayOrderListResult> => {
  return request('/mini/wx/pay/order/list', 'GET', data);
};

/**
 * 微信支付订单详情（order 字段实体）
 */
export interface WxPayOrderDetail {
  /** 订单id */
  orderId?: string;
  /** 订单编号（商户订单号） */
  outTradeNo?: string;
  /** 支付金额（单位：元） */
  price?: number;
  /** 订单类型：1=按次充值，2=按月套餐 */
  orderCategory?: number;
  /** 支付状态 */
  payStatus?: number;
  /** 本次购买的次数 */
  payTimes?: number;
  /** 已使用次数 */
  usedTimes?: number;
  /** 使用状态：0=未使用，1=已使用 */
  useStatus?: number;
  /** 退款状态：0=未退款，1=已退款，2=退款失败，3=退款中 */
  refundStatus?: number;
  /** 退款原因 */
  refundReason?: string;
  /** 退款时间 */
  refundTime?: string;
  /** 退款申请时间 */
  applyRefundTime?: string;
  /** 套餐ID（按月时关联套餐表） */
  relationId?: number;
  /** 订单创建时间 */
  createTime?: string;
  /** 支付时间 */
  payTime?: string;
  [key: string]: any;
}

/**
 * 微信支付订单详情接口返回（order 平铺在响应体，附带退款相关标记）
 */
export interface WxPayOrderDetailResult {
  /** 订单详情实体 */
  order?: WxPayOrderDetail;
  /** 是否可以退款 */
  canRefund?: boolean;
  /** 原路退回（退款渠道描述） */
  refundChannel?: string;
  /** 退款状态文字（如"退款成功"等） */
  refundStatusText?: string;
  code?: number;
  msg?: string;
  [key: string]: any;
}

/**
 * 获取微信支付订单详情
 * 后端接口通过路径参数接收 orderId：/mini/wx/pay/order/{orderId}
 * @param data.orderId 订单 id
 */
export const getWxPayOrderDetail = (data: {
  orderId: string | number;
}): Promise<WxPayOrderDetailResult> => {
  return request(`/mini/wx/pay/order/${encodeURIComponent(String(data.orderId))}`, 'GET');
};

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
 * 上传图片（返回图片访问 URL）
 */
export const uploadImage = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || '';
    console.log('[uploadImage] 开始上传，filePath =', filePath);
    uni.uploadFile({
      url: APP_CONFIG.host + '/common/upload',
      filePath,
      name: 'file',
      header: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      success: (res) => {
        console.log('[uploadImage] 上传响应 statusCode =', res.statusCode, ', 原始 data =', res.data);
        try {
          const data = JSON.parse(res.data);
          console.log('[uploadImage] 解析后的对象 =', data);
          if (data.code === 0 || data.code === 200) {
            // 后端实际返回结构为顶层 url 字段，同时兼容其它可能的结构
            const url =
              data.url ||
              data.fileName ||
              (typeof data.data === 'string' ? data.data : '') ||
              data.data?.url ||
              data.data?.fileUrl ||
              '';
            console.log('[uploadImage] 候选取值 -> data.url =', data.url, ', data.fileName =', data.fileName, ', 最终 url =', url);
            if (url) {
              resolve(url);
            } else {
              console.warn('[uploadImage] code 正常但未取到 url，完整返回：', data);
              reject(data);
            }
          } else {
            console.warn('[uploadImage] code 非成功：', data.code, data);
            reject(data);
          }
        } catch (e) {
          console.error('[uploadImage] 解析响应失败', e, res.data);
          reject(e);
        }
      },
      fail: (err) => {
        console.error('[uploadImage] 上传失败', err);
        reject(err);
      },
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

/**
 * 仅更新用户地址信息（局部更新，不影响其它资料字段）
 */
export const updateUserLocation = (data: {
  province: string;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
}) => {
  return request('/mini/user/completeUserInfo', 'POST', data);
};



