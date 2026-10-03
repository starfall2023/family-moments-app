import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  /** 默认深夜紫渐变，可自定义 */
  colors?: [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
}

/** 全局深夜渐变背景：夜空紫蓝（#0f0c29 → #302b63 → #24243e） */
export function GradientBackground({
  children,
  colors = ['#0f0c29', '#302b63', '#24243e'],
  style,
}: GradientBackgroundProps) {
  return (
    <LinearGradient colors={colors} start={{ x: 0.4, y: 0 }} end={{ x: 0.6, y: 1 }} style={[styles.fill, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});