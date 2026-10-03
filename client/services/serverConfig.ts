import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 可配置的后端地址管理：
 * 优先级：用户手动保存(AsyncStorage) > 环境变量 EXPO_PUBLIC_API_BASE_URL
 *         > EXPO_PUBLIC_BACKEND_BASE_URL(沙箱预览) > 默认 NAS 占位符 http://192.168.1.100:7011
 */
const STORAGE_KEY = 'family.serverBaseUrl';
const DEFAULT_NAS = 'http://192.168.1.100:7011';

let cached: string | null = null;

function defaultBaseUrl(): string {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_BACKEND_BASE_URL ||
    DEFAULT_NAS
  );
}

/** 规范化：补协议、去尾部斜杠 */
function normalize(raw: string): string {
  let u = (raw || '').trim();
  if (!u) return defaultBaseUrl();
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  return u.replace(/\/+$/, '');
}

/** 启动时加载持久化的地址（覆盖在内存缓存中） */
export async function loadServerConfig(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    cached = normalize(saved && saved.trim() ? saved : defaultBaseUrl());
  } catch {
    cached = normalize(defaultBaseUrl());
  }
  return cached;
}

/** 同步获取当前生效的后端地址 */
export function getServerUrl(): string {
  if (!cached) cached = normalize(defaultBaseUrl());
  return cached;
}

/** 保存新的后端地址并持久化 */
export async function setServerUrl(url: string): Promise<string> {
  const normalized = normalize(url);
  cached = normalized;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    /* 持久化失败不影响本次生效 */
  }
  return normalized;
}

/** 测试连接：调用健康检查接口 */
export async function testServerConnection(url?: string): Promise<boolean> {
  const base = normalize(url || getServerUrl());
  try {
    const res = await fetch(`${base}/api/v1/health`);
    return res.ok;
  } catch {
    return false;
  }
}