/**
 * WebSocket 工具封装（基于 uni.connectSocket）
 * - 全局单例连接：整个 App 生命周期只维护一条连接，页面/组件通过订阅接收消息
 * - 连接时自动携带 token
 * - 断线自动重连（指数退避）
 * - 心跳保活
 *
 * 后端推送消息统一格式（约定）：
 * {
 *   "type": "MATCH_CREATED",        // 事件类型
 *   "message": "有人向你发起匹配",   // 事件描述文案
 *   "recordId": 123,                // 匹配记录ID（同意/拒绝等接口的参数）
 *   "demandId": 456,                // 需求ID
 *   "senderUserId": 10,             // 发起方用户ID
 *   "data": {                       // 双方用户信息
 *     "selfUser":  { "userId": 12, "nickName": "小明", "avatarUrl": "..." },
 *     "otherUser": { "userId": 10, "nickName": "小红", "avatarUrl": "..." }
 *   },
 *   "timestamp": 1725612345678
 * }
 */

// WebSocket 连接地址，与 HTTP 服务同源，按后端实际路径调整
export const WS_BASE_URL = 'ws://159.75.239.8:9090/hotpot-api/ws/notify';

const DEFAULT_HEARTBEAT_INTERVAL = 30000; // 心跳间隔 ms
const DEFAULT_MAX_RECONNECT_TIMES = 10; // 最大重连次数
const DEFAULT_RECONNECT_BASE_DELAY = 1000; // 首次重连延迟 ms
const HEARTBEAT_INTERVAL = DEFAULT_HEARTBEAT_INTERVAL;
const MAX_RECONNECT_TIMES = DEFAULT_MAX_RECONNECT_TIMES;
const RECONNECT_BASE_DELAY = DEFAULT_RECONNECT_BASE_DELAY;

type MessageHandler = (data: any) => void;
type OpenHandler = () => void;
type CloseHandler = (code?: number, reason?: string) => void;
type ErrorHandler = (err: any) => void;

let socketTask: UniApp.SocketTask | null = null;
let manualClosed = false;
let reconnectTimes = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

// 订阅者集合：连接事件统一分发给所有订阅者，页面/组件不持有连接
const messageHandlers = new Set<MessageHandler>();
const openHandlers = new Set<OpenHandler>();
const closeHandlers = new Set<CloseHandler>();
const errorHandlers = new Set<ErrorHandler>();

// 拼接带 token 的 WebSocket 地址
function buildWsUrl(baseUrl: string): string {
  const token = uni.getStorageSync('token') || '';
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}token=${encodeURIComponent(token)}`;
}

/**
 * 建立全局 WebSocket 连接（幂等：已存在连接时直接复用，不重复创建）
 */
export function connectWebSocket(url: string = WS_BASE_URL) {
  manualClosed = false;
  // 已连接或连接中，复用现有单例
  if (socketTask) {
    return;
  }
  reconnectTimes = 0;
  createConnection(url);
}

function createConnection(url: string) {
  // 清理旧连接
  if (socketTask) {
    try {
      socketTask.close({});
    } catch (e) {
      /* ignore */
    }
    socketTask = null;
  }

  const wsUrl = buildWsUrl(url);

  socketTask = uni.connectSocket({
    url: wsUrl,
    complete: () => {},
  });

  socketTask.onOpen(() => {
    console.log('[websocket] 连接已建立');
    reconnectTimes = 0;
    startHeartbeat();
    openHandlers.forEach((handler) => {
      try {
        handler();
      } catch (e) {
        console.error('[websocket] onOpen 订阅者执行异常', e);
      }
    });
  });

  socketTask.onMessage((res: any) => {
    let data: any = res.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // 非 JSON 消息原样抛出
      }
    }
    messageHandlers.forEach((handler) => {
      try {
        handler(data);
      } catch (e) {
        console.error('[websocket] onMessage 订阅者执行异常', e);
      }
    });
  });

  socketTask.onClose((res: any) => {
    console.log('[websocket] 连接已关闭', res?.code, res?.reason);
    stopHeartbeat();
    socketTask = null;
    closeHandlers.forEach((handler) => {
      try {
        handler(res?.code, res?.reason);
      } catch (e) {
        console.error('[websocket] onClose 订阅者执行异常', e);
      }
    });
    // 非手动关闭时自动重连
    if (!manualClosed) {
      scheduleReconnect(url);
    }
  });

  socketTask.onError((err: any) => {
    console.error('[websocket] 连接出错', err);
    errorHandlers.forEach((handler) => {
      try {
        handler(err);
      } catch (e) {
        console.error('[websocket] onError 订阅者执行异常', e);
      }
    });
  });
}

// 指数退避重连
function scheduleReconnect(url: string) {
  if (reconnectTimer !== null || manualClosed) return;
  if (reconnectTimes >= MAX_RECONNECT_TIMES) {
    console.warn('[websocket] 重连次数已达上限，停止重连');
    return;
  }
  const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectTimes), 30000);
  reconnectTimes += 1;
  console.log(`[websocket] ${delay}ms 后进行第 ${reconnectTimes} 次重连`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createConnection(url);
  }, delay);
}

// 心跳保活
function startHeartbeat() {
  stopHeartbeat();
  if (HEARTBEAT_INTERVAL <= 0) return;
  heartbeatTimer = setInterval(() => {
    sendMessage({ type: 'PING' });
  }, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
  if (heartbeatTimer !== null) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

/**
 * 发送消息（对象自动序列化为 JSON）
 */
export function sendMessage(data: any): boolean {
  if (!socketTask) return false;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  socketTask.send({
    data: payload,
    fail: (err) => console.error('[websocket] 发送失败', err),
  });
  return true;
}

/**
 * 当前是否已建立连接
 */
export function isWebSocketConnected(): boolean {
  return !!socketTask;
}

/**
 * 手动断开连接（断开后不再自动重连）
 */
export function disconnectWebSocket() {
  manualClosed = true;
  stopHeartbeat();
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socketTask) {
    try {
      socketTask.close({});
    } catch (e) {
      /* ignore */
    }
    socketTask = null;
  }
  console.log('[websocket] 已手动断开');
}

/**
 * 订阅服务端推送消息，返回取消订阅函数
 * 页面/组件在 onMounted/onShow 订阅，onUnmounted/onHide 调用返回的退订函数
 */
export function onWsMessage(handler: MessageHandler): () => void {
  messageHandlers.add(handler);
  return () => {
    messageHandlers.delete(handler);
  };
}

/**
 * 订阅连接建立事件，返回取消订阅函数
 */
export function onWsOpen(handler: OpenHandler): () => void {
  openHandlers.add(handler);
  return () => {
    openHandlers.delete(handler);
  };
}

/**
 * 订阅连接关闭事件，返回取消订阅函数
 */
export function onWsClose(handler: CloseHandler): () => void {
  closeHandlers.add(handler);
  return () => {
    closeHandlers.delete(handler);
  };
}

/**
 * 订阅连接错误事件，返回取消订阅函数
 */
export function onWsError(handler: ErrorHandler): () => void {
  errorHandlers.add(handler);
  return () => {
    errorHandlers.delete(handler);
  };
}
