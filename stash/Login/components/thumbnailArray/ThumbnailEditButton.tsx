// Thumbnail編集ボタン
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

export type ThumbnailEditButtonProps = {
  isEditing: boolean;
  onToggle: () => void;
  style?: ViewStyle;
};

const ThumbnailEditButtonComponent: React.FC<ThumbnailEditButtonProps> = ({
  isEditing,
  onToggle,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{isEditing ? '完了' : '編集'}</Text>
    </TouchableOpacity>
  );
};
export const ThumbnailEditButton = memo(ThumbnailEditButtonComponent);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    alignItems: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
