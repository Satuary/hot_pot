/**
 * 微信小程序订阅消息工具
 * 管理订阅模板ID、引导用户订阅、上报订阅状态到后端
 */

/** 订阅消息模板ID配置 */
export const SUBSCRIBE_TEMPLATES = {
  /** 匹配结果通知 */
  MATCH_RESULT: 'hT3Vn9yAKYTOkq5iUzcqLnpbR6Q7NYtWPDRVOe1Wbd0',
  /** 联系方式审核通知（申请/通过/拒绝） */
  CONTACT_AUDIT: '8bHp67zRDQa2-ENRRFu7OIAVDETLCrDwrg73J9WXtPg',
  /** 退款成功通知 */
  REFUND: 'pZSJiacPL1uXhOoxtK2XJEB4IO6mMDlyn_j2yAVyRJg',
  /** 交易提醒（充值/消费） */
  TRADE: 'zRQOpea3oATbLzz88Yc4KsRh8HgPpvX_00fL4u5F3SY',
} as const;

/** 已引导过订阅的本地标记 key */
const SUBSCRIBE_GUIDED_KEY = 'subscribe_guided';

/**
 * 请求用户订阅消息
 * @param templateIds 模板ID数组，默认订阅匹配结果 + 联系方式审核
 * @returns 用户授权结果 { templateId: 'accept' | 'reject' | 'ban' }
 */
export function requestSubscribe(
  templateIds: string[] = [SUBSCRIBE_TEMPLATES.MATCH_RESULT, SUBSCRIBE_TEMPLATES.CONTACT_AUDIT],
): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.requestSubscribeMessage({
      tmplIds: templateIds,
      success: (res) => {
        console.log('[subscribe] 订阅结果', res);
        // 过滤掉 ERROR 字段，只保留模板授权状态
        const result: Record<string, string> = {};
        templateIds.forEach((id) => {
          if (res[id]) result[id] = res[id];
        });
        resolve(result);
      },
      fail: (err) => {
        console.warn('[subscribe] 订阅失败', err);
        reject(err);
      },
    });
    // #endif

    // #ifndef MP-WEIXIN
    resolve({});
    // #endif
  });
}

/**
 * 在匹配流程中引导订阅（只引导一次）
 * 在发布需求/同意匹配等关键节点调用，用户授权后不再重复弹窗
 */
export function guideSubscribeOnce(): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    // 已引导过则跳过
    const guided = uni.getStorageSync(SUBSCRIBE_GUIDED_KEY);
    if (guided) {
      resolve(null);
      return;
    }
    uni.setStorageSync(SUBSCRIBE_GUIDED_KEY, true);

    requestSubscribe()
      .then((result) => resolve(result))
      .catch(() => resolve(null));
    // #endif

    // #ifndef MP-WEIXIN
    resolve(null);
    // #endif
  });
}

/**
 * 上报订阅状态到后端（后端据此决定离线时是否推送订阅消息）
 * @param subscribeResult 订阅结果
 */
export function reportSubscribeStatus(subscribeResult: Record<string, string>) {
  // TODO: 后端接口 ready 后取消注释
  // const accepted = Object.entries(subscribeResult)
  //   .filter(([, status]) => status === 'accept')
  //   .map(([id]) => id);
  // if (accepted.length > 0) {
  //   return request('/mini/user/subscribe', 'POST', { templateIds: accepted });
  // }
  console.log('[subscribe] 待上报订阅状态', subscribeResult);
}
