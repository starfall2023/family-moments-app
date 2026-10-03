import dayjs from 'dayjs';

/** 2026年9月28日 */
export const formatFullDate = (iso: string) => dayjs(iso).format('YYYY年M月D日');

/** 09-28 */
export const formatMonthDay = (iso: string) => dayjs(iso).format('M月D日');

/** 09-28 10:24 */
export const formatDateTime = (iso: string) => dayjs(iso).format('M月D日 HH:mm');

/** 时间相对描述：刚刚 / N分钟前 / N小时前 / N天前 / 日期 */
export const timeAgo = (iso: string) => {
  const d = dayjs(iso);
  const diff = dayjs().diff(d, 'minute');
  if (diff < 1) return '刚刚';
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}小时前`;
  if (diff < 60 * 24 * 7) return `${Math.floor(diff / (60 * 24))}天前`;
  return formatFullDate(iso);
};

/** 瀑布流卡片高度因子：让图片比例在 0.7~1.4 之间交错，保证视觉错落 */
export const masonryRatio = (id: number) => {
  const seeds = [1.0, 0.75, 1.25, 0.85, 1.15, 0.7, 1.3, 0.9, 1.1, 1.4];
  return seeds[Math.abs(id) % seeds.length];
};