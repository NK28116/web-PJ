import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

// Platform-aware image picker hooks and components

/**
 * Hook for selecting images from device library
 * Automatically uses platform-appropriate picker
 */
export const useImagePicker = () => {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      // For web, return null and let the component handle it
      return null;
    }

    // Native: Use expo-image-picker (shows OS native thumbnail grid)
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Permission to access the media library is required.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImage(uri);
      return uri;
    }

    return null;
  };

  return { image, pickImage, setImage };
};

/**
 * Hook for taking photos with camera
 */
export const useCameraPicker = () => {
  const [image, setImage] = useState<string | null>(null);

  const takePhoto = async (): Promise<string | null> => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Permission to access the camera is required.'
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImage(uri);
      return uri;
    }

    return null;
  };

  return { image, takePhoto, setImage };
};

// Default export for backward compatibility
export default {
  useImagePicker,
  useCameraPicker,
};
