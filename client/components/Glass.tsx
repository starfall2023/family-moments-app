import React from 'react';
import { Platform, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 圆角大小，默认 20 */
  radius?: number;
  /** 玻璃透明度背景（web 兜底色），默认 rgba(255,255,255,0.12) */
  bg?: string;
  /** 是否启用模糊（web 上自动降级为半透明背景） */
  blur?: boolean;
  intensity?: number;
}

/** 磨砂玻璃容器：原生端使用 expo-blur 真实模糊；Web 端降级为半透明背景以保证通用性 */
export function Glass({ children, style, radius = 20, bg = 'rgba(255,255,255,0.12)', blur = true, intensity = 32 }: GlassProps) {
  const baseStyle: ViewStyle = {
    borderRadius: radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.20)',
    overflow: 'hidden',
    backgroundColor: bg,
  };

  if (Platform.OS === 'web' || !blur) {
    return <View style={[baseStyle, style]}>{children}</View>;
  }
  return (
    <BlurView intensity={intensity} tint="dark" style={[baseStyle, style]}>
      {children}
    </BlurView>
  );
}

/** 磨砂玻璃图标按钮容器 */
export function GlassCircle({ children, size = 46, radius = 23, style, bg = 'rgba(255,255,255,0.14)' }: GlassProps & { size?: number; radius?: number }) {
  const baseStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: bg,
  };

  if (Platform.OS === 'web') {
    return <View style={[baseStyle, style]}>{children}</View>;
  }
  return (
    <BlurView intensity={38} tint="dark" style={[baseStyle, style]}>
      {children}
    </BlurView>
  );
}