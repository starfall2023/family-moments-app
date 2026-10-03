import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import { Provider } from '@/components/Provider';
import { initCurrentMember } from '@/stores/useFamilyStore';
import { loadServerConfig } from '@/services/serverConfig';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
]);

export default function RootLayout() {
  // 恢复/初始化当前家庭成员身份 + 加载持久化的后端地址配置
  useEffect(() => {
    initCurrentMember();
    loadServerConfig();
  }, []);

  return (
    <Provider>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ title: '' }} />
        <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
        <Stack.Screen name="search" options={{ presentation: 'card' }} />
        <Stack.Screen name="slideshow" options={{ presentation: 'card' }} />
        <Stack.Screen name="server" options={{ presentation: 'card' }} />
      </Stack>
      <Toast />
      <StatusBar style="light" />
    </Provider>
  );
}