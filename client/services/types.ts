// 全局类型定义：与后端 data.ts 保持一致

export interface Member {
  id: number;
  name: string;
  avatarUrl: string;
  role: string;
}

export interface Comment {
  id: number;
  memberName: string;
  avatarUrl: string;
  text: string;
  createdAt: string; // ISO
}

export type MomentKind = 'photo' | 'video';

export interface Moment {
  id: number;
  type: MomentKind;
  mediaUrl: string; // 视频地址或图片地址
  coverUrl: string; // 视频封面 / 图片
  authorId: number;
  title: string;
  description: string;
  capturedAt: string; // ISO
  likes: number[];
  favorites: number[];
  comments: Comment[];
}

export interface MemoryCard {
  id: string;
  label: string;
  title: string;
  description: string;
  yearsAgo: number;
  moments: Moment[];
}

export interface TimelineGroup {
  key: string;
  label: string;
  momentLabel: string;
  items: Moment[];
}