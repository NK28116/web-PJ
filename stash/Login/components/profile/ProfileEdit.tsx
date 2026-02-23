import { useUser } from '@/src/contexts/UserContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import UpdateProfileImage from './UpdateProfileImage';

interface ProfileEditProps {
  user?: {
    name: string;
    nickname: string;
    characterImgUrl?: string;
    bio?: string;
    area?: string;
  };
}

const ProfileEdit: React.FC<ProfileEditProps> = () => {
  const router = useRouter();
  const { user, updateUser } = useUser();

  const [nickname, setNickname] = useState(user.nickname || '');
  const [username, setUsername] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [area, setArea] = useState(user.area || '');
  const [showImageModal, setShowImageModal] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user.characterImgUrl || null
  );

  const handleSave = () => {
    updateUser({
      name: username,
      nickname: nickname,
      bio: bio,
      area: area,
      characterImgUrl: avatarUri || user.characterImgUrl,
    });
    router.push('/(tabs)/profile');
  };

  const handleEditPress = () => {
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
  };

  const handleImageSelected = (uri: string) => {
    setAvatarUri(uri);
    setShowImageModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.cancelButton}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>プロフィールの編集</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>完了</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* アバター */}
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image
              source={{
                uri: avatarUri,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatarContainer]}>
              <Octicons name="feed-person" size={50} color="#666" />
            </View>
          )}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleEditPress}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ニックネーム */}
        <View style={styles.section}>
          <Text style={styles.label}>ニックネーム</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="ニックネームを入力"
            placeholderTextColor="#666"
          />
        </View>

        {/* ユーザーネーム */}
        <View style={styles.section}>
          <Text style={styles.label}>ユーザーネーム</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="ユーザーネームを入力"
            placeholderTextColor="#666"
          />
        </View>

        {/* 自己紹介 */}
        <View style={styles.section}>
          <Text style={styles.label}>自己紹介</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="自己紹介を入力してください、あなたらしさを伝えましょう！"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* よく遊ぶエリア */}
        <View style={styles.section}>
          <Text style={styles.label}>よく遊ぶエリア</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setArea(area)}
          >
            <Text style={styles.dropdownText}>{area || '渋谷'}</Text>
          </TouchableOpacity>
        </View>

        {/* ナイトライフタイプの公開設定 */}
        <View style={styles.section}>
          <Text style={styles.label}>ナイトライフタイプの公開設定</Text>
          <Text style={styles.description}>
            オフにすると、あなたのナイトライフタイプが「シークレットナイト」として表示されます
          </Text>
          <TouchableOpacity style={styles.toggleButton}>
            <View style={styles.toggle} />
          </TouchableOpacity>
        </View>

        {/* アカウントの設定 */}
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingText}>アカウントの設定</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showImageModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1}>
          <View onStartShouldSetResponder={() => true}>
            <UpdateProfileImage
              onClose={handleCloseModal}
              onImageSelected={handleImageSelected}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileEdit;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#666',
    fontSize: 14,
  },
  saveButton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  defaultAvatarContainer: {
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 0,
    backgroundColor: '#666',
    borderRadius: 20,
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  dropdownInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 14,
  },
  description: {
    color: '#999',
    fontSize: 12,
    marginBottom: 12,
    marginTop: 8,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 24,
  },
  settingText: {
    color: '#fff',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
});
