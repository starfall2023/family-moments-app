import dayjs from 'dayjs';

export interface Member {
  id: number;
  name: string;
  avatarUrl: string;
  role: string; // 家庭角色，如 爸爸 / 妈妈 / 女儿
}

export interface Comment {
  id: number;
  memberName: string;
  avatarUrl: string;
  text: string;
  createdAt: string; // ISO
}

export interface Moment {
  id: number;
  type: 'photo' | 'video';
  mediaUrl: string; // 视频地址或图片地址
  coverUrl: string; // 视频封面 / 图片
  authorId: number;
  title: string;
  description: string;
  capturedAt: string; // ISO
  sortedAt: string; // ISO 用于排序
  likes: number[]; // member ids
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

// ---------- 静态媒体资源 ----------
const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const AVATARS = [
  u('photo-1527980965255-d3b416303d12', 200),
  u('photo-1544005313-94ddf0286df2', 200),
  u('photo-1500648767791-00dcc994a43e', 200),
  u('photo-1438761681033-6461ffad8d80', 200),
];

const PHOTOS = [
  u('photo-1517841905240-472988babdf9'),
  u('photo-1516589178581-6cd7833ae3b2'),
  u('photo-1529626455594-4ff0802cfb7e'),
  u('photo-1529634806980-85c3dd6d34ac'),
  u('photo-1533228876829-65c94e7b5025'),
  u('photo-1553322378-eb94e5966d0c'),
  u('photo-1470071459604-3b5ec3a7fe05'),
  u('photo-1506744038136-46273834b3fb'),
  u('photo-1464822759023-fed622ff2c3b'),
  u('photo-1441974231531-c6227db76b6e'),
  u('photo-1471922694854-ff1b63b20054'),
  u('photo-1507525428034-b723cf961d3e'),
  u('photo-1519046904884-53103b34b206'),
  u('photo-1528164344705-47542687000d'),
  u('photo-1504609773096-104ff2c73ba4'),
  u('photo-1447752875215-b2761acb3c5d'),
];

const VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
];

const photos = (a: number, b: number) => PHOTOS.filter((_, i) => i >= a && i <= b);

// ---------- 成员 ----------
export const members: Member[] = [
  { id: 1, name: '爸爸', avatarUrl: AVATARS[0], role: '爸爸' },
  { id: 2, name: '妈妈', avatarUrl: AVATARS[1], role: '妈妈' },
  { id: 3, name: '爷爷', avatarUrl: AVATARS[2], role: '爷爷' },
  { id: 4, name: '奶奶', avatarUrl: AVATARS[3], role: '奶奶' },
];

export const INVITE_CODES = ['FM-E8K2', 'FM-7QNA', 'FM-3PBD'];

// ---------- 构造时间点 ----------
const now = dayjs();
const thisYear = now.format('YYYY');

// 去年今日(今年同月同日的去年) => 用于「去年今日」回忆
const lastYearToday = now.subtract(1, 'year').set('date', Math.min(now.date(), 28));
const yearAgo2 = now.subtract(2, 'year').set('date', Math.min(now.date(), 28));

// ---------- 时刻数据 ----------
export let moments: Moment[] = [];

let seedId = 0;
const mk = (
  data: Omit<Moment, 'id' | 'likes' | 'favorites' | 'comments' | 'sortedAt'>,
): Moment => {
  seedId += 1;
  return { ...data, id: seedId, sortedAt: data.capturedAt, likes: [], favorites: [], comments: [] };
};

const w = (d: dayjs.Dayjs) => d.format();

moments = [
  // —— 去年今日 & N年前的今天（时间胶囊）——
  mk({
    type: 'photo', mediaUrl: photos(0, 0)[0], coverUrl: photos(0, 0)[0],
    authorId: 1, title: '去年的今天', description: '去年今天一起去的郊外，阳光正好。',
    capturedAt: lastYearToday.subtract(4, 'hour').format(),
  }),
  mk({
    type: 'photo', mediaUrl: photos(1, 1)[0], coverUrl: photos(1, 1)[0],
    authorId: 2, title: '两年时光胶囊', description: '两年啦，还是那群可爱的人。',
    capturedAt: yearAgo2.add(3, 'hour').format(),
  }),
  // —— 今年春节 ——
  mk({
    type: 'video', mediaUrl: VIDEOS[1], coverUrl: photos(2, 2)[0],
    authorId: 1, title: '年夜饭气氛组', description: '全家一起包饺子的热闹瞬间。',
    capturedAt: dayjs(`${thisYear}-02-10 20:12`).format(),
  }),
  mk({
    type: 'photo', mediaUrl: photos(3, 3)[0], coverUrl: photos(3, 3)[0],
    authorId: 4, title: '贴春联', description: '奶奶指挥，我们贴春联。',
    capturedAt: dayjs(`${thisYear}-02-09 14:30`).format(),
  }),
  // —— 今年 3 月 ——
  mk({
    type: 'photo', mediaUrl: photos(4, 4)[0], coverUrl: photos(4, 4)[0],
    authorId: 2, title: '春日野餐', description: '公园里的第一场野餐。',
    capturedAt: dayjs(`${thisYear}-03-18 11:40`).format(),
  }),
  mk({
    type: 'video', mediaUrl: VIDEOS[2], coverUrl: photos(5, 5)[0],
    authorId: 3, title: '爷爷的收音机', description: '爷爷养的鸟又开始打鸣了。',
    capturedAt: dayjs(`${thisYear}-03-22 08:05`).format(),
  }),
  // —— 今年 5 月 ——
  mk({
    type: 'photo', mediaUrl: photos(6, 6)[0], coverUrl: photos(6, 6)[0],
    authorId: 1, title: '山间的日出', description: '凌晨四点半爬起来看日出。',
    capturedAt: dayjs(`${thisYear}-05-01 06:20`).format(),
  }),
  mk({
    type: 'photo', mediaUrl: photos(7, 7)[0], coverUrl: photos(7, 7)[0],
    authorId: 2, title: '海边一家人', description: '五一海边，风很大但很开心。',
    capturedAt: dayjs(`${thisYear}-05-03 16:48`).format(),
  }),
  // —— 今年 7 月 ——
  mk({
    type: 'video', mediaUrl: VIDEOS[3], coverUrl: photos(8, 8)[0],
    authorId: 3, title: '阿姨的广场舞', description: '晚饭后楼下的广场舞会。',
    capturedAt: dayjs(`${thisYear}-07-12 19:40`).format(),
  }),
  mk({
    type: 'photo', mediaUrl: photos(9, 9)[0], coverUrl: photos(9, 9)[0],
    authorId: 1, title: '夏日清晨', description: '趁着凉快去晨跑。',
    capturedAt: dayjs(`${thisYear}-07-26 07:12`).format(),
  }),
  // —— 今年 9 月 ——
  mk({
    type: 'photo', mediaUrl: photos(10, 10)[0], coverUrl: photos(10, 10)[0],
    authorId: 2, title: '开学第一天', description: '背上新书包，出发啦。',
    capturedAt: dayjs(`${thisYear}-09-01 07:58`).format(),
  }),
  mk({
    type: 'photo', mediaUrl: photos(11, 11)[0], coverUrl: photos(11, 11)[0],
    authorId: 4, title: '中秋团圆', description: '圆月下的全家福。',
    capturedAt: dayjs(`${thisYear}-09-17 20:30`).format(),
  }),
  // —— 近期 ——
  mk({
    type: 'video', mediaUrl: VIDEOS[4], coverUrl: photos(12, 12)[0],
    authorId: 1, title: '宝宝学步', description: '摇摇晃晃的第一步，看哭了我。',
    capturedAt: now.subtract(4, 'day').set('hour', 15).format(),
  }),
  mk({
    type: 'photo', mediaUrl: photos(13, 13)[0], coverUrl: photos(13, 13)[0],
    authorId: 2, title: '周末消防演习合影', description: '社区组织的消防宣传日。',
    capturedAt: now.subtract(2, 'day').set('hour', 10).format(),
  }),
];

// 为种子数据补充一些互动数据
const seedInteract = () => {
  const r = (n: number) => Math.floor(Math.random() * n);
  moments.forEach((m, idx) => {
    const n = 1 + (idx % 3);
    for (let i = 0; i < n; i++) m.likes.push(members[i % members.length].id);
    if (idx % 2 === 0) m.favorites.push(members[1].id);
    const cmts = [
      { id: idx * 10 + 1, memberName: '妈妈', avatarUrl: AVATARS[1], text: '太治愈了吧～', createdAt: dayjs().subtract(1, 'day').format() },
      { id: idx * 10 + 2, memberName: '爸爸', avatarUrl: AVATARS[0], text: '好温馨的一幕❤️', createdAt: dayjs().subtract(1, 'day').subtract(2, 'hour').format() },
    ];
    m.comments.push(cmts[r(cmts.length)]);
  });
};
seedInteract();

// ---------- 回忆构建 ----------
const sameMoment = (a: dayjs.Dayjs, b: dayjs.Dayjs, checkDay = true) =>
  (a.month() === b.month()) && (checkDay ? a.date() === b.date() : true);

export function buildMemories(): MemoryCard[] {
  const cards: MemoryCard[] = [];

  const lastYearMoments = moments.filter((m) => {
    const d = dayjs(m.capturedAt);
    return yearAgo2.isBefore(d) && d.isBefore(lastYearToday.add(1, 'day')) && sameMoment(d, lastYearToday);
  });

  if (lastYearMoments.length) {
    cards.push({
      id: 'last-year', label: '去年今日', title: '去年的今天', yearsAgo: 1,
      description: '翻出去年的照片，原来时光在这里打了照面。',
      moments: lastYearMoments,
    });
  }

  const twoYearMoments = moments.filter((m) => {
    const d = dayjs(m.capturedAt);
    return d.isBefore(yearAgo2.add(1, 'day')) && sameMoment(d, yearAgo2);
  });
  if (twoYearMoments.length) {
    cards.push({
      id: 'two-years', label: '时间胶囊', title: '两年前的今天', yearsAgo: 2,
      description: '这是一封来自两年前的信，请查收。',
      moments: twoYearMoments,
    });
  }

  // 兜底：没有严格同年同时时，取最早的一条老照片作为「N年前的今天」
  if (cards.length === 0) {
    const oldest = [...moments].sort((x, y) => x.capturedAt.localeCompare(y.capturedAt))[0];
    if (oldest) {
      const y = now.diff(dayjs(oldest.capturedAt), 'year');
      cards.push({
        id: `years-${y}`, label: '时间胶囊', title: `${y}年前的今天`, yearsAgo: y,
        description: '这是这些年里，最早的一张家庭足迹。',
        moments: [oldest],
      });
    }
  }

  return cards;
}

// ---------- 可选导出数据 ----------
export default { members, moments, INVITE_CODES };