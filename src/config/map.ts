/**
 * 高德地图 Web 服务 API 配置
 *
 * 使用前请到高德开放平台 https://lbs.amap.com/ 申请 Web 服务 API Key
 * 1. 注册/登录高德开放平台
 * 2. 创建应用 → 添加 Key → 服务平台选择「Web服务」
 * 3. 将获取到的 Key 填入下方的 AMAP_KEY
 */
export const AMAP_KEY = 'd88b9c8d2fbe5c6d751863abc6eb34a0';

/** 高德地图 Web 服务 API 基础地址 */
export const AMAP_HOST = 'https://restapi.amap.com';

/** 周边搜索接口 */
export const AMAP_AROUND_API = `${AMAP_HOST}/v3/place/around`;

/** 搜索半径（米），默认 5000 */
export const SEARCH_RADIUS = 5000;

/** 每页数量 */
export const PAGE_SIZE = 20;
