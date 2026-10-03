import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlossyScreen } from '@/components/GlossyScreen';
import { Glass } from '@/components/Glass';
import { useFamilyStore, persistCurrentMember, randomGuestName } from '@/stores/useFamilyStore';
import { fetchMembers, joinFamily, resolveUrl } from '@/services/api';
import { Member } from '@/services/types';

const SHARE_CODES = ['FM-E8K2', 'FM-7QNA', 'FM-3PBD'];

export default function FamilyScreen() {
  const { members, setMembers, currentMemberId, setCurrentMemberId, addMember } = useFamilyStore();
  const [joinVisible, setJoinVisible] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMembers().then(setMembers).catch(() => undefined);
    }, [setMembers])
  );

  const openJoin = () => {
    setName(randomGuestName());
    setCode('');
    setError('');
    setJoinVisible(true);
  };

  const handleJoin = async () => {
    if (!name.trim()) return setError('请填写你的昵称');
    setBusy(true);
    setError('');
    try {
      const { member } = await joinFamily(name.trim(), code.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      addMember(member);
      setCurrentMemberId(member.id);
      persistCurrentMember(member);
      setJoinVisible(false);
    } catch (e: any) {
      setError(e?.message || '加入失败，请检查邀请码');
    } finally {
      setBusy(false);
    }
  };

  const renderItem = ({ item }: { item: Member }) => {
    const isMe = item.id === currentMemberId;
    return (
      <Glass radius={20} bg="rgba(255,255,255,0.08)" style={styles.memberCard}>
        <View style={styles.memberRow}>
          <Image source={{ uri: resolveUrl(item.avatarUrl) }} style={styles.avatar} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>{item.name}</Text>
              {isMe && (
                <View style={styles.meBadge}><Text style={styles.meBadgeText}>我</Text></View>
              )}
            </View>
            <Text style={styles.memberRole}>{item.role || '家庭成员'}</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>
      </Glass>
    );
  };

  return (
    <GlossyScreen
      title="家庭成员"
      subtitle="记录下每一个家人的身影"
      right={
        <TouchableOpacity onPress={openJoin}>
          <Glass radius={20} bg="rgba(255,255,255,0.1)">
            <View style={styles.addBtn}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>加入</Text>
            </View>
          </Glass>
        </TouchableOpacity>
      }
    >
      {/* 邀请码分享 */}
      <Glass radius={20} bg="rgba(167,139,250,0.18)" style={{ marginBottom: 18 }}>
        <View style={styles.inviteBox}>
          <View style={styles.inviteHead}>
            <Ionicons name="qr-code-outline" size={18} color="#e9d5ff" />
            <Text style={styles.inviteTitle}>邀请新家人</Text>
          </View>
          <Text style={styles.inviteDesc}>把家庭邀请码告诉家人，即可加入 FamilyMoments</Text>
          <View style={styles.codeRow}>
            {SHARE_CODES.map((c) => (
              <View key={c} style={styles.codeChip}>
                <Text style={styles.codeText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      </Glass>

      <FlatList
        data={members}
        keyExtractor={(m) => String(m.id)}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 加入弹窗 */}
      <Modal visible={joinVisible} transparent animationType="fade">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalWrap}>
            <Glass radius={24} bg="rgba(24,18,48,0.97)" style={styles.modalCard}>
              <View style={styles.modalHead}>
                <Text style={styles.modalTitle}>加入家庭</Text>
                <TouchableOpacity onPress={() => setJoinVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
              <Text style={styles.fieldLabel}>我的昵称</Text>
              <Glass radius={16} bg="rgba(255,255,255,0.1)">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="如：小明"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                />
              </Glass>
              <Text style={styles.fieldLabel}>邀请码</Text>
              <Glass radius={16} bg="rgba(255,255,255,0.1)">
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="如：FM-E8K2"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </Glass>
              {!!error && <Text style={styles.error}>{error}</Text>}
              <TouchableOpacity style={[styles.joinBtn, busy && { opacity: 0.6 }]} onPress={handleJoin} disabled={busy}>
                <Text style={styles.joinBtnText}>{busy ? '加入中…' : '确认加入'}</Text>
              </TouchableOpacity>
            </Glass>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </GlossyScreen>
  );
}

const styles = StyleSheet.create({
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  inviteBox: { padding: 16 },
  inviteHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inviteTitle: { color: '#e9d5ff', fontSize: 16, fontWeight: '800' },
  inviteDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 },
  codeRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  codeChip: { backgroundColor: 'rgba(15,12,41,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  codeText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  memberCard: { padding: 14 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  meBadge: { backgroundColor: 'rgba(167,139,250,0.45)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  meBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  memberRole: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 3 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34d399' },
  modalWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  modalCard: { width: '100%', maxWidth: 420, padding: 20 },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { color: '#fff', fontSize: 19, fontWeight: '800' },
  fieldLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { color: '#fff', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  error: { color: '#f87171', fontSize: 13, marginTop: 10 },
  joinBtn: {
    marginTop: 20, backgroundColor: '#7c3aed', paddingVertical: 14, borderRadius: 16, alignItems: 'center',
  },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});