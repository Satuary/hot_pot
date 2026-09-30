/**
 * 微信小程序订阅消息工具（一次性订阅，分业务场景授权）
 *
 * 重要限制：wx.requestSubscribeMessage 只能由用户 tap 手势触发，
 * 必须在点击事件的同步调用栈中调起（首个 await 之前），否则报
 * "requestSubscribeMessage:fail can only be invoked by user TAP gesture."
 *
 * 一次性订阅机制：用户每次点「允许」为对应模板积攒 1 条推送额度，
 * 后端发送 1 条消耗 1 条；额度不足时后端发送报 43101，需用户再次授权。
 * 类目不支持长期订阅，因此不做统一授权，改为各业务节点分别请求。
 */

/** 订阅消息模板ID配置 */
export const SUBSCRIBE_TEMPLATES = {
  /** 匹配结果通知 */
  MATCH_RESULT: 'hT3Vn9yAKYTOkq5iUzcqLnpbR6Q7NYtWPDRVOe1Wbd0',
  /** 联系方式审核通知（申请/通过/拒绝） */
  CONTACT_AUDIT: '8bHp67zRDQa2-ENRRFu7OlAVDETLCrDwrg73J9WXtPg',
  /** 退款成功通知 */
  REFUND: 'pZSJiacPL1uXhOoxtK2XJEB4lO6mMDlyn_j2yAVyRJg',
  /** 交易提醒（充值/消费） */
  TRADE: 'zRQOpea3oATbLzz88Yc4KsRh8HgPpvX_00fL4u5F3SY',
} as const;

/**
 * 调起微信原生订阅授权弹窗（必须在用户 tap 事件的同步调用栈中调用）
 * @param templateIds 模板ID数组（一次性订阅单次最多 3 个）
 * @returns 各模板授权状态 { templateId: 'accept' | 'reject' | 'ban' }
 */
export function requestSubscribe(
  templateIds: string[],
): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.requestSubscribeMessage({
      tmplIds: templateIds,
      success: (res: any) => {
        console.log('[subscribe] 订阅结果', res);
        // 只保留模板授权状态，过滤 errMsg 等附加字段
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
    console.log('[subscribe] 非微信小程序环境，跳过订阅');
    resolve({});
    // #endif
  });
}
