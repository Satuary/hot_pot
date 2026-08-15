// HTTP 请求工具
interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  header?: Record<string, string>;
}

const config: RequestConfig = {
  baseURL: 'https://6xk50612jg50.vicp.fun/hotpot-api',
  timeout: 30000,
  header: {
    'Content-Type': 'application/json',
  },
};

/**
 * 封装的请求方法
 * @param url 请求地址
 * @param method 请求方法
 * @param data 请求数据
 * @returns Promise
 */
export default function request(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'get' | 'post' | 'put' | 'delete' = 'GET',
  data?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token') || '';
    
    uni.request({
      url: config.baseURL + url,
      method: method.toUpperCase() as any,
      data,
      timeout: config.timeout,
      header: {
        ...config.header,
        Authorization: token ? `Bearer ${token}` : '',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const result = res.data as any;
          if (result.code === 0 || result.code === 200) {
            // 部分接口无 data 字段（如登录接口平铺返回 token/miniUserInfo），此时返回整个响应体
            resolve(result.data !== undefined && result.data !== null ? result.data : result);
          } else {
            uni.showToast({
              title: result.message || '请求失败',
              icon: 'none',
            });
            reject(result);
          }
        } else {
          uni.showToast({
            title: '网络请求失败',
            icon: 'none',
          });
          reject(res);
        }
      },
      fail: (err) => {
        console.error('[request fail]', url, JSON.stringify(err));
        uni.showToast({
          title: '网络连接失败',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

/**
 * 上传文件
 */
export function uploadFile(filePath: string, name = 'file'): Promise<any> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || '';
    
    uni.uploadFile({
      url: config.baseURL + '/upload',
      filePath,
      name,
      header: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0 || data.code === 200) {
          resolve(data.data);
        } else {
          reject(data);
        }
      },
      fail: reject,
    });
  });
}
