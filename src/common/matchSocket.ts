/**
 * 全局匹配消息处理模块（单例）
 * - App 启动/登录后调用 startMatchSocket() 建立全局连接，全程只注册一次消息监听
 * - 所有页面共享同一套匹配推送处理：
 *   - 匹配请求（MATCH_CREATED）：在匹配页时展示自定义请求弹窗；其他页面用原生模态框兜底
 *   - 匹配结果/联系方式交换：统一使用 uni.showModal / uni.showToast，任意页面可达
 * - 匹配页（match.vue）只负责渲染弹窗与绑定按钮，弹窗状态与接口逻辑都在本模块
 */
import { ref } from 'vue';
import {
    approveWechatExchange,
    rejectWechatExchange,
    approvePhoneExchange,
    rejectPhoneExchange,
    rejectMatchRecord,
    confirmMatchRecord,
} from '@/api/api';
import { isLogin } from '@/utils/auth';
import { connectWebSocket, disconnectWebSocket, onWsMessage } from '@/utils/websocket';

// WebSocket 推送事件类型
export const WS_EVENT = {
    MATCH_CREATED: 'MATCH_CREATED', // 匹配请求
    MATCH_CONFIRMED: 'MATCH_CONFIRMED', // 匹配确认
    MATCH_REJECTED: 'MATCH_REJECTED', // 匹配拒绝
    MATCH_CANCELED: 'MATCH_CANCELED', // 匹配取消
    MATCH_TIMEOUT: 'MATCH_TIMEOUT', // 匹配超时
    WECHAT_REJECTED: 'WECHAT_REJECTED', // 微信联系方式拒绝
    WECHAT_APPLY: 'WECHAT_APPLY', // 微信联系方式申请
    WECHAT_APPROVED: 'WECHAT_APPROVED', // 微信联系方式同意
    PHONE_APPLY: 'PHONE_APPLY', // 电话联系方式申请
    PHONE_APPROVED: 'PHONE_APPROVED', // 电话联系方式同意
    PHONE_REJECTED: 'PHONE_REJECTED', // 电话联系方式拒绝
} as const;

// 待处理的匹配请求队列（同一记录去重）
export const pendingRequests = ref<any[]>([]);
// 自定义匹配请求弹窗是否展示（仅匹配页渲染）
export const showFriendRequest = ref(false);
// 匹配请求处理完成计数器：每次同意/拒绝成功后 +1，供 match.vue 监听以关闭本地的 MatchSuccessModal 选人弹窗
export const matchRequestHandled = ref(0);
// 当前展示的请求
export const currentRequest = ref({
    avatar: '',
    description: '',
    requestId: '',
});
// 弹窗按钮请求中标记，防止重复点击重复调接口
const requestSubmitting = ref(false);
// 匹配页是否在前台：前台时用自定义弹窗，后台时用原生模态框兜底
const matchPageVisible = ref(false);
// 对方资料页（partnerProfile）是否在前台：前台时联系方式交换事件由该页处理（状态回显+弹窗）
export const partnerPageVisible = ref(false);

let initialized = false;

/**
 * 启动全局匹配 socket：已登录则注册监听并建立连接（幂等，可重复调用）
 */
export function startMatchSocket() {
    if (!isLogin()) return;
    initMatchSocket();
    connectWebSocket();
}

/**
 * 停止全局匹配 socket：退出登录时调用，断开连接并清空弹窗状态
 */
export function stopMatchSocket() {
    disconnectWebSocket();
    resetMatchState();
}

/**
 * 注册全局消息监听（只注册一次）
 */
function initMatchSocket() {
    if (initialized) return;
    initialized = true;
    onWsMessage(handleWsMessage);
    console.log('[matchSocket] 全局匹配消息监听已注册');
}

/**
 * 清空匹配请求相关状态（退出登录/超时时调用）
 */
function resetMatchState() {
    pendingRequests.value = [];
    showFriendRequest.value = false;
    requestSubmitting.value = false;
    currentRequest.value = { avatar: '', description: '', requestId: '' };
}

/**
 * 关闭全部匹配相关弹窗并清理持久化标记
 * 在匹配终态（被对方拒绝 MATCH_REJECTED、对方取消 MATCH_CANCELED）时调用：
 * - 清空内存中的匹配请求队列与自定义请求弹窗
 * - 移除等待弹窗/选人弹窗/盲盒弹窗的本地标记，避免 onShow 时弹窗被恢复
 */
export function closeAllMatchPopups() {
    resetMatchState();
    uni.removeStorageSync('showWaitingPopup');
    uni.removeStorageSync('pendingMatchSuccess');
    uni.removeStorageSync('pendingBlindBox');
}

/**
 * 匹配页 onShow/onHide 调用：标记匹配页是否在前台
 * 回到前台时若队列中还有未处理请求，继续弹出自定义弹窗
 */
export function setMatchPageVisible(visible: boolean) {
    matchPageVisible.value = visible;
    if (visible && !showFriendRequest.value) {
        console.log("setMatchPageVisible -----")
        console.log('matchPageVisible', matchPageVisible.value);
        console.log("setMatchPageVisible -----")
        showNextRequest();
    }
}

/**
 * 对方资料页 onShow/onHide 调用：标记是否在前台
 * 在前台时联系方式交换（微信/电话）事件由该页自行处理，全局不再重复弹窗
 */
export function setPartnerPageVisible(visible: boolean) {
    partnerPageVisible.value = visible;
}

// 处理 WebSocket 推送的消息
function handleWsMessage(data: any) {
    if (!data || typeof data !== 'object') return;
    const type = data.type || data.eventType || data.event;
    if (!type) return;

    // 消息约定：recordId/demandId/message/senderUserId 在消息顶层，双方用户信息在 data.otherUser/selfUser
    const msg = data.payload || data;
    const body = msg.data || {};
    console.log('[matchSocket] 收到消息:', type, body);
    
    const otherUser = body.otherUser || msg.otherUser || msg.user || {};
    const otherNickname = otherUser.nickName || otherUser.nickname || msg.nickname || '';
    const otherAvatar = otherUser.avatarUrl || otherUser.avatar || msg.avatar || '';
    const recordId = msg.recordId ?? body.recordId ?? msg.requestId ?? '';

    // 联系方式交换类事件（微信/电话）：对方资料页在前台时由该页自行处理（状态回显+页面内弹窗），全局不重复弹
    const isExchangeEvent =
        type === WS_EVENT.WECHAT_APPLY ||
        type === WS_EVENT.WECHAT_APPROVED ||
        type === WS_EVENT.WECHAT_REJECTED ||
        type === WS_EVENT.PHONE_APPLY ||
        type === WS_EVENT.PHONE_APPROVED ||
        type === WS_EVENT.PHONE_REJECTED;
    if (isExchangeEvent && partnerPageVisible.value) return;

    switch (type) {
        // 有人向你发起匹配
        case WS_EVENT.MATCH_CREATED: {
            const req = {
                // 同意/拒绝接口均以 recordId 为参数
                id: recordId !== '' ? String(recordId) : 'req_' + Date.now(),
                avatar: otherAvatar || '/static/imgs/default-avatar.jpeg',
                nickname: otherNickname || '神秘火锅搭子',
                description: body.description || msg.description || `${otherNickname || '对方'} 想与你一起恰火锅~`,
            };
            // 同一匹配记录去重，避免重复推送弹多个窗
            if (pendingRequests.value.some((r: any) => r.id === req.id)) return;
            pendingRequests.value.push(req);

            if (matchPageVisible.value) {
                // 匹配页在前台：展示自定义请求弹窗
                if (!showFriendRequest.value) {
                    console.log("handleWsMessage -----")
                    console.log('MATCH_CREATED', pendingRequests.value);
                    console.log("handleWsMessage -----")
                    showNextRequest();
                }
            } else {
                // 其他页面：原生模态框兜底，保证任意页面都能收到匹配请求
                showNativeRequestModal(req);
            }
            break;
        }
        // 对方已同意匹配：发起方收到，弹出成功提示，可跳转查看页
        case WS_EVENT.MATCH_CONFIRMED: {
            // 同步匹配记录，供查看页拉取匹配详情；等待态结束
            if (recordId !== '') {
                uni.setStorageSync('recordId', String(recordId));
            }
            closeAllMatchPopups();
            uni.showModal({
                title: '匹配成功',
                content: `${otherNickname || '对方'} 已同意匹配，快去看看吧~`,
                confirmText: '去看看',
                cancelText: '稍后',
                success: (res) => {
                    if (res.confirm) {
                        uni.switchTab({ url: '/pages/tabBar/view' });
                    }
                },
            });
            break;
        }
        // 对方已拒绝匹配：发起方收到，关闭全部弹窗并清理等待态
        case WS_EVENT.MATCH_REJECTED: {
            closeAllMatchPopups();
            uni.removeStorageSync('recordId');
            uni.showModal({
                title: '匹配未成功',
                content: msg.message || '对方已拒绝匹配，换个火锅搭子试试吧~',
                showCancel: false,
                confirmText: '我知道了',
            });
            break;
        }
        // 对方已取消匹配：接收方收到，关闭全部弹窗
        case WS_EVENT.MATCH_CANCELED: {
            closeAllMatchPopups();
            uni.removeStorageSync('recordId');
            uni.showToast({ title: msg.message || '对方已取消匹配', icon: 'none' });
            break;
        }
        // 匹配已超时：关闭所有匹配相关弹窗并清理等待态
        case WS_EVENT.MATCH_TIMEOUT: {
            closeAllMatchPopups();
            uni.removeStorageSync('recordId');
            uni.showToast({ title: msg.message || '匹配已超时', icon: 'none' });
            break;
        }
        // 有人申请交换微信
        case WS_EVENT.WECHAT_APPLY: {
            uni.showModal({
                title: '微信交换申请',
                content: `${otherNickname || '对方'} 想与你交换微信，是否同意？`,
                confirmText: '同意',
                cancelText: '拒绝',
                success: (res) => {
                    if (res.confirm) {
                        approveWechatExchange({ recordId })
                            .then(() => {
                                uni.showToast({ title: '已同意交换微信', icon: 'success' });
                            })
                            .catch(() => {});
                    } else {
                        rejectWechatExchange({ recordId }).catch(() => {});
                    }
                },
            });
            break;
        }
        // 对方已同意交换微信
        case WS_EVENT.WECHAT_APPROVED: {
            const wechat = msg.wechat || body.wechat || msg.wechatId || '';
            uni.showModal({
                title: '对方已同意交换微信',
                content: wechat ? `对方微信号：${wechat}` : '对方已同意交换微信，快去打个招呼吧~',
                confirmText: '复制微信号',
                showCancel: false,
                success: () => {
                    if (wechat) {
                        uni.setClipboardData({ data: wechat });
                    }
                },
            });
            break;
        }
        // 对方拒绝交换微信
        case WS_EVENT.WECHAT_REJECTED: {
            uni.showToast({ title: '对方拒绝交换微信', icon: 'none' });
            break;
        }
        // 有人申请交换电话
        case WS_EVENT.PHONE_APPLY: {
            uni.showModal({
                title: '电话交换申请',
                content: `${otherNickname || '对方'} 想与你交换电话，是否同意？`,
                confirmText: '同意',
                cancelText: '拒绝',
                success: (res) => {
                    if (res.confirm) {
                        approvePhoneExchange({ recordId })
                            .then(() => {
                                uni.showToast({ title: '已同意交换电话', icon: 'success' });
                            })
                            .catch(() => {});
                    } else {
                        rejectPhoneExchange({ recordId }).catch(() => {});
                    }
                },
            });
            break;
        }
        // 对方已同意交换电话
        case WS_EVENT.PHONE_APPROVED: {
            const phone = msg.phone || body.phone || msg.mobile || msg.phoneNumber || '';
            uni.showModal({
                title: '对方已同意交换电话',
                content: phone ? `对方电话：${phone}` : '对方已同意交换电话，快去联系吧~',
                confirmText: '复制电话',
                showCancel: false,
                success: () => {
                    if (phone) {
                        uni.setClipboardData({ data: phone });
                    }
                },
            });
            break;
        }
        // 对方拒绝交换电话
        case WS_EVENT.PHONE_REJECTED: {
            uni.showToast({ title: '对方拒绝交换电话', icon: 'none' });
            break;
        }
        default:
            console.log('[matchSocket] 未处理的事件类型:', type, msg);
    }
}

// 其他页面收到匹配请求时的原生模态框兜底
function showNativeRequestModal(req: any) {
    uni.showModal({
        title: '匹配请求',
        content: `${req.nickname} 想与你一起恰火锅，是否同意？`,
        confirmText: '同意',
        cancelText: '不合适',
        success: (res) => {
            const action = res.confirm
                ? confirmMatchRecord({ recordId: req.id })
                : rejectMatchRecord({ recordId: req.id });
            action
                .then(() => {
                    removePendingRequest(req.id);
                    uni.showToast({
                        title: res.confirm ? '已同意，快去聊聊吧' : '已拒绝',
                        icon: res.confirm ? 'success' : 'none',
                        duration: 2000,
                    });
                })
                .catch(() => {
                    // 失败提示已由 request 统一处理，记录保留在队列，回到匹配页可重试
                });
        },
    });
}

// 展示下一个待处理请求（匹配页自定义弹窗）
function showNextRequest() {
    if (pendingRequests.value.length === 0) return;

    const req = pendingRequests.value[0];
    currentRequest.value = {
        avatar: req.avatar,
        description: req.description,
        requestId: req.id,
    };
    console.log('showNextRequest', req);
    showFriendRequest.value = true;

    // 震动提醒
    // #ifdef MP-WEIXIN
    uni.vibrateLong();
    // #endif
}

// 从待处理队列中移除指定匹配记录（对方取消/超时/已处理），若正在展示则关闭弹窗并切到下一条
function removePendingRequest(id: string) {
    if (!id) return;
    pendingRequests.value = pendingRequests.value.filter((r: any) => String(r.id) !== id);
    if (showFriendRequest.value && String(currentRequest.value.requestId) === id) {
        showFriendRequest.value = false;
        setTimeout(() => {
            console.log("removePendingRequest -----")
            console.log('removePendingRequest', id);
            console.log('pendingRequests', pendingRequests.value);
            console.log("removePendingRequest -----")
            showNextRequest();
        }, 300);
    }
}

/**
 * 同意当前匹配请求（匹配页自定义弹窗"同意"按钮）
 * 成功后写入 recordId、清理选人弹窗标记并跳转查看页；失败弹窗保留可重试
 */
export async function acceptCurrentRequest() {
    const reqId = currentRequest.value.requestId;
    if (requestSubmitting.value) return;
    requestSubmitting.value = true;
    try {
        await confirmMatchRecord({ recordId: reqId });
    } catch {
        // 失败提示已由 request 统一处理，弹窗保留可重试
        return;
    } finally {
        requestSubmitting.value = false;
    }
    // 同意成功：同步匹配记录 recordId（MATCH_CONFIRMED 仅推送给发起方，接收方需自行写入），供查看页拉取匹配详情
    if (reqId) {
        uni.setStorageSync('recordId', String(reqId));
    }
    // 从队列移除已同意的请求并关闭弹窗；不自动弹下一条，稍后跳转查看页，剩余请求回到匹配页时再处理
    pendingRequests.value = pendingRequests.value.filter((r: any) => String(r.id) !== String(reqId));
    showFriendRequest.value = false;
    // 已匹配成功，旧的匹配成功选人弹窗不再恢复
    uni.removeStorageSync('pendingMatchSuccess');
    closeAllMatchPopups();
    // 通知 match.vue 关闭本地 MatchSuccessModal 选人弹窗
    matchRequestHandled.value++;

    uni.showToast({
        title: '已同意，快去聊聊吧',
        icon: 'success',
        duration: 1500,
    });

    // 与发起方一致：跳转查看页查看匹配详情
    setTimeout(() => {
        uni.switchTab({ url: '/pages/tabBar/view' });
    }, 1500);
}

/**
 * 拒绝当前匹配请求（匹配页自定义弹窗"不合适"按钮）
 * 成功后关闭弹窗并展示下一个；失败弹窗保留可重试
 */
export async function rejectCurrentRequest() {
    const reqId = currentRequest.value.requestId;
    if (requestSubmitting.value) return;
    requestSubmitting.value = true;
    try {
        await rejectMatchRecord({ recordId: reqId });
    } catch {
        // 失败提示已由 request 统一处理，弹窗保留可重试
        return;
    } finally {
        requestSubmitting.value = false;
    }
    // 从队列移除已拒绝的请求（同时关闭弹窗），否则 showNextRequest 会再次取到同一条导致弹窗重现；队列还有请求时自动展示下一条
    removePendingRequest(reqId);
    // 拒绝后清除匹配成功选人弹窗的恢复标记，避免回到匹配页 onShow 时旧弹窗再次出现
    uni.removeStorageSync('pendingMatchSuccess');
    uni.removeStorageSync('recordId');
    closeAllMatchPopups();
    // 通知 match.vue 关闭本地 MatchSuccessModal 选人弹窗
    matchRequestHandled.value++;

    uni.showToast({
        title: '已拒绝',
        icon: 'none',
        duration: 1500,
    });
}
