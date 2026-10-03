import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { GlossyScreen } from '@/components/GlossyScreen';
import { Glass } from '@/components/Glass';
import { MasonryGrid } from '@/components/MasonryGrid';
import { GridMediaCard } from '@/components/GridMediaCard';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { TimelineGroup, Moment } from '@/services/types';
import { fetchTimeline } from '@/services/api';

export default function TimelineScreen() {
  const router = useSafeRouter();
  const setPendingStartId = useFamilyStore((s) => s.setPendingStartId);
  const [groups, setGroups] = useState<TimelineGroup[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchTimeline().then(setGroups).catch(() => undefined);
    }, [])
  );

  const openFeed = (m: Moment) => {
    // 定位到沉浸式浏览的对应内容
    setPendingStartId(m.id);
    router.navigate('/');
  };

  return (
    <GlossyScreen
      title="时间线"
      subtitle="按时间的足迹，串起每一段记忆"
      right={
        <TouchableOpacity onPress={() => router.push('/search')} hitSlop={8}>
          <Glass radius={20} bg="rgba(255,255,255,0.1)">
            <View style={styles.searchBtn}>
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.searchText}>搜索</Text>
            </View>
          </Glass>
        </TouchableOpacity>
      }
    >
      {groups.map((g) => (
        <View key={g.key} style={styles.group}>
          <View style={styles.groupHead}>
            <Glass radius={14} bg="rgba(167,139,250,0.22)">
              <View style={styles.groupChip}>
                <Ionicons name="time-outline" size={14} color="#e9d5ff" />
                <Text style={styles.groupLabel}>{g.label}</Text>
                <Text style={styles.groupCount}>{g.items.length} 张 · 份</Text>
              </View>
            </Glass>
          </View>
          <MasonryGrid
            items={g.items}
            gap={10}
            renderItem={(item, w, h) => <GridMediaCard item={item} width={w} height={h} onPress={openFeed} />}
          />
        </View>
      ))}
      {groups.length === 0 && <Text style={styles.empty}>还没有时间线内容，去上传吧～</Text>}
    </GlossyScreen>
  );
}

const styles = StyleSheet.create({
  searchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9 },
  searchText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  group: { marginBottom: 26 },
  groupHead: { marginBottom: 12, alignItems: 'flex-start' },
  groupChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7 },
  groupLabel: { color: '#e9d5ff', fontSize: 14, fontWeight: '800' },
  groupCount: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  empty: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 60 },
});