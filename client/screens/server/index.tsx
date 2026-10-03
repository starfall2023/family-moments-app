import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { GlossyScreen } from '@/components/GlossyScreen';
import { Glass } from '@/components/Glass';
import Toast from 'react-native-toast-message';
import {
  getServerUrl, setServerUrl, testServerConnection,
} from '@/services/serverConfig';

const extractHostPort = (url: string) => {
  const m = url.replace(/^https?:\/\//i, '');
  const parts = m.split(':');
  const host = parts[0] || '192.168.1.100';
  const port = parts.length > 1 ? parts.slice(1).join(':').replace(/\/.*/, '') : '7011';
  return { host, port };
};

export default function ServerScreen() {
  const router = useSafeRouter();
  const [host, setHost] = useState(() => extractHostPort(getServerUrl()).host);
  const [port, setPort] = useState(() => extractHostPort(getServerUrl()).port);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const buildUrl = () => {
    const h = host.trim();
    const p = port.trim() || '7011';
    const full = /^https?:\/\//i.test(h) ? h.replace(/\/$/, '') : `http://${h}`;
    return `${full}:${p}`;
  };

  const handleTest = async () => {
    setTesting(true);
    const ok = await testServerConnection(buildUrl());
    setTesting(false);
    Toast.show({
      type: ok ? 'success' : 'error',
      text1: ok ? '连接成功' : '连接失败',
      text2: ok ? '已连接到 FamilyMoments 服务' : '请检查 IP / 端口是否正确，且 NAS 服务已启动',
    });
  };

  const handleSave = async () => {
    if (!host.trim()) {
      Toast.show({ type: 'error', text1: '请输入NAS的IP地址' });
      return;
    }
    setSaving(true);
    const url = await setServerUrl(buildUrl());
    setSaving(false);
    Toast.show({ type: 'success', text1: '已保存', text2: url });
    router.back();
  };

  return (
    <GlossyScreen title="服务器设置" subtitle="连接你的 NAS FamilyMoments 服务">
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Glass radius={24} bg="rgba(255,255,255,0.09)" style={{ marginBottom: 16 }}>
          <Text style={styles.label}>NAS / 服务器地址（IP 或域名）</Text>
          <TextInput
            style={styles.input}
            value={host}
            onChangeText={setHost}
            placeholder="192.168.1.100"
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text style={styles.label}>端口号</Text>
          <TextInput
            style={styles.input}
            value={port}
            onChangeText={setPort}
            placeholder="7011"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="number-pad"
            maxLength={5}
          />
          <Text style={styles.hint}>示例：192.168.1.100 : 7011</Text>
        </Glass>

        <TouchableOpacity style={styles.testBtn} onPress={handleTest} disabled={testing}>
          {testing ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.testText}>测试连接</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={styles.saveText}>保存并应用</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </GlossyScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 4, paddingBottom: 60 },
  label: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  hint: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 12 },
  testBtn: {
    backgroundColor: '#e9d5ff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  testText: { color: '#3b0764', fontSize: 16, fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});