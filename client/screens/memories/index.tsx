import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlossyScreen } from '@/components/GlossyScreen';
import { Glass } from '@/components/Glass';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { MemoryCard, Moment } from '@/services/types';
import { fetchMemories, resolveUrl } from '@/services/api';
import { formatFullDate, timeAgo } from '@/utils/format';

function MemoryHero({ card, onOpen }: { card: MemoryCard; onOpen: (m: Moment) => void }) {
  const cover = card.moments[0];
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onOpen(cover)}>
      <Glass radius={24} bg="rgba(255,255,255,0.08)" style={styles.hero}>
        <LinearGradient colors={['rgba(236,72,153,0.5)', 'rgba(124,58,237,0.5)']} style={styles.heroGrad}>
          <View style={styles.heroOverlay}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="sparkles" size={13} color="#fff" />
                <Text style={styles.badgeText}>{card.label}</Text>
              </View>
              <Text style={styles.years}>{card.yearsAgo} 年前</Text>
            </View>
            <Text style={styles.heroTitle}>{card.title}</Text>
            <Text style={styles.heroDesc}>{card.description}</Text>
            <View style={styles.heroFoot}>
              <Text style={styles.heroDate}>
                {cover ? formatFullDate(cover.capturedAt) : ''} · {card.moments.length} 个瞬间
              </Text>
              <Ionicons name="arrow-forward-circle" size={30} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </Glass>
    </TouchableOpacity>
  );
}

function MemoryStrip({ card, onOpen }: { card: MemoryCard; onOpen: (m: Moment) => void }) {
  if (card.moments.length <= 1) return null;
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
        {card.moments.map((m) => (
          <TouchableOpacity key={m.id} onPress={() => onOpen(m)} style={styles.stripItem}>
            <Image
              source={{ uri: resolveUrl(m.type === 'video' ? m.coverUrl : m.mediaUrl) }}
              style={styles.stripImg}
              contentFit="cover"
            />
            <View style={styles.stripInfo}>
              {m.type === 'video' && <Ionicons name="play" size={10} color="#fff" style={{ position: 'absolute', top: 4, left: 4 }} />}
              <Text style={styles.stripTime}>{timeAgo(m.capturedAt)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function MemoriesScreen() {
  const router = useSafeRouter();
  const setPendingStartId = useFamilyStore((s) => s.setPendingStartId);
  const [cards, setCards] = useState<MemoryCard[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchMemories().then(setCards).catch(() => undefined);
    }, [])
  );

  const openFeed = (m: Moment) => {
    setPendingStartId(m.id);
    router.navigate('/');
  };

  return (
    <GlossyScreen title="回忆" subtitle="去年今日 · 时间胶囊" scroll={false}>
      {/* 顶部氛围卡片 */}
      <View style={styles.intro}>
        <Glass radius={20} bg="rgba(167,139,250,0.16)">
          <View style={styles.introInner}>
            <Ionicons name="time" size={22} color="#e9d5ff" />
            <Text style={styles.introText}>时光会走远，但回忆会替你保存。</Text>
            <Ionicons name="heart" size={20} color="#fb7185" />
          </View>
        </Glass>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.section}>
          {cards.map((c, i) => (
            <View key={c.id} style={{ marginBottom: 20 }}>
              {i === 0 ? <MemoryHero card={c} onOpen={openFeed} /> : (
                <Glass radius={22} bg="rgba(255,255,255,0.08)" style={styles.miniCard}>
                  <View style={styles.miniHead}>
                    <View style={styles.badge}>
                      <Ionicons name="sparkles" size={13} color="#fff" />
                      <Text style={styles.badgeText}>{c.label}</Text>
                    </View>
                    <Text style={styles.years}>{c.yearsAgo} 年前</Text>
                  </View>
                  <Text style={styles.miniTitle}>{c.title}</Text>
                  <Text style={styles.miniDesc}>{c.description}</Text>
                </Glass>
              )}
              <MemoryStrip card={c} onOpen={openFeed} />
            </View>
          ))}
          {cards.length === 0 && (
            <Text style={styles.empty}>暂无回忆卡片，多上传一些照片吧～</Text>
          )}
          <TouchableOpacity
            onPress={() => router.push('/slideshow')}
            style={styles.slideshowEntry}
          >
            <Glass radius={20} bg="rgba(255,255,255,0.1)">
              <View style={styles.slideshowInner}>
                <Ionicons name="play-circle-outline" size={22} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.slideshowTitle}>幻灯片模式</Text>
                  <Text style={styles.slideshowDesc}>大屏 / 电视上自动轮播全家回忆</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </View>
            </Glass>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GlossyScreen>
  );
}

const styles = StyleSheet.create({
  intro: {},
  introInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  introText: { color: '#e9d5ff', fontSize: 15, fontWeight: '600', flex: 1, marginHorizontal: 8 },
  section: { gap: 4 },
  hero: {},
  heroGrad: { borderRadius: 24, overflow: 'hidden' },
  heroOverlay: { padding: 20, minHeight: 190, justifyContent: 'space-between' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(15,12,41,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  years: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 12 },
  heroDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20, maxWidth: '90%' },
  heroFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  heroDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  miniCard: { padding: 18, marginBottom: 10 },
  miniHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniTitle: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 10 },
  miniDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  stripItem: { width: 130, height: 110, borderRadius: 14, overflow: 'hidden' },
  stripImg: { width: '100%', height: '100%' },
  stripInfo: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 6, backgroundColor: 'rgba(15,12,41,0.55)' },
  stripTime: { color: '#fff', fontSize: 10 },
  empty: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 40 },
  slideshowEntry: { marginTop: 6 },
  slideshowInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  slideshowTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  slideshowDesc: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 },
});