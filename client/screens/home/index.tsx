import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import VerticalPager, { VerticalPagerHandle } from '@/components/VerticalPager';
import { Image } from 'expo-image';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCircle } from '@/components/Glass';
import { CommentSheet } from '@/components/CommentSheet';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Moment, Member } from '@/services/types';
import { fetchMoments, postComment, resolveUrl } from '@/services/api';
import { timeAgo } from '@/utils/format';

// ---------------- FeedItem（顶层组件，内部使用 Hooks） ----------------
function FeedItem({ item, active }: { item: Moment; active: boolean }) {
  const videoRef = useRef<Video>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!active || item.type !== 'video') return;
    const v = videoRef.current;
    if (v) {
      v.setPositionAsync(0).then(() => v.playAsync()).catch(() => undefined);
    }
    return () => {
      v?.pauseAsync().catch(() => undefined);
    };
  }, [active, item.type]);

  const toggleMute = () => {
    setMuted((m) => !m);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  };

  return (
    <View style={styles.page}>
      {item.type === 'photo' ? (
        <Image source={{ uri: resolveUrl(item.mediaUrl) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <>
          {active ? (
            <Video
              ref={videoRef}
              source={{ uri: resolveUrl(item.mediaUrl) }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay
              isMuted={muted}
              progressUpdateIntervalMillis={500}
            />
          ) : (
            <Image source={{ uri: resolveUrl(item.coverUrl) }} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
        </>
      )}
    </View>
  );
}

// 过滤分段
type Filter = '全部' | '照片' | '视频';
const FILTERS: Filter[] = ['全部', '照片', '视频'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useSafeRouter();
  const { moments, members, currentMemberId, setMoments, toggleLike, toggleFavorite, pendingStartId, setPendingStartId } =
    useFamilyStore();

  const [filter, setFilter] = useState<Filter>('全部');
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentVisible, setCommentVisible] = useState(false);
  const pagerRef = useRef<VerticalPagerHandle>(null);

  const myMember = members.find((m) => m.id === currentMemberId) || members[0];

  // 首次加载
  useEffect(() => {
    if (moments.length === 0) {
      fetchMoments().then(setMoments).catch(() => undefined);
    }
  }, [moments.length, setMoments]);

  // 定位到指定内容（来自时间线/回忆跳转）
  useFocusEffect(
    useCallback(() => {
      if (pendingStartId != null && moments.length > 0) {
        const idx = moments.findIndex((m) => m.id === pendingStartId);
        if (idx >= 0) {
          setTimeout(() => pagerRef.current?.setPage(idx), 60);
          setActiveIndex(idx);
        }
        setPendingStartId(null);
      }
    }, [pendingStartId, moments, setPendingStartId])
  );

  const visibleMoments =
    filter === '全部' ? moments : moments.filter((m) => m.type === (filter === '照片' ? 'photo' : 'video'));

  const activeMoment = visibleMoments[activeIndex];
  const height = Dimensions.get('window').height;

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    setActiveIndex(e.nativeEvent.position);
  };

  const handleSendComment = (text: string) => {
    if (!activeMoment) return;
    postComment(activeMoment.id, myMember?.name || '家人', myMember?.avatarUrl || '', text)
      .then((r) => useFamilyStore.getState().addComment(activeMoment.id, r.comment))
      .catch(() => undefined);
  };

  return (
    <View style={{ flex: 1, height, backgroundColor: '#0f0c29' }}>
      <GradientBackground style={StyleSheet.absoluteFill} />
      <VerticalPager
        ref={pagerRef}
        style={StyleSheet.absoluteFillObject}
        orientation="vertical"
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {visibleMoments.map((m, i) => (
          <View key={m.id} style={styles.page}>
            <FeedItem item={m} active={i === activeIndex} />
          </View>
        ))}
        {visibleMoments.length === 0 && (
          <View style={styles.page}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>暂时没有内容，快去上传吧～</Text>
          </View>
        )}
      </VerticalPager>

      {/* 顶部：渐变遮罩 + 标题 + 过滤 + 入口 */}
      <LinearGradient colors={['rgba(15,12,41,0.62)', 'transparent']} style={[styles.topGrad, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <View style={styles.brandBadge}>
              <Ionicons name="people" size={16} color="#fff" />
            </View>
            <Text style={styles.brandText}>FamilyMoments</Text>
          </View>
          <View style={styles.topActions}>
            <GlassCircle size={40} radius={20} style={styles.topAction} bg="rgba(255,255,255,0.12)">
              <Pressable onPress={() => router.push('/search')} hitSlop={6}>
                <Ionicons name="search" size={20} color="#fff" />
              </Pressable>
            </GlassCircle>
            <GlassCircle size={40} radius={20} style={styles.topAction} bg="rgba(255,255,255,0.12)">
              <Pressable onPress={() => router.push('/slideshow')} hitSlop={6}>
                <Ionicons name="play-circle" size={21} color="#fff" />
              </Pressable>
            </GlassCircle>
          </View>
        </View>

        {/* 过滤分段 */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <Pressable key={f} onPress={() => { setFilter(f); setActiveIndex(0); }} style={styles.filterItem}>
                <Text style={[styles.filterText, on && styles.filterTextOn]}>{f}</Text>
                {on && <View style={styles.filterUnderline} />}
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      {/* 右侧操作栏 */}
      {activeMoment && (
        <View style={[styles.rightActions, { bottom: insets.bottom + 90 }]} pointerEvents="box-none">
          <GlassCircle size={54} radius={27} style={styles.actionBtn} bg="rgba(255,255,255,0.13)">
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined); toggleLike(activeMoment.id); }}
              hitSlop={8}
              style={styles.actionInner}
            >
              <Ionicons
                name={activeMoment.likes.includes(currentMemberId) ? 'heart' : 'heart-outline'}
                size={26}
                color={activeMoment.likes.includes(currentMemberId) ? '#f43f5e' : '#fff'}
              />
              <Text style={styles.actionCount}>{activeMoment.likes.length}</Text>
            </Pressable>
          </GlassCircle>

          <GlassCircle size={54} radius={27} style={styles.actionBtn} bg="rgba(255,255,255,0.13)">
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined); toggleFavorite(activeMoment.id); }}
              hitSlop={8}
              style={styles.actionInner}
            >
              <Ionicons
                name={activeMoment.favorites.includes(currentMemberId) ? 'star' : 'star-outline'}
                size={25}
                color={activeMoment.favorites.includes(currentMemberId) ? '#fbbf24' : '#fff'}
              />
              <Text style={styles.actionCount}>{activeMoment.favorites.length}</Text>
            </Pressable>
          </GlassCircle>

          <GlassCircle size={54} radius={27} style={styles.actionBtn} bg="rgba(255,255,255,0.13)">
            <Pressable onPress={() => setCommentVisible(true)} hitSlop={8} style={styles.actionInner}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
              <Text style={styles.actionCount}>{activeMoment.comments.length}</Text>
            </Pressable>
          </GlassCircle>
        </View>
      )}

      {/* 底部信息 */}
      {activeMoment && (
        <LinearGradient colors={['transparent', 'rgba(15,12,41,0.78)']} style={[styles.bottomGrad, { paddingBottom: insets.bottom + 16 }]} pointerEvents="none">
          <View style={styles.bottomInfo}>
            <View style={styles.autBox}>
              {myMember?.avatarUrl ? (
                <Image source={{ uri: resolveUrl(activeAuthor(activeMoment, members).avatarUrl) }} style={styles.authorAvi} contentFit="cover" />
              ) : null}
              <View>
                <Text style={styles.authorName}>{activeAuthor(activeMoment, members).name}</Text>
                <Text style={styles.time}>{timeAgo(activeMoment.capturedAt)}</Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={2}>{activeMoment.title}</Text>
            {!!activeMoment.description && <Text style={styles.desc} numberOfLines={1}>{activeMoment.description}</Text>}
          </View>
        </LinearGradient>
      )}

      <CommentSheet
        visible={commentVisible}
        moment={activeMoment}
        myName={myMember?.name || '家人'}
        myAvatar={myMember?.avatarUrl || ''}
        onClose={() => setCommentVisible(false)}
        onSend={handleSendComment}
      />
    </View>
  );
}

function activeAuthor(m: Moment, members: Member[]) {
  return members.find((x) => x.id === m.authorId) || { id: m.authorId, name: '家人', avatarUrl: '' };
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topGrad: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBadge: {
    width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(167,139,250,0.35)',
  },
  brandText: { color: '#fff', fontSize: 19, fontWeight: '800', letterSpacing: 0.3 },
  topActions: { flexDirection: 'row', gap: 10 },
  topAction: {},
  filterRow: { flexDirection: 'row', gap: 22, marginTop: 18, alignItems: 'center' },
  filterItem: { alignItems: 'center', gap: 4 },
  filterText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  filterTextOn: { color: '#fff' },
  filterUnderline: { width: 18, height: 3, borderRadius: 2, backgroundColor: '#a78bfa' },
  rightActions: { position: 'absolute', right: 12, alignItems: 'center', gap: 16 },
  actionBtn: {},
  actionInner: { alignItems: 'center', justifyContent: 'center' },
  actionCount: { color: '#fff', fontSize: 12, marginTop: 3, fontWeight: '600' },
  bottomGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 60 },
  bottomInfo: { gap: 8 },
  autBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvi: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  authorName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  time: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  desc: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
});