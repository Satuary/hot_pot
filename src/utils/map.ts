/**
 * 高德地图服务工具
 * - 获取用户当前定位
 * - 逆地理编码（坐标 → 地址）
 * - 周边 POI 搜索（火锅店 / 附近地标）
 * - IP 定位（获取城市级粗略定位）
 */
import { AMAP_KEY, AMAP_AROUND_API, AMAP_HOST, SEARCH_RADIUS, PAGE_SIZE } from '@/config/map';
import type { Store } from '@/utils/store';

/** 用户定位信息 */
export interface UserLocation {
  longitude: number;
  latitude: number;
}

/** 逆地理编码后的地址信息 */
export interface AddressInfo {
  /** 格式化地址，如"上海市闵行区xx路xx号" */
  formattedAddress: string;
  /** 简要描述，如"闵行区"、"xx路附近" */
  shortDescription: string;
  /** 地址组件 */
  addressComponent: {
    province: string;
    city: string;
    district: string;
    township: string;
    street: string;
    streetNumber: string;
  };
  /** 附近地标 POI */
  nearbyLandmarks: NearbyPoi[];
}

/** 附近地标 */
export interface NearbyPoi {
  id: string;
  name: string;
  address: string;
  location: string;
  distance: string;
  direction: string;
}

/** 高德 POI 周边搜索响应 */
interface AmapAroundResponse {
  status: string;
  info: string;
  count: string;
  pois: AmapPoi[];
}

interface AmapPoi {
  id: string;
  name: string;
  type: string;
  location: string;
  address: string;
  distance: string;
  biz_ext?: {
    rating?: string;
    cost?: string;
  };
  photos?: { url: string }[];
  keytag?: string;
}

/** 高德逆地理编码响应 */
interface AmapRegeoResponse {
  status: string;
  regeocode: {
    formatted_address: string;
    addressComponent: {
      province: string;
      city: string;
      district: string;
      township: string;
      streetNumber: { street: string; number: string };
      building: { name: string };
      neighborhood: { name: string };
    };
    /** AOI 区域（坐标点所在的地块/园区/楼宇等，如"恒润实验学校"、"中融科技大厦"） */
    aois: {
      id: string;
      name: string;
      adcode: string;
      location: string;
      area: string;
    }[];
    pois: {
      id: string;
      name: string;
      type: string;
      address: string;
      location: string;
      distance: string;
      direction: string;
    }[];
  };
}

/**
 * 获取用户当前定位（微信小程序）
 * 使用 getFuzzyLocation，无需高精度授权，更稳定
 *
 * 微信小程序注意：
 * 1. manifest.json 需声明 requiredPrivateInfos: ["getFuzzyLocation"]
 * 2. permission 中需配置 scope.userFuzzyLocation 的描述
 * 3. 首次调用会弹授权弹窗，用户拒绝后需引导至设置页开启
 * 4. 此接口无需用户开启「精确定位」开关，模糊定位即可
 */
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    // 先检查系统定位是否开启（微信小程序特有）
    uni.getSetting({
      success(settingRes) {
        const authSetting = settingRes.authSetting || {};
        // 用户已明确拒绝过授权
        if (authSetting['scope.userFuzzyLocation'] === false) {
          uni.showModal({
            title: '需要位置权限',
            content: '请在设置中允许使用位置信息，以便搜索附近火锅店',
            confirmText: '去设置',
            success(modalRes) {
              if (modalRes.confirm) {
                uni.openSetting({});
              }
            },
          });
          reject(new Error('位置权限未开启'));
          return;
        }

        // 发起模糊定位请求
        uni.getLocation({
          type: 'gcj02',
          success(res) {
            resolve({
              longitude: res.longitude,
              latitude: res.latitude,
            });
          },
          fail(err) {
            console.error('定位失败:', err);
            const msg = err.errMsg || '';
            // 系统定位未开启（iOS/Android 系统级关闭了定位）
            if (
              msg.includes('system permission denied') ||
              msg.includes('system') ||
              msg.includes('location unavailable')
            ) {
              reject(new Error('请开启手机定位服务'));
              return;
            }
            // 用户点击了拒绝授权
            if (
              msg.includes('auth deny') ||
              msg.includes('deny') ||
              msg.includes('cancel')
            ) {
              uni.showModal({
                title: '需要位置权限',
                content: '请在设置中允许使用位置信息，以便搜索附近火锅店',
                confirmText: '去设置',
                success(modalRes) {
                  if (modalRes.confirm) {
                    uni.openSetting({});
                  }
                },
              });
              reject(new Error('位置权限未开启'));
              return;
            }
            reject(new Error(msg || '定位失败'));
          },
        });
      },
      fail() {
        // getSetting 失败，直接尝试定位
        uni.getLocation({
          type: 'gcj02',
          success(res) {
            resolve({
              longitude: res.longitude,
              latitude: res.latitude,
            });
          },
          fail(err) {
            reject(new Error(err.errMsg || '定位失败'));
          },
        });
      },
    });
    // #endif

    // #ifndef MP-WEIXIN
    uni.getLocation({
      type: 'gcj02',
      success(res) {
        resolve({
          longitude: res.longitude,
          latitude: res.latitude,
        });
      },
      fail(err) {
        console.error('定位失败:', err);
        const msg = err.errMsg || '';
        if (msg.includes('auth deny') || msg.includes('deny')) {
          reject(new Error('位置权限未开启'));
        } else {
          reject(new Error(msg || '定位失败'));
        }
      },
    });
    // #endif
  });
}

/** 用户定位缓存（内存级，小程序生命周期内全局共享） */
let cachedLocation: UserLocation | null = null;

/**
 * 获取带缓存的定位：优先读取内存缓存，避免频繁调用 getLocation 耗电；
 * 缓存缺失时再调用 getUserLocation 并写入缓存。
 * 页面进入时已获取过一次位置，发布需求时直接复用缓存即可。
 */
export async function getCachedLocation(forceRefresh = false): Promise<UserLocation> {
  if (!forceRefresh && cachedLocation) {
    return cachedLocation;
  }
  const loc = await getUserLocation();
  cachedLocation = loc;
  return loc;
}

/** 周边火锅店分页搜索结果 */
export interface NearbyStoreResult {
  /** 当前页店铺列表 */
  list: Store[];
  /** 命中的总条数（由高德 count 字段返回） */
  total: number;
}

/**
 * 搜索附近火锅店
 * @param location 用户当前经纬度
 * @param page 页码，从 1 开始
 */
export function searchNearbyHotPotStore(
  location: UserLocation,
  page: number = 1,
): Promise<NearbyStoreResult> {
  return new Promise((resolve, reject) => {
    const lngLat = `${location.longitude},${location.latitude}`;

    uni.request({
      url: AMAP_AROUND_API,
      data: {
        key: AMAP_KEY,
        location: lngLat,
        keywords: '火锅',
        types: '050117',        // 火锅店
        radius: SEARCH_RADIUS,
        offset: PAGE_SIZE,
        page,
        sortrule: 'weight',
        extensions: 'all',
      },
      success(res) {
        const data = res.data as AmapAroundResponse;
        if (data.status === '1' && data.pois && data.pois.length > 0) {
          const stores: Store[] = data.pois
            .filter((poi) => {
              // 1. 高德 typecode=050117（火锅店）会混入烤肉、猪肚鸡、牛杂煲等非火锅商家，
              //    仅保留店名或 keytag 中包含"火锅"的结果，过滤掉明显非火锅店的数据
              const name = poi.name || '';
              const keytag = poi.keytag || '';
              const isHotpot = name.includes('火锅') || keytag.includes('火锅');
              // 2. 过滤评分低于 4 分的小店，大部分不符合规格的都属于低评分小店
              const rating = parseFloat(poi.biz_ext?.rating || '0');
              return isHotpot && rating >= 4;
            })
            .map((poi) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address || '',
              distance: formatDistance(parseInt(poi.distance) || 0),
              rating: parseFloat(poi.biz_ext?.rating || '0'),
              image: poi.photos?.[0]?.url || '',
              // tags: extractTags(poi.type),
              tags: poi.keytag || [],
            }))
            .sort((a, b) => b.rating - a.rating);

          resolve({ list: stores, total: parseInt(data.count) || 0 });
        } else {
          resolve({ list: [], total: 0 });
        }
      },
      fail(err) {
        reject(new Error(`搜索失败: ${err.errMsg || '未知错误'}`));
      },
    });
  });
}

/**
 * 逆地理编码：将经纬度转换为详细地址信息
 * @param location 用户当前经纬度
 */
export function reverseGeocode(location: UserLocation): Promise<AddressInfo> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${AMAP_HOST}/v3/geocode/regeo`,
      data: {
        key: AMAP_KEY,
        location: `${location.longitude},${location.latitude}`,
        extensions: 'all',
        radius: 1000,
        poitype: '商务住宅|购物服务|生活服务|餐饮服务|地名地址信息',
      },
      success(res) {
        const data = res.data as AmapRegeoResponse;
        if (data.status === '1' && data.regeocode) {
          const rg = data.regeocode;
          const ac = rg.addressComponent;

          console.log("rg", rg, "ac", ac)

          // 生成简短描述：优先显示坐标所在的具体地标，如"恒润实验学校"
          const shortDescription = generateShortDescription(ac, rg.pois, rg.aois);

          // 转换附近 POI
          const landmarks: NearbyPoi[] = (rg.pois || []).map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address || '',
            location: p.location,
            distance: p.distance,
            direction: p.direction || '',
          }));

          resolve({
            formattedAddress: rg.formatted_address,
            shortDescription,
            addressComponent: {
              province: ac.province,
              city: ac.city || ac.province,
              district: ac.district,
              township: ac.township,
              street: ac.streetNumber?.street || '',
              streetNumber: ac.streetNumber?.number || '',
            },
            nearbyLandmarks: landmarks,
          });
        } else {
          reject(new Error('逆地理编码失败'));
        }
      },
      fail(err) {
        reject(new Error(`逆地理编码失败: ${err.errMsg || '未知错误'}`));
      },
    });
  });
}

/**
 * IP 定位（粗略城市级定位，用于获取默认城市）
 */
export function ipLocation(): Promise<{ city: string; adcode: string }> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${AMAP_HOST}/v3/ip`,
      data: { key: AMAP_KEY },
      success(res) {
        const data = res.data as { status: string; city: string; adcode: string };
        if (data.status === '1') {
          resolve({ city: data.city || '未知城市', adcode: data.adcode });
        } else {
          resolve({ city: '未知城市', adcode: '' });
        }
      },
      fail(err) {
        reject(new Error(`IP定位失败: ${err.errMsg || '未知错误'}`));
      },
    });
  });
}

/**
 * 搜索附近热门商圈/地标（用于"选择附近热门地点"）
 * @param location 用户当前经纬度
 */
export function searchNearbyLandmarks(
  location: UserLocation,
): Promise<NearbyPoi[]> {
  return new Promise((resolve) => {
    uni.request({
      url: AMAP_AROUND_API,
      data: {
        key: AMAP_KEY,
        location: `${location.longitude},${location.latitude}`,
        types: '120000|060000|070000|100000',
        radius: 3000,
        offset: 10,
        page: 1,
        extensions: 'base',
      },
      success(res) {
        const data = res.data as AmapAroundResponse;
        if (data.status === '1' && data.pois) {
          resolve(data.pois.map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address || '',
            location: p.location,
            distance: formatDistance(parseInt(p.distance) || 0),
            direction: '',
          })));
        } else {
          resolve([]);
        }
      },
      fail() {
        resolve([]);
      },
    });
  });
}

/**
 * 生成位置的简短描述（优先显示坐标点所在的具体地标，如"恒润实验学校"、"中融科技大厦"）
 */
function generateShortDescription(
  ac: AmapRegeoResponse['regeocode']['addressComponent'],
  pois: AmapRegeoResponse['regeocode']['pois'],
  aois: AmapRegeoResponse['regeocode']['aois'],
): string {
  // 优先级：AOI 地标（坐标所在区域）> 街道 > 知名POI > 区
  const aoiName = aois?.[0]?.name;
  if (aoiName) {
    return aoiName;
  }

  const street = ac.streetNumber?.street;
  if (street) {
    return street;
  }

  // 取最近的地标 POI
  if (pois && pois.length > 0) {
    const nearest = pois[0];
    return `${nearest.name}附近`;
  }

  // 降级：区
  if (ac.district) {
    return ac.district;
  }

  return ac.city || '未知位置';
}

/**
 * 格式化距离显示
 * @param meters 距离（米）
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 从高德 POI 分类类型中提取标签
 */
function extractTags(typeStr: string): string[] {
  const tagMap: Record<string, string> = {
    '火锅': '火锅',
    '川菜': '川味',
    '重庆': '重庆火锅',
    '潮汕': '潮汕火锅',
    '海鲜': '海鲜火锅',
    '串串': '串串香',
    '牛肉': '鲜切牛肉',
  };

  const tags: string[] = [];
  Object.entries(tagMap).forEach(([key, tag]) => {
    if (typeStr.includes(key)) {
      tags.push(tag);
    }
  });

  if (tags.length === 0) {
    tags.push('火锅');
  }

  return [...new Set(tags)];
}
