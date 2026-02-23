import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import EditProfileImage from './EditProfileImage';
import TakePictureWithCamera from './UploadImage/TakePictureWithCamera';
import {
  useCameraPicker,
  useImagePicker,
} from './UploadImage/UploadProfileImage';

interface UpdateProfileImageProps {
  onClose: () => void;
  onImageSelected?: (uri: string) => void;
}

const UpdateProfileImage: React.FC<UpdateProfileImageProps> = ({
  onClose,
  onImageSelected,
}) => {
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { pickImage } = useImagePicker();
  const { takePhoto } = useCameraPicker();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択ハンドラー（Web用）
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const uri = e.target?.result as string;
      setSelectedImageUri(uri);
      setShowImageEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleLibraryPress = async () => {
    fileInputRef.current?.click();
  };

  const handleCameraPress = async () => {
    setShowCamera(true);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  // Show image editor modal
  if (showImageEditor) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        onRequestClose={() => {
          setShowImageEditor(false);
          setSelectedImageUri(null);
        }}
      >
        <EditProfileImage
          initialImageUri={selectedImageUri || undefined}
          onImageUploaded={(imageUrl: string) => {
            if (onImageSelected) {
              onImageSelected(imageUrl);
            }
            setShowImageEditor(false);
            setSelectedImageUri(null);
            onClose();
          }}
          onClose={() => {
            setShowImageEditor(false);
            setSelectedImageUri(null);
          }}
        />
      </Modal>
    );
  }

  // Show camera modal
  if (showCamera) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        onRequestClose={handleCameraClose}
      >
        <TakePictureWithCamera />
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.handleBar} />
      </View>

      <Text style={styles.title}>プロフィールアイコン設定</Text>

      {/* ライブラリから選択 */}
      <TouchableOpacity style={styles.menuItem} onPress={handleLibraryPress}>
        <View style={styles.iconContainer}>
          <Ionicons name="image" size={24} color="#fff" />
        </View>
        <Text style={styles.menuText}>ライブラリから選択</Text>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      {/* 写真を撮る */}
      <TouchableOpacity style={styles.menuItem} onPress={handleCameraPress}>
        <View style={styles.iconContainer}>
          <Ionicons name="camera" size={24} color="#fff" />
        </View>
        <Text style={styles.menuText}>写真を撮る</Text>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      {/* 現在の写真を削除 */}
      <TouchableOpacity style={styles.deleteItem}>
        <View style={styles.deleteIconContainer}>
          <Ionicons name="trash" size={24} color="#FF6B6B" />
        </View>
        <Text style={styles.deleteText}>現在の写真を削除</Text>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      {Platform.OS === 'web' && (
        <input
          id="libraryInput"
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect as any}
          placeholder="画像を選択"
        />
      )}
    </View>
  );
};

export default UpdateProfileImage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  deleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  deleteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 14,
    flex: 1,
  },
});
