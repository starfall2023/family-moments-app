import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Moment } from '@/services/types';
import { resolveUrl } from '@/services/api';
import { timeAgo } from '@/utils/format';

interface Props {
  item: Moment;
  width: number;
  height: number;
  onPress: (m: Moment) => void;
}

/** 瀑布流 / 网格中的图片卡片 */
export function GridMediaCard({ item, width, height, onPress }: Props) {
  const isVideo = item.type === 'video';
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(item)} style={{ width, height }}>
      <View style={[styles.card, { width, height }]}>
        <Image
          source={{ uri: resolveUrl(isVideo ? item.coverUrl : item.mediaUrl) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={180}
        />
        {/* 底部渐变 + 信息 */}
        <View style={styles.bottomFade} pointerEvents="none">
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.time}>{timeAgo(item.capturedAt)}</Text>
        </View>
        {isVideo && (
          <View style={styles.videoBadge}>
            <Ionicons name="play" size={12} color="#fff" />
          </View>
        )}
        {item.favorites.length > 0 && (
          <View style={styles.favBadge}>
            <Ionicons name="star" size={11} color="#fbbf24" />
            <Text style={styles.favCount}>{item.favorites.length}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)' },
  bottomFade: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: 'rgba(15,12,41,0.55)',
    gap: 2,
  },
  title: { color: '#fff', fontSize: 12, fontWeight: '600' },
  time: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  videoBadge: {
    position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)',
  },
  favBadge: {
    position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.45)',
  },
  favCount: { color: '#fff', fontSize: 10, fontWeight: '600' },
});