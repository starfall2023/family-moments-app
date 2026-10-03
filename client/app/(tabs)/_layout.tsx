import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle: any = {
    position: 'absolute',
    backgroundColor: 'rgba(20, 15, 45, 0.82)',
    borderTopWidth: 0,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 62 + insets.bottom,
    paddingBottom: Math.max(insets.bottom, 10),
    paddingTop: 8,
  };

  // Web 端高度异常修复
  if (Platform.OS === 'web') {
    tabBarStyle.height = 'auto';
    tabBarStyle.borderTopLeftRadius = 0;
    tabBarStyle.borderTopRightRadius = 0;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: '时间线',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'images' : 'images-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: '回忆',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: '家庭',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}