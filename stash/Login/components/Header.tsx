import React, { JSX } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import Entypo from '@expo/vector-icons/Entypo'

type HeaderProps = {
  title?: string
  showBackButton?: boolean
  showCloseButton?: boolean
  onBack?: () => void
  onClose?: () => void
}

const Header = ({
  title = 'Memo App',
  showBackButton = false,
  showCloseButton = false,
  onBack,
  onClose,
}: HeaderProps): JSX.Element => {
  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity style={styles.leftIcon} onPress={onBack}>
          <Entypo name="chevron-thin-left" size={24} color="#AFAEAC" />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{title}</Text>

      {showCloseButton && (
        <TouchableOpacity style={styles.rightIcon} onPress={onClose}>
          <EvilIcons name="close" size={48} color="#AFAEAC" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#1A1A1A',
    height: 53,
    justifyContent: 'space-between',
    position: 'relative',
  },
  leftIcon: {
    left: 16,
    position: 'absolute',
    top: 28,
  },
  rightIcon: {
    position: 'absolute',
    right: 5,
    top: 5,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 400,
    marginVertical: 15,
  },
})

export default Header
