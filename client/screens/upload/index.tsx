import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { GlossyScreen } from '@/components/GlossyScreen';
import { Glass } from '@/components/Glass';
import { SmartDateInput } from '@/components/SmartDateInput';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { uploadMoment } from '@/services/api';

export default function UploadScreen() {
  const router = useSafeRouter();
  const { currentMemberId } = useFamilyStore();
  const [media, setMedia] = useState<{ uri: string; type: 'image' | 'video'; mime: string } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capturedAt, setCapturedAt] = useState<string>(new Date().toISOString());
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  const mimeOf = (uri: string) => (uri.includes('.mp4') || uri.includes('video') ? 'video/mp4' : 'image/jpeg');

  const pickLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('提示', '需要相册权限才能选择照片或视频');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      setMedia({
        uri: a.uri,
        type: a.type === 'video' ? 'video' : 'image',
        mime: a.mimeType || mimeOf(a.uri),
      });
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('提示', '需要相机权限才能拍摄');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      setMedia({ uri: a.uri, type: 'image', mime: a.mimeType || 'image/jpeg' });
    }
  };

  const handleSubmit = async () => {
    if (!media) return Alert.alert('提示', '请先选择或拍摄一张照片/视频');
    if (!title.trim()) return Alert.alert('提示', '请填写标题');
    setUploading(true);
    setProgress(0);
    progressRef.current = 0;
    try {
      const { moment } = await uploadMoment({
        file: media,
        title: title.trim(),
        description: description.trim(),
        capturedAt,
        memberId: currentMemberId,
        onProgress: (p: number) => {
          progressRef.current = p;
          setProgress(p);
        },
      });
      Alert.alert('上传成功', '你的家庭瞬间已添加到时间线', [
        { text: '去浏览', onPress: () => router.replace('/') },
      ]);
    } catch (e: any) {
      Alert.alert('上传失败', e?.message || '请稍后重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <GlossyScreen title="分享瞬间" subtitle="把家人美好的这一刻存进家庭时光">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* 媒体选择 */}
          {!media ? (
            <View style={styles.pickRow}>
              <TouchableOpacity style={styles.pickCard} onPress={pickLibrary}>
                <Glass radius={20} bg="rgba(124,58,237,0.25)" style={styles.pickInner}>
                  <Ionicons name="images-outline" size={30} color="#c4b5fd" />
                  <Text style={styles.pickText}>相册选择</Text>
                </Glass>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }} onPress={takePhoto}>
                <Glass radius={20} bg="rgba(56,189,248,0.2)" style={styles.pickInner}>
                  <Ionicons name="camera-outline" size={30} color="#7dd3fc" />
                  <Text style={styles.pickText}>相机拍摄</Text>
                </Glass>
              </TouchableOpacity>
            </View>
          ) : (
            <Glass radius={20} bg="rgba(255,255,255,0.08)" style={styles.previewCard}>
              {media.type === 'image' ? (
                <Image source={{ uri: media.uri }} style={styles.preview} contentFit="cover" />
              ) : (
                <Video
                  source={{ uri: media.uri }}
                  style={styles.preview}
                  resizeMode={ResizeMode.COVER}
                  isLooping={false}
                  shouldPlay
                  useNativeControls
                />
              )}
              <TouchableOpacity style={styles.repick} onPress={() => setMedia(null)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </Glass>
          )}

          {/* 标题 */}
          <Text style={styles.label}>标题</Text>
          <Glass radius={16} bg="rgba(255,255,255,0.1)">
            <TextInput
              style={styles.input}
              placeholder="给这个瞬间起个名字"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={title}
              onChangeText={setTitle}
            />
          </Glass>

          <Text style={styles.label}>描述</Text>
          <Glass radius={16} bg="rgba(255,255,255,0.1)">
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="写下这一刻的故事…"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </Glass>

          <Text style={styles.label}>拍摄时间</Text>
          <SmartDateInput
            mode="date"
            displayFormat="YYYY年MM月DD日"
            value={capturedAt}
            onChange={(iso) => setCapturedAt(iso)}
            inputStyle={{ backgroundColor: 'transparent' }}
            textStyle={{ color: '#fff' }}
          />

          {/* 上传进度 */}
          {uploading && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% · 上传中…</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submit, (uploading || !media) && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={uploading || !media}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>发布到家庭时光</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </GlossyScreen>
  );
}

const styles = StyleSheet.create({
  pickRow: { flexDirection: 'row', gap: 12, marginBottom: 20, height: 150 },
  pickCard: { flex: 1, height: 150 },
  pickInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, height: 150 },
  pickText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  previewCard: { marginBottom: 20, overflow: 'hidden' },
  preview: { width: '100%', height: 300, borderRadius: 20 },
  repick: {
    position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8, marginTop: 16, fontWeight: '700' },
  input: { color: '#fff', fontSize: 15, paddingHorizontal: 14, paddingVertical: 13 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  progressWrap: { marginTop: 20 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#a78bfa' },
  progressText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8, textAlign: 'center' },
  submit: {
    marginTop: 24, backgroundColor: '#7c3aed', paddingVertical: 15, borderRadius: 18,
    alignItems: 'center', shadowColor: '#7c3aed', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});