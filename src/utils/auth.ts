/**
 * 认证相关工具函数
 */

const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';
const PROFILE_COMPLETE_KEY = 'profileComplete';

/**
 * 保存 token
 */
export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token);
}

/**
 * 获取 token
 */
export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || '';
}

/**
 * 删除 token
 */
export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY);
}

/**
 * 保存用户信息
 */
export function setUserInfo(userInfo: any) {
  uni.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 获取用户信息
 */
export function getUserInfo(): any {
  const userInfo = uni.getStorageSync(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 删除用户信息
 */
export function removeUserInfo() {
  uni.removeStorageSync(USER_INFO_KEY);
}

/**
 * 清除所有认证信息
 */
export function clearAuth() {
  removeToken();
  removeUserInfo();
  uni.removeStorageSync(PROFILE_COMPLETE_KEY);
}

/**
 * 检查是否已登录
 */
export function isLogin(): boolean {
  return !!getToken();
}

/**
 * 检查登录状态，未登录则跳转到登录页
 */
export function checkLogin(): boolean {
  if (!isLogin()) {
    uni.navigateTo({
      url: '/pages/login/login',
    });
    return false;
  }
  return true;
}

/**
 * 获取资料是否已完善
 */
export function isProfileComplete(): boolean {
  // if (!uni.getStorageSync(PROFILE_COMPLETE_KEY)) {
  //   return false;
  // }
  // const userInfo = getUserInfo();
  // return !!userInfo && !!userInfo.gender && userInfo.gender > 0;
  return !!uni.getStorageSync(PROFILE_COMPLETE_KEY);
}

/**
 * 设置资料完善状态
 */
export function setProfileComplete(complete: boolean) {
  uni.setStorageSync(PROFILE_COMPLETE_KEY, complete);
}
