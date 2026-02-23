import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useState, JSX, useEffect } from 'react'
import CustomWheelPicker from './CustomWheelPicker'

type BirthDayPickerProps = {
  birthDay: String
  onChange: (birthDay: string) => void
}

const BirthDayPicker = ({
  birthDay,
  onChange,
}: BirthDayPickerProps): JSX.Element => {
  const [birthDate, setBirthDate] = useState(birthDay)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    setBirthDate(birthDay)
  }, [birthDay])

  const handleConfirm = (selected: string) => {
    setBirthDate(selected)
    setShowPicker(false)
    onChange(selected)
  }

  const DEFAULT_DATE = birthDate === '2000/01/01'

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>
        生年月日 <Text style={styles.required}>※必須</Text>
      </Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.pickerBox}
      >
        <Text
          style={[styles.pickerText, DEFAULT_DATE && styles.placeholderText]}
        >
          {birthDate}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {showPicker && (
        <CustomWheelPicker
          dataset={generateDateList()}
          initialValue={birthDate}
          onConfirm={handleConfirm}
          onCancel={() => setShowPicker(false)}
        />
      )}

      <Text style={styles.note}>※生年月日は変更できません</Text>
    </View>
  )
}
//TODO: データセットの軽量化しないと動きがもっさり
const generateDateList = (): string[] => {
  const dates: string[] = []

  const today = new Date()
  const start = new Date(
    today.getFullYear() - 50,
    today.getMonth(),
    today.getDate()
  ) // 50年前
  const end = new Date(
    today.getFullYear() - 20,
    today.getMonth(),
    today.getDate()
  ) // 20年前

  let current = new Date(start)

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10)) // "YYYY-MM-DD"
    current.setDate(current.getDate() + 1)
  }

  return dates
}

const styles = StyleSheet.create({
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
  note: {
    color: '#ffffff',
    flexDirection: 'row',
    fontSize: 13,
    justifyContent: 'flex-start',
    marginTop: 8,
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
    width: '50%',
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

export default BirthDayPicker
