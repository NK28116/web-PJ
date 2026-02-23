import {
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { JSX } from 'react'

interface Props {
  label: string
  onPress?: () => void
  style?: StyleProp<ViewStyle> // 外部からのスタイル
  labelStyle?: StyleProp<TextStyle> // ラベルのスタイルも動的にしたいとき
  color?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
}

const Button = (props: Props): JSX.Element => {
  const {
    label,
    onPress,
    style,
    labelStyle,
    color = '#ffffff',
    backgroundColor,
    borderColor = '#000000',
    borderWidth = 1,
  } = props

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth,
        },
        style,
      ]}
    >
      <Text style={[styles.buttonLabel, { color }, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    marginBottom: 'auto',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 700,

    paddingHorizontal: 24,
    paddingVertical: 8,
    textAlign: 'center',
  },
})

export default Button
