import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useState, JSX, useEffect } from 'react'
import CustomWheelPicker from './CustomWheelPicker'

type AreaPickerProps = {
  area: String
  onChange: (area: string) => void
}

const AreaPicker = ({ area, onChange }: AreaPickerProps): JSX.Element => {
  const [playArea, setPlayArea] = useState(area)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    setPlayArea(area)
  }, [area])

  const handleConfirm = (selected: string) => {
    setPlayArea(selected)
    setShowPicker(false)
    onChange(selected)
  }

  const DEFAULT_AREA = playArea === '渋谷区'

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>
        よく遊ぶエリア
        <Text style={styles.areaExpansion}>※対応エリアは随時拡大中</Text>
      </Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.pickerBox}
      >
        <Text
          style={[styles.pickerText, DEFAULT_AREA && styles.placeholderText]}
        >
          {playArea}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {showPicker && (
        <CustomWheelPicker
          dataset={generateAreaList()}
          initialValue={playArea}
          onConfirm={handleConfirm}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </View>
  )
}
const generateAreaList = (): string[] => {
  // 東京都23区リスト
  return [
    '千代田区',
    '中央区',
    '港区',
    '新宿区',
    '文京区',
    '台東区',
    '墨田区',
    '江東区',
    '品川区',
    '目黒区',
    '大田区',
    '世田谷区',
    '渋谷区',
    '中野区',
    '杉並区',
    '豊島区',
    '北区',
    '荒川区',
    '板橋区',
    '練馬区',
    '足立区',
    '葛飾区',
    '江戸川区',
  ]
}

const styles = StyleSheet.create({
  areaExpansion: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '400',
    marginVertical: 8,
  },
  arrow: {
    color: '#555',
    fontSize: 16,
  },
  label: {
    color: '#ffffff',
    flexDirection: 'row',
    fontSize: 16,
    justifyContent: 'flex-start',
    marginBottom: 4,
    width: '100%',
  },
  pickerBox: {
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    width: '40%',
  },
  pickerContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  pickerText: {
    fontSize: 16,
    textAlign: 'center',
  },
  placeholderText: {
    color: '#707070',
  },
  required: {
    color: 'red',
    fontWeight: 'bold',
  },
})

export default AreaPicker
