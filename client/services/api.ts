import { createFormDataFile } from '@/utils';
import { getServerUrl } from './serverConfig';

import {
  Member,
  Moment,
  MomentKind,
  MemoryCard,
  TimelineGroup,
  Comment,
} from './types';

/**
 * 当前生效的后端 API 基础地址（可配置），服务端统一 /api/v1 前缀
 * 参考 service：server/src/index.ts
 */
export const getBaseUrl = () => getServerUrl();

/** 把相对路径（如 /uploads/xxx）解析为完整可访问 URL */
export const resolveUrl = (u?: string): string => {
  if (!u) return '';
  if (u.startsWith('http')) return u;
  return `${getServerUrl()}${u}`;
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok && res.status >= 500) {
    throw new Error(`服务器错误 ${res.status}`);
  }
  return (await res.json()) as T;
}

// ---------------- 成员 ----------------
/**
 * 服务端文件：server/src/index.ts
 * 接口：GET /api/v1/members
 */
export const fetchMembers = () =>
  fetch(`${getServerUrl()}/api/v1/members`).then((r) => handle<{ members: Member[] }>(r)).then((d) => d.members);

/**
 * 服务端文件：server/src/index.ts
 * 接口：POST /api/v1/members
 * Body 参数：name: string, inviteCode: string
 */
export const joinFamily = (name: string, inviteCode: string) =>
  fetch(`${getServerUrl()}/api/v1/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, inviteCode }),
  }).then((r) => handle<{ member: Member }>(r));

// ---------------- 时刻 ----------------
/**
 * 服务端文件：server/src/index.ts
 * 接口：GET /api/v1/moments
 * Query 参数：authorId?: number, keyword?: string, startDate?: string, endDate?: string
 */
export const fetchMoments = (params?: {
  authorId?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const q = new URLSearchParams();
  if (params?.authorId) q.set('authorId', String(params.authorId));
  if (params?.keyword) q.set('keyword', params.keyword);
  if (params?.startDate) q.set('startDate', params.startDate);
  if (params?.endDate) q.set('endDate', params.endDate);
  const s = q.toString();
  return fetch(`${getServerUrl()}/api/v1/moments${s ? `?${s}` : ''}`)
    .then((r) => handle<{ moments: Moment[] }>(r)).then((d) => d.moments);
};

/**
 * 服务端文件：server/src/index.ts
 * 接口：GET /api/v1/timeline
 */
export const fetchTimeline = () =>
  fetch(`${getServerUrl()}/api/v1/timeline`)
    .then((r) => handle<{ groups: TimelineGroup[] }>(r)).then((d) => d.groups);

/**
 * 服务端文件：server/src/index.ts
 * 接口：GET /api/v1/moments/memories
 */
export const fetchMemories = () =>
  fetch(`${getServerUrl()}/api/v1/moments/memories`)
    .then((r) => handle<{ memories: MemoryCard[] }>(r)).then((d) => d.memories);

/**
 * 服务端文件：server/src/index.ts
 * 接口：POST /api/v1/moments/:id/like
 * Body 参数：memberId: number, liked: boolean
 */
export const setLike = (id: number, memberId: number, liked: boolean) =>
  fetch(`${getServerUrl()}/api/v1/moments/${id}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, liked }),
  }).then((r) => handle<{ moment: Moment }>(r));

/**
 * 服务端文件：server/src/index.ts
 * 接口：POST /api/v1/moments/:id/favorite
 * Body 参数：memberId: number, favorite: boolean
 */
export const setFavorite = (id: number, memberId: number, favorite: boolean) =>
  fetch(`${getServerUrl()}/api/v1/moments/${id}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, favorite }),
  }).then((r) => handle<{ moment: Moment }>(r));

/**
 * 服务端文件：server/src/index.ts
 * 接口：POST /api/v1/moments/:id/comments
 * Body 参数：memberName: string, avatarUrl: string, text: string
 */
export const postComment = (id: number, memberName: string, avatarUrl: string, text: string) =>
  fetch(`${getServerUrl()}/api/v1/moments/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberName, avatarUrl, text }),
  }).then((r) => handle<{ comment: Comment }>(r));

/**
 * 服务端文件：server/src/index.ts
 * 接口：POST /api/v1/moments
 * Body 参数：authorId: number, title: string, description: string, type: string, mediaUrl: string, coverUrl: string, capturedAt: string
 */
export const createMoment = (body: {
  authorId: number;
  title: string;
  description: string;
  type: MomentKind;
  mediaUrl: string;
  coverUrl?: string;
  capturedAt: string;
}) =>
  fetch(`${getServerUrl()}/api/v1/moments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => handle<{ moment: Moment }>(r));

/**
 * 服务端文件：server/src/index.ts
 * 接口：POST /api/v1/upload  (multipart/form-data, 字段名 file)
 */
export const uploadFile = async (uri: string) => {
  const form = new FormData();
  // 使用跨平台兼容的 createFormDataFile 构造文件对象
  const file = await createFormDataFile(uri, 'upload.bin', 'application/octet-stream');
  form.append('file', file as any);
  return fetch(`${getServerUrl()}/api/v1/upload`, {
    method: 'POST',
    body: form,
  }).then((r) => handle<{ url: string; type: MomentKind }>(r));
};

/**
 * 服务端文件：server/src/index.ts
 * 接口：POST /api/v1/upload (multipart, 字段 file) → POST /api/v1/moments (JSON)
 * 上传媒体文件并创建一条家庭时刻，返回创建后的 moment
 */
export const uploadMoment = (params: {
  file: { uri: string; type: 'image' | 'video'; mime: string };
  title: string;
  description: string;
  capturedAt: string;
  memberId: number;
  onProgress?: (pct: number) => void;
}): Promise<{ moment: Moment }> => {
  const fileName = params.file.uri.split('/').pop() || `shared.${params.file.type === 'video' ? 'mp4' : 'jpg'}`;
  return createFormDataFile(params.file.uri, fileName, params.file.mime).then(async (file) => {
    // 用 XHR 上传以获得真实进度（RN/Web 均支持）
    const url = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${getServerUrl()}/api/v1/upload`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && params.onProgress) {
          params.onProgress(Math.round((e.loaded / e.total) * 90));
        }
      };
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) resolve((JSON.parse(xhr.responseText) as { url: string }).url);
          else reject(new Error(`上传失败 ${xhr.status}`));
        } catch (e) { reject(e); }
      };
      xhr.onerror = () => reject(new Error('网络错误'));
      const fd = new FormData();
      fd.append('file', file as any);
      xhr.send(fd as any);
    });
    params.onProgress?.(95);
    const moment = await createMoment({
      authorId: params.memberId,
      title: params.title,
      description: params.description,
      type: params.file.type === 'video' ? 'video' : 'photo',
      mediaUrl: url,
      capturedAt: params.capturedAt,
    });
    params.onProgress?.(100);
    return moment;
  });
};