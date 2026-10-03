import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Moment, Comment } from '@/services/types';
import { Glass } from './Glass';
import { timeAgo } from '@/utils/format';
import { resolveUrl } from '@/services/api';

interface Props {
  visible: boolean;
  moment: Moment | null;
  myName: string;
  myAvatar: string;
  onClose: () => void;
  onSend: (text: string) => void;
}

function Avatar({ uri }: { uri?: string }) {
  if (!uri) {
    return (
      <View style={[s.avatar, s.center]}>
        <Ionicons name="person" size={16} color="rgba(255,255,255,0.7)" />
      </View>
    );
  }
  return (
    <Image source={{ uri: resolveUrl(uri) }} style={s.avatar} contentFit="cover" cachePolicy="memory-disk" />
  );
}

function CommentRow({ item }: { item: Comment }) {
  return (
    <View style={s.row}>
      <Avatar uri={item.avatarUrl} />
      <View style={s.rowBody}>
        <View style={s.rowHead}>
          <Text style={s.name}>{item.memberName}</Text>
          <Text style={s.time}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={s.text}>{item.text}</Text>
      </View>
    </View>
  );
}

export function CommentSheet({ visible, moment, myName, myAvatar, onClose, onSend }: Props) {
  const [text, setText] = useState('');
  const comments = moment?.comments ?? [];

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
    Keyboard.dismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback
        onPress={() => {
          if (Platform.OS !== 'web') Keyboard.dismiss();
        }}
        disabled={Platform.OS === 'web'}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={s.grabber} />
              <View style={s.sheetHead}>
                <Text style={s.sheetTitle}>{comments.length} 条评论</Text>
                <TouchableOpacity onPress={onClose} hitSlop={8}>
                  <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={comments}
                keyExtractor={(c) => String(c.id)}
                renderItem={({ item }) => <CommentRow item={item} />}
                ListEmptyComponent={<Text style={s.empty}>还没有评论，来说两句吧～</Text>}
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
              />
              <View style={s.inputRow}>
                <Avatar uri={myAvatar} />
                <Glass radius={22} bg="rgba(255,255,255,0.1)" style={[s.inputWrap, { flex: 1 }]}>
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder={`作为 ${myName} 说点什么…`}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={s.input}
                    multiline
                    selectionColorClassName="accent-violet-400"
                  />
                </Glass>
                <TouchableOpacity style={s.sendBtn} onPress={handleSend}>
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const s = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: 'rgba(24,18,48,0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 24,
    maxHeight: '72%',
    minHeight: 300,
  },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)', alignSelf: 'center', marginBottom: 12 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  empty: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingVertical: 30 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 10 },
  inputWrap: {},
  input: { color: '#fff', fontSize: 15, paddingHorizontal: 14, paddingVertical: 10, minHeight: 42, maxHeight: 90 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  rowBody: { flex: 1 },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)' },
  name: { color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: '600' },
  time: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  text: { color: '#fff', fontSize: 15, lineHeight: 21, marginTop: 4 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#7c3aed',
  },
});