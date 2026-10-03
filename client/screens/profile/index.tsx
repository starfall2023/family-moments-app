import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { GlossyScreen } from '@/components/GlossyScreen';
import { Glass } from '@/components/Glass';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { fetchMembers, fetchMoments, resolveUrl } from '@/services/api';
import { Moment } from '@/services/types';

export default function ProfileScreen() {
  const router = useSafeRouter();
  const { members, setMembers, currentMemberId } = useFamilyStore();
  const [moments, setMoments] = useState<Moment[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchMembers().then(setMembers).catch(() => undefined);
      fetchMoments().then(setMoments).catch(() => setMoments([]));
    }, [setMembers])
  );

  const me = members.find((m) => m.id === currentMemberId);

  const stats = useMemo(() => {
    const ms = moments || [];
    const myLikes = ms.reduce((a, b) => a + (b.likes.length || 0), 0);
    const myFavs = ms.reduce((a, b) => a + (b.favorites.length || 0), 0);
    return { total: ms.length, likes: myLikes, favs: myFavs };
  }, [moments]);

  const menu = [
    { icon: 'cloud-upload-outline', label: '上传照片 / 视频', color: '#a78bfa', route: '/upload' as const },
    { icon: 'search-outline', label: '搜索时光', color: '#38bdf8', route: '/search' as const },
    { icon: 'easel-outline', label: '幻灯片放映', color: '#f472b6', route: '/slideshow' as const },
    { icon: 'server-outline', label: '服务器设置', color: '#34d399', route: '/server' as const },
  ];

  return (
    <GlossyScreen title="我的家庭" subtitle={me ? `你好，${me.name}` : 'FamilyMoments'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 个人信息卡 */}
        <Glass radius={24} bg="rgba(255,255,255,0.09)" style={{ marginBottom: 18 }}>
          <View style={styles.profileCard}>
            <Image
              source={me ? { uri: resolveUrl(me.avatarUrl) } : undefined}
              style={styles.bigAvatar}
              contentFit="cover"
            />
            <Text style={styles.profileName}>{me ? me.name : '访客'}</Text>
            <Text style={styles.profileRole}>{me ? (me.role || '家庭成员') : '尚未加入家庭'}</Text>
            {!me && (
              <TouchableOpacity style={styles.joinCta} onPress={() => router.navigate('/family')}>
                <Text style={styles.joinCtaText}>加入家庭 · 开始记录</Text>
              </TouchableOpacity>
            )}
          </View>
        </Glass>

        {/* 数据统计 */}
        <View style={styles.statsRow}>
          {moments == null ? (
            <ActivityIndicator color="#a78bfa" style={{ marginVertical: 24 }} />
          ) : (
            <>
              <Glass radius={20} bg="rgba(255,255,255,0.08)" style={styles.statBox}>
                <Text style={styles.statNum}>{stats.total}</Text>
                <Text style={styles.statLabel}>照片 / 视频</Text>
              </Glass>
              <Glass radius={20} bg="rgba(255,255,255,0.08)" style={styles.statBox}>
                <Text style={styles.statNum}>{stats.likes}</Text>
                <Text style={styles.statLabel}>累计点赞</Text>
              </Glass>
              <Glass radius={20} bg="rgba(255,255,255,0.08)" style={styles.statBox}>
                <Text style={styles.statNum}>{stats.favs}</Text>
                <Text style={styles.statLabel}>收藏</Text>
              </Glass>
            </>
          )}
        </View>

        {/* 菜单 */}
        <Text style={styles.sectionTitle}>功能</Text>
        {menu.map((m) => (
          <TouchableOpacity key={m.label} onPress={() => router.push(m.route)}>
            <Glass radius={18} bg="rgba(255,255,255,0.07)" style={styles.menuRow}>
              <View style={[styles.menuIcon, { backgroundColor: `${m.color}33` }]}>
                <Ionicons name={m.icon as any} size={20} color={m.color} />
              </View>
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </Glass>
          </TouchableOpacity>
        ))}

        {/* 家庭礼物横幅 */}
        <Glass radius={20} bg="rgba(244,114,182,0.16)" style={{ marginTop: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <FontAwesome6 name="heart" size={22} color="#f9a8d4" />
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, flex: 1 }}>
            每一帧都是家的温度。把今天的生活，留给未来的家人。
          </Text>
        </Glass>
      </ScrollView>
    </GlossyScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', padding: 24 },
  bigAvatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
  profileName: { color: '#fff', fontSize: 21, fontWeight: '800', marginTop: 12 },
  profileRole: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 },
  joinCta: { marginTop: 12, backgroundColor: 'rgba(124,58,237,0.9)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  joinCtaText: { color: '#fff', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, paddingVertical: 18, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  sectionTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 10 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
});