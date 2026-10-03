import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Member, Moment, Comment } from '@/services/types';
import * as api from '@/services/api';

const STORAGE_KEY = 'family-moments/current-member';

async function getDeviceMemberId(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const m = JSON.parse(raw) as { id: number };
      return m.id;
    }
  } catch (e) {
    /* ignore */
  }
  // 首次使用默认爸爸(1)
  return 1;
}

export async function persistCurrentMember(member: Member) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(member));
  } catch (e) {
    /* ignore */
  }
}

interface FamilyState {
  currentMemberId: number;
  members: Member[];
  setMembers: (m: Member[]) => void;
  setCurrentMemberId: (id: number) => void;
  addMember: (m: Member) => void;

  // 沉浸式页面的全部内容
  moments: Moment[];
  setMoments: (m: Moment[]) => void;
  upsertMoment: (m: Moment) => void;

  toggleLike: (id: number) => void;
  toggleFavorite: (id: number) => void;
  addComment: (id: number, c: Comment) => void;

  /** 从时间线/回忆跳转沉浸式浏览时，标记需要定位的时刻 id */
  pendingStartId: number | null;
  setPendingStartId: (id: number | null) => void;
}

/** 当前成员信息从 store 派生（members 中查找，缺省用爸爸兜底） */
export const useFamilyStore = create<FamilyState>((set, get) => ({
  currentMemberId: 1,
  members: [],
  moments: [],

  setMembers: (members) => set({ members }),
  setCurrentMemberId: (currentMemberId) => set({ currentMemberId }),
  addMember: (m) => set((s) => ({ members: [...s.members, m] })),

  setMoments: (moments) => set({ moments }),
  upsertMoment: (m) =>
    set((s) => {
      const exists = s.moments.some((x) => x.id === m.id);
      return { moments: exists ? s.moments.map((x) => (x.id === m.id ? m : x)) : [m, ...s.moments] };
    }),

  toggleLike: (id) => {
    const { moments, currentMemberId } = get();
    const m = moments.find((x) => x.id === id);
    if (!m) return;
    const liked = !m.likes.includes(currentMemberId);
    const next = { ...m, likes: liked ? [...m.likes, currentMemberId] : m.likes.filter((x) => x !== currentMemberId) };
    set((s) => ({ moments: s.moments.map((x) => (x.id === id ? next : x)) }));
    // 乐观更新后同步到服务端
    api.setLike(id, currentMemberId, liked).then((r) => set((s) => ({ moments: s.moments.map((x) => (x.id === id ? r.moment : x)) }))).catch(() => undefined);
  },

  toggleFavorite: (id) => {
    const { moments, currentMemberId } = get();
    const m = moments.find((x) => x.id === id);
    if (!m) return;
    const favorite = !m.favorites.includes(currentMemberId);
    const next = { ...m, favorites: favorite ? [...m.favorites, currentMemberId] : m.favorites.filter((x) => x !== currentMemberId) };
    set((s) => ({ moments: s.moments.map((x) => (x.id === id ? next : x)) }));
    api.setFavorite(id, currentMemberId, favorite).then((r) => set((s) => ({ moments: s.moments.map((x) => (x.id === id ? r.moment : x)) }))).catch(() => undefined);
  },

  addComment: (id, c) =>
    set((s) => ({
      moments: s.moments.map((m) => (m.id === id ? { ...m, comments: [...m.comments, c] } : m)),
    })),

  pendingStartId: null,
  setPendingStartId: (pendingStartId) => set({ pendingStartId }),
}));

/** 加载持久化的当前成员 */
export async function initCurrentMember() {
  const id = await getDeviceMemberId();
  useFamilyStore.getState().setCurrentMemberId(id);
}

/** 生成一个随机的设备级昵称（用于快速加入测试） */
export function randomGuestName() {
  const s = Crypto.randomUUID().slice(0, 4).toUpperCase();
  return `家人${s}`;
}