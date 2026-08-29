/**
 * WebSocket 工具封装（基于 uni.connectSocket）
 * - 连接时自动携带 token
 * - 断线自动重连（指数退避）
 * - 心跳保活
 *
 * 后端推送消息统一格式（约定）：
 * { "type": "MATCH_CREATED", "data": { ... } }
 */

// WebSocket 连接地址，与 HTTP 服务同源，按后端实际路径调整 
export const WS_BASE_URL = 'ws://159.75.239.8:9090/hotpot-api/ws/notify';

const DEFAULT_HEARTBEAT_INTERVAL = 30000; // 心跳间隔 ms
const DEFAULT_MAX_RECONNECT_TIMES = 10; // 最大重连次数
const DEFAULT_RECONNECT_BASE_DELAY = 1000; // 首次重连延迟 ms

export interface WebSocketOptions {
  url?: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: (code?: number, reason?: string) => void;
  onError?: (err: any) => void;
  reconnect?: boolean;
  maxReconnectTimes?: number;
  heartbeatInterval?: number;
}

let socketTask: UniApp.SocketTask | null = null;
let options: WebSocketOptions = {};
let manualClosed = false;
let reconnectTimes = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

// 拼接带 token 的 WebSocket 地址
function buildWsUrl(baseUrl: string): string {
  const token = uni.getStorageSync('token') || '';
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}token=${encodeURIComponent(token)}`;
}

/**
 * 建立 WebSocket 连接（可重复调用，会先关闭旧连接）
 */
export function connectWebSocket(opts: WebSocketOptions = {}) {
  options = {
    url: WS_BASE_URL,
    reconnect: true,
    maxReconnectTimes: DEFAULT_MAX_RECONNECT_TIMES,
    heartbeatInterval: DEFAULT_HEARTBEAT_INTERVAL,
    ...opts,
  };
  manualClosed = false;
  reconnectTimes = 0;
  createConnection();
}

function createConnection() {
  // 清理旧连接
  if (socketTask) {
    try {
      socketTask.close({});
    } catch (e) {
      /* ignore */
    }
    socketTask = null;
  }

  const url = buildWsUrl(options.url || WS_BASE_URL);

  socketTask = uni.connectSocket({
    url,
    complete: () => {},
  });

  socketTask.onOpen(() => {
    console.log('[websocket] 连接已建立');
    reconnectTimes = 0;
    startHeartbeat();
    options.onOpen?.();
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
    options.onMessage?.(data);
  });

  socketTask.onClose((res: any) => {
    console.log('[websocket] 连接已关闭', res?.code, res?.reason);
    stopHeartbeat();
    socketTask = null;
    options.onClose?.(res?.code, res?.reason);
    // 非手动关闭时自动重连
    if (!manualClosed && options.reconnect) {
      scheduleReconnect();
    }
  });

  socketTask.onError((err: any) => {
    console.error('[websocket] 连接出错', err);
    options.onError?.(err);
  });
}

// 指数退避重连
function scheduleReconnect() {
  if (reconnectTimer !== null || manualClosed) return;
  if (reconnectTimes >= (options.maxReconnectTimes || DEFAULT_MAX_RECONNECT_TIMES)) {
    console.warn('[websocket] 重连次数已达上限，停止重连');
    return;
  }
  const delay = Math.min(
    DEFAULT_RECONNECT_BASE_DELAY * Math.pow(2, reconnectTimes),
    30000,
  );
  reconnectTimes += 1;
  console.log(`[websocket] ${delay}ms 后进行第 ${reconnectTimes} 次重连`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createConnection();
  }, delay);
}

// 心跳保活
function startHeartbeat() {
  stopHeartbeat();
  const interval = options.heartbeatInterval || DEFAULT_HEARTBEAT_INTERVAL;
  if (interval <= 0) return;
  heartbeatTimer = setInterval(() => {
    sendMessage({ type: 'PING' });
  }, interval);
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
