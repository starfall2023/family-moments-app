import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { GlossyScreen } from '@/components/GlossyScreen';
import { Glass } from '@/components/Glass';
import { fetchMoments, resolveUrl } from '@/services/api';
import { Moment } from '@/services/types';

const { width, height } = Dimensions.get('window');

const INTERVALS = [3, 5, 8, 10];
type Transition = 'fade' | 'slide';

export default function SlideshowScreen() {
  const router = useSafeRouter();
  const [photos, setPhotos] = useState<Moment[]>([]);
  const [index, setIndex] = useState(0);
  const [interval, setIntervalSec] = useState(5);
  const [playing, setPlaying] = useState(true);
  const [transition, setTransition] = useState<Transition>('fade');
  const opacity = useMemo(() => new Animated.Value(1), []);
  const slide = useMemo(() => new Animated.Value(0), []);
  const timer = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchMoments().then((list) => setPhotos(list.filter((m) => m.type === 'photo'))).catch(() => undefined);
      return () => { if (timer.current) clearInterval(timer.current); };
    }, [])
  );

  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (playing && photos.length > 1) {
      timer.current = setInterval(() => {
        setIndex((i) => (i + 1) % photos.length);
      }, interval * 1000);
    }
  }, [playing, photos.length, interval]);

  useEffect(() => {
    resetTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [resetTimer, index]);

  const changeIndex = (next: number) => {
    const normalized = (next + photos.length) % photos.length;
    if (transition === 'fade') {
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } else {
      slide.setValue(width);
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 9, tension: 40 }).start();
    }
    setIndex(normalized);
  };

  const current = photos[index];

  return (
    <View style={styles.root}>
      <GlossyScreen
        title="幻灯片放映"
        subtitle="让家庭时光在屏幕上缓缓流淌"
        showBack
        onBack={() => router.back()}
        scroll={false}
      >
        <View style={styles.stage}>
          {photos.length === 0 ? (
            <Text style={styles.empty}>没有可放映的照片</Text>
          ) : current ? (
            <>
              <Animated.View
                style={[
                  styles.slideAni,
                  transition === 'fade'
                    ? { opacity }
                    : { transform: [{ translateX: slide }] },
                ]}
              >
                <Image
                  source={{ uri: resolveUrl(current.mediaUrl) }}
                  style={styles.fullImage}
                  contentFit="cover"
                  transition={800}
                />
              </Animated.View>
              <View style={styles.gradientOverlay} />
              <View style={styles.caption}>
                <Text style={styles.captionTitle}>{current.title}</Text>
                <Text style={styles.captionMeta}>
                  {new Date(current.capturedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* 控制条 */}
        <Glass radius={20} bg="rgba(255,255,255,0.14)" style={styles.controls}>
          <View style={styles.ctrlRow}>
            <TouchableOpacity onPress={() => changeIndex(index - 1)} hitSlop={8}>
              <Ionicons name="play-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPlaying((p) => !p)} hitSlop={8} style={styles.playBtn}>
              <Ionicons name={playing ? 'pause' : 'play'} size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeIndex(index + 1)} hitSlop={8}>
              <Ionicons name="play-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.ctrlMeta}>
            <View style={styles.intervalGroup}>
              <Text style={styles.ctrlLabel}>间隔</Text>
              {INTERVALS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setIntervalSec(s)}
                  style={[styles.pill, interval === s && styles.pillActive]}
                >
                  <Text style={[styles.pillText, interval === s && styles.pillTextActive]}>{s}s</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.intervalGroup}>
              <Text style={styles.ctrlLabel}>动画</Text>
              {(['fade', 'slide'] as Transition[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTransition(t)}
                  style={[styles.pill, transition === t && styles.pillActive]}
                >
                  <Text style={[styles.pillText, transition === t && styles.pillTextActive]}>
                    {t === 'fade' ? '淡入' : '滑动'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Glass>
      </GlossyScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { flex: 1, borderRadius: 24, overflow: 'hidden' },
  slideAni: { ...StyleSheet.absoluteFillObject },
  fullImage: { width: '100%', height: '100%' },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,12,41,0.25)',
  },
  caption: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  captionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8 },
  captionMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  empty: { color: 'rgba(255,255,255,0.5)', alignSelf: 'center', marginTop: 120 },
  controls: { padding: 16, marginTop: 16 },
  ctrlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  playBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(124,58,237,0.7)', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 },
  ctrlMeta: { gap: 10 },
  intervalGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctrlLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, width: 40, fontWeight: '700' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  pillActive: { backgroundColor: 'rgba(124,58,237,0.6)' },
  pillText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
});