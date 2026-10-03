import React from 'react';
import { View, Text, StyleSheet, ScrollView, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from './GradientBackground';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  scroll?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** 磨砂玻璃风格下的二级页面外壳：深夜渐变背景 + 顶部标题 + 可滚动内容 */
export function GlossyScreen({ title, subtitle, right, scroll = true, showBack = false, onBack, contentStyle, scrollStyle, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <GradientBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          {showBack && (
            <TouchableOpacity onPress={onBack} hitSlop={10} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {right}
      </View>
      {scroll ? (
        <ScrollView
          style={[{ flex: 1 }, scrollStyle]}
          contentContainerStyle={[{ padding: 16, paddingBottom: insets.bottom + 20 }, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, padding: 16 }, contentStyle]}>{children}</View>
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  backBtn: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 2,
  },
  headerText: { flex: 1, gap: 3 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: 0.4 },
  subtitle: { color: 'rgba(255,255,255,0.55)', fontSize: 13 },
});