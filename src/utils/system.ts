/**
 * 系统信息工具
 *
 * 微信已废弃 wx.getSystemInfoSync，拆分为 getWindowInfo / getDeviceInfo /
 * getAppBaseInfo / getSystemSetting / getAppAuthorizeSetting。本项目仅需
 * statusBarHeight，统一走 getWindowInfo 即可消除废弃警告。
 */

/**
 * 获取状态栏高度（px）
 * 使用 uni.getWindowInfo() 替代已废弃的 uni.getSystemInfoSync()
 */
export function getStatusBarHeight(): number {
  // #ifdef MP-WEIXIN
  try {
    const info = uni.getWindowInfo();
    return info.statusBarHeight || 0;
  } catch {
    return 0;
  }
  // #endif
  // #ifndef MP-WEIXIN
  try {
    const info = uni.getWindowInfo();
    return info.statusBarHeight || 0;
  } catch {
    return 0;
  }
  // #endif
}

/**
 * 将 http:// 图片链接升级为 https://
 * 微信小程序要求图片资源使用 HTTPS，后端若返回 http:// 地址会被拦截并告警。
 * 仅对远程 http 链接做协议替换，本地路径与已有 https 链接原样返回。
 */
export function toHttps(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://')) {
    return 'https://' + url.slice('http://'.length);
  }
  return url;
}
