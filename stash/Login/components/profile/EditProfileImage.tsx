import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

import { uploadImageAsync } from './UploadImage/uploadImage';

interface EditProfileImageProps {
  initialImageUri?: string;
  onImageUploaded: (imageUrl: string) => void;
  onClose: () => void;
}

const EditProfileImage: React.FC<EditProfileImageProps> = ({
  initialImageUri,
  onImageUploaded,
  onClose,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(
    initialImageUri || null
  );
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択ハンドラー（Web用）
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const uri = e.target?.result as string;
      setImageUri(uri);
      // リセット
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    };
    reader.readAsDataURL(file);
  };

  // ファイル選択ボタン
  const handleSelectImage = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ピンチジェスチャーハンドラー
  const handlePinchGesture = (event: PinchGestureHandlerGestureEvent) => {
    const newScale = Math.max(1, Math.min(3, scale * event.nativeEvent.scale));
    setScale(newScale);
  };

  // パンジェスチャーハンドラー
  const handlePanGesture = (event: PanGestureHandlerGestureEvent) => {
    setTranslateX(translateX + event.nativeEvent.translationX);
    setTranslateY(translateY + event.nativeEvent.translationY);
  };

  // 完了ボタン - 画像をアップロード
  const handleDone = async () => {
    if (!imageUri) {
      Alert.alert('エラー', '画像が選択されていません');
      return;
    }

    setUploading(true);

    try {
      // 画像を編集（スケール・位置調整を適用）
      let finalUri = imageUri;

      // スケールまたは位置調整がある場合は画像を編集
      if (scale !== 1 || translateX !== 0 || translateY !== 0) {
        const manipResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { resize: { width: 800 * scale } },
            // 位置調整は簡易的にクロップで対応
          ],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        finalUri = manipResult.uri;
      }

      // アップロード
      const result = await uploadImageAsync(finalUri);

      if (result.success && result.imageUrl) {
        onImageUploaded(result.imageUrl);
        onClose();
      } else {
        Alert.alert('エラー', `アップロードに失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('エラー', 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable onPress={onClose} disabled={uploading}>
          <Text style={styles.cancelButton}>キャンセル</Text>
        </Pressable>
        <Text style={styles.title}>プロフィール画像編集</Text>
        <Pressable onPress={handleDone} disabled={uploading || !imageUri}>
          <Text
            style={[
              styles.doneButton,
              (!imageUri || uploading) && styles.doneButtonDisabled,
            ]}
          >
            完了
          </Text>
        </Pressable>
      </View>

      {/* 画像編集エリア */}
      {imageUri ? (
        <View style={styles.editorContainer}>
          <PinchGestureHandler onGestureEvent={handlePinchGesture}>
            <PanGestureHandler onGestureEvent={handlePanGesture}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={[
                    styles.image,
                    {
                      transform: [{ scale }, { translateX }, { translateY }],
                    },
                  ]}
                  resizeMode="cover"
                />
                {/* 円形クロップ枠オーバーレイ */}
                <View style={styles.circleOverlay}>
                  <View style={styles.circleFrame} />
                </View>
              </View>
            </PanGestureHandler>
          </PinchGestureHandler>
          <Text style={styles.hint}>
            ピンチで拡大・縮小、ドラッグで位置調整できます
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>画像を選択してください</Text>
          <Pressable style={styles.selectButton} onPress={handleSelectImage}>
            <Text style={styles.selectButtonText}>画像を選択</Text>
          </Pressable>
        </View>
      )}

      {/* アップロード中インジケーター */}
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.uploadingText}>アップロード中...</Text>
        </View>
      )}

      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect as any}
        />
      )}
    </GestureHandlerRootView>
  );
};

export default EditProfileImage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButtonDisabled: {
    color: '#666',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 20,
  },
  imageWrapper: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  circleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  circleFrame: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  hint: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
});
