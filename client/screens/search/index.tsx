import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { GlossyScreen } from '@/components/GlossyScreen';
import { Glass } from '@/components/Glass';
import { MasonryGrid } from '@/components/MasonryGrid';
import { GridMediaCard } from '@/components/GridMediaCard';
import { SmartDateInput } from '@/components/SmartDateInput';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { fetchMembers, fetchTimeline } from '@/services/api';
import { Moment } from '@/services/types';

export default function SearchScreen() {
  const router = useSafeRouter();
  const { members, setMembers, setPendingStartId } = useFamilyStore();
  const [all, setAll] = useState<Moment[]>([]);
  const [keyword, setKeyword] = useState('');
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchMembers().then(setMembers).catch(() => undefined);
      const load = async () => {
        try {
          const groups = await fetchTimeline();
          const flat = groups.flatMap((g) => g.items);
          setAll(flat);
        } catch {}
      };
      load();
    }, [setMembers])
  );

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return all.filter((m) => {
      if (authorId != null && m.authorId !== authorId) return false;
      if (kw) {
        const inTitle = (m.title || '').toLowerCase().includes(kw);
        const inDesc = (m.description || '').toLowerCase().includes(kw);
        if (!inTitle && !inDesc) return false;
      }
      if (start || end) {
        const t = new Date(m.capturedAt || 0).getTime();
        if (start && t < new Date(start).getTime()) return false;
        if (end && t > new Date(end).getTime()) return false;
      }
      return true;
    });
  }, [all, keyword, authorId, start, end]);

  const handleOpen = (item: Moment) => {
    setPendingStartId(item.id);
    router.navigate('/');
  };

  return (
    <GlossyScreen title="搜索时光" subtitle="按时间与家人回顾那些瞬间">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* 关键词 */}
        <Glass radius={16} bg="rgba(255,255,255,0.1)" style={styles.searchBox}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索标题或描述…"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={keyword}
            onChangeText={setKeyword}
          />
          {!!keyword && (
            <TouchableOpacity onPress={() => setKeyword('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </Glass>
        {(start || end || authorId != null) && (
          <TouchableOpacity onPress={() => { setStart(''); setEnd(''); setAuthorId(null); }}>
            <Text style={styles.reset}>清除全部筛选</Text>
          </TouchableOpacity>
        )}

        {/* 上传者筛选 */}
        <Text style={styles.label}>按家人筛选</Text>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 10 }}>
            <TouchableOpacity onPress={() => setAuthorId(null)}>
              <Glass radius={16} bg={authorId == null ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}>
                <Text style={styles.chip}>全部</Text>
              </Glass>
            </TouchableOpacity>
            {members.map((m) => (
              <TouchableOpacity key={m.id} onPress={() => setAuthorId(m.id === authorId ? null : m.id)}>
                <Glass radius={16} bg={authorId === m.id ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}>
                  <Text style={styles.chip}>{m.name}</Text>
                </Glass>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 时间范围 */}
        <Text style={styles.label}>按时间筛选</Text>
        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <SmartDateInput mode="date" placeholder="开始日期" displayFormat="YYYY-MM-DD" value={start} onChange={setStart} textStyle={{ color: '#fff' }} />
          </View>
          <Text style={styles.to}>至</Text>
          <View style={{ flex: 1 }}>
            <SmartDateInput mode="date" placeholder="结束日期" displayFormat="YYYY-MM-DD" value={end} onChange={setEnd} textStyle={{ color: '#fff' }} />
          </View>
        </View>

        {/* 结果 */}
        <View style={{ marginTop: 6 }}>
          <Text style={styles.resultCount}>共 {results.length} 个瞬间</Text>
          <MasonryGrid
            items={results}
            numColumns={2}
            gap={10}
            renderItem={(item, w, h) => <GridMediaCard item={item} width={w} height={h} onPress={handleOpen} />}
          />
        </View>
      </ScrollView>
    </GlossyScreen>
  );
}

const styles = StyleSheet.create({
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 13 },
  reset: { color: '#a78bfa', fontSize: 12, marginTop: 8, textAlign: 'right' },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 10 },
  chip: { color: '#fff', fontSize: 14, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 9 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  to: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  resultCount: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 12 },
});