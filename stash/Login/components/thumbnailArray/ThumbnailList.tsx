// Thumbnail 横スクロールList
import React, { memo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ThumbnailItem } from './ThumbnailItem';

export type ThumbnailListItem = {
  name: string;
  thumbnailUrl: string | null;
  placeId: string;
};

export type ThumbnailListProps = {
  thumbnailArray?: ThumbnailListItem[];
  user?: ThumbnailListItem[];
  itemSize?: number;
  style?: object;
};

const ThumbnailListComponent: React.FC<ThumbnailListProps> = ({
  thumbnailArray,
  user,
  itemSize = 100,
  style,
}) => {
  const data = user || thumbnailArray || [];

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => (
          <ThumbnailItem
            name={item.name}
            thumbnailUrl={item.thumbnailUrl}
            placeId={item.placeId}
            size={itemSize}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};
export const ThumbnailList = memo(ThumbnailListComponent);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  list: {
    paddingLeft: 8,
    paddingRight: 16,
  },
});
