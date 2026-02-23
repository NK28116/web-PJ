import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'

type Props = {
  dataset: string[]
  initialValue?: String
  onConfirm: (value: string) => void
  onCancel?: () => void
}
const ITEM_HEIGHT = 48

const CustomWheelPicker = ({
  dataset,
  initialValue,
  onConfirm,
  onCancel,
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const flatListRef = useRef<FlatList<string>>(null)

  useEffect(() => {
    const index = dataset.findIndex((d) => d === initialValue)
    if (index >= 0) {
      setSelectedIndex(index)
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          animated: false,
          offset: index * ITEM_HEIGHT,
        })
      }, 0)
    }
  }, [initialValue, dataset])

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    setSelectedIndex(index)
  }

  const confirmValue = () => {
    onConfirm(dataset[selectedIndex])
    console.log('現在の選択:', dataset[selectedIndex])
  }

  return (
    <Modal transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.pickerContainer}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmValue}>
              <Text style={styles.doneText}>完了</Text>
            </TouchableOpacity>
          </View>

          {/* ホイール本体 */}
          <View style={styles.wheelWrapper}>
            <FlatList
              ref={flatListRef}
              data={dataset}
              keyExtractor={(item, index) => `${item}-${index}`}
              getItemLayout={(_, index) => ({
                index,
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
              })}
              initialScrollIndex={selectedIndex}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
              renderItem={({ item, index }) => (
                <View style={styles.item}>
                  <Text
                    style={[
                      styles.itemText,
                      index === selectedIndex && styles.itemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              )}
            />
            <View style={styles.highlight} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  cancelText: {
    color: '#999',
    fontSize: 16,
  },
  doneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  highlight: {
    height: ITEM_HEIGHT,
    left: 0,
    borderTopWidth: 1,
    position: 'absolute',
    borderBottomWidth: 1,
    top: ITEM_HEIGHT * 2,
    borderColor: '#ccc',
    right: 0,
  },
  item: {
    alignItems: 'center',
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  itemText: {
    color: '#666',
    fontSize: 20,
  },
  itemTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  wheelWrapper: {
    height: ITEM_HEIGHT * 5,
    position: 'relative',
    width: width,
  },
})

export default CustomWheelPicker
