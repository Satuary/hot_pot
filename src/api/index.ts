// API module for Hot Pot app
const BASE_URL = 'https://api.hotpotbuddy.com/v1';

interface ApiResponse<T = any> {
    code: number;
    data: T;
    message: string;
}

function request<T = any>(options: UniApp.RequestOptions): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
        uni.request({
            ...options,
            url: BASE_URL + options.url,
            header: {
                'Content-Type': 'application/json',
                ...options.header,
            },
            success: (res) => {
                const data = res.data as ApiResponse<T>;
                if (data.code === 0) {
                    resolve(data);
                } else {
                    uni.showToast({ title: data.message || '请求失败', icon: 'none' });
                    reject(data);
                }
            },
            fail: (err) => {
                uni.showToast({ title: '网络错误', icon: 'none' });
                reject(err);
            },
        });
    });
}

// Auth APIs
export const authApi = {
    login: (phone: string, code: string) =>
        request({ url: '/auth/login', method: 'POST', data: { phone, code } }),
    sendSms: (phone: string) =>
        request({ url: '/auth/sms', method: 'POST', data: { phone } }),
};

// Profile APIs
export const profileApi = {
    getProfile: () => request({ url: '/user/profile', method: 'GET' }),
    updateProfile: (data: any) =>
        request({ url: '/user/profile', method: 'PUT', data }),
};

// Match APIs
export const matchApi = {
    postRequirement: (data: any) =>
        request({ url: '/match/requirement', method: 'POST', data }),
    startMatch: (mode: string) =>
        request({ url: '/match/start', method: 'POST', data: { mode } }),
    getMatchResult: () => request({ url: '/match/result', method: 'GET' }),
};

// Store APIs
export const storeApi = {
    getStores: (params: any) =>
        request({ url: '/stores', method: 'GET', data: params }),
    getStoreDetail: (id: string) =>
        request({ url: `/stores/${id}`, method: 'GET' }),
};

// Order APIs
export const orderApi = {
    getOrders: (params: any) =>
        request({ url: '/orders', method: 'GET', data: params }),
    getOrderDetail: (id: string) =>
        request({ url: `/orders/${id}`, method: 'GET' }),
    cancelOrder: (id: string) =>
        request({ url: `/orders/${id}/cancel`, method: 'POST' }),
    applyRefund: (id: string, data: any) =>
        request({ url: `/orders/${id}/refund`, method: 'POST', data }),
};

// Payment APIs
export const paymentApi = {
    recharge: (packageId: number, paymentMethod: string) =>
        request({ url: '/payment/recharge', method: 'POST', data: { packageId, paymentMethod } }),
    getTransactions: (params: any) =>
        request({ url: '/payment/transactions', method: 'GET', data: params }),
};

export { BASE_URL };
