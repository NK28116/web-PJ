// サムネイル単体
import React, { memo } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { svgIcons } from '../../const/svgIcons/svgIcons';

export type ThumbnailItemProps = {
  name: string;
  thumbnailUrl: string | null;
  placeId: string;
  url?: string;
  size?: number;
};

const ThumbnailItemComponent: React.FC<ThumbnailItemProps> = ({
  name,
  thumbnailUrl,
  placeId,
  url,
  size = 100,
}) => {
  const handlePress = () => {
    const mapUrl: string =
      url ||
      (placeId && placeId !== 'ChIJ...'
        ? `https://www.google.com/maps/place/?q=place_id:${placeId}`
        : `https://www.google.com/maps/search/${encodeURIComponent(name)}`);
    Linking.openURL(mapUrl);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.container, { width: size, height: size }]}
      >
        <View style={[styles.imageWrapper, { width: size, height: size }]}>
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} style={styles.image} />
          ) : (
            <SvgXml xml={svgIcons.noImage} width={size} height={size} />
          )}
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </TouchableOpacity>
    </>
  );
};

export const ThumbnailItem = memo(ThumbnailItemComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 8,
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    marginTop: 4,
    fontSize: 12,
    color: '#ffffff',
    maxWidth: 100,
    textAlign: 'center',
  },
});
