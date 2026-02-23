import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { JSX } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

import { useState } from 'react'
import Header from '@/src/components/Header'
import { SearchCheck } from 'lucide-react'
import { validateUserName } from '@/src/util/validation/validateUserName'
import { bannedWordsSample } from '@/src/util/validation/bannedWordsSample'

const isValidUserName = (name: string) => {
  // 例: 英数字とアンダースコア3~15文字のみ許可
  const regex = /^[a-zA-Z0-9_]{3,15}$/
  return regex.test(name)
}

const ChangeUserName = (): JSX.Element => {
  const { userName: initialUserName } = useLocalSearchParams<{
    userName?: string
  }>()
  const [userName, setUserName] = useState(initialUserName || '')
  const [errorMessage, setErrorMessage] = useState('')
  const [isAvailable, setIsAvailable] = useState(false) // 使用可能フラグ
  const [isTouched, setIsTouched] = useState(false) // 入力フォーカスを外したか

  const handleBlur = () => {
    setIsTouched(true)
    const { valid, error } = validateUserName(userName, bannedWordsSample)

    if (!isValidUserName(userName)) {
      setErrorMessage('※ユーザーネームを入力してください')
      setIsAvailable(false)
    } else {
      setErrorMessage('')
      setIsAvailable(true)
    }
  }

  const handlePress = (): void => {
    if (!userName) {
      setErrorMessage('※ユーザーネームを入力してください')
      return
    }
    if (!isAvailable) {
      setErrorMessage('※有効なユーザーネームを入力してください')
      return
    }

    // Firestoreなどへの保存処理ここに

    console.log('ユーザーネーム変更:', userName)
    router.push({
      params: { userName },
      pathname: '/memo/list',
    })
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header
          title="ユーザーネーム変更"
          showBackButton={true}
          showCloseButton={true}
          onBack={() => router.back()}
          onClose={() => router.push('/')}
        />
        <View style={styles.headerDivider} />

        <Text style={styles.sectionTitle}>
          PLAN Bで使われるユーザーネームです。
          <br />
          ユーザーネームはいつでも変更できます。
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.containerTitle}>ユーザーネーム</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={initialUserName || 'ユーザーネームを入力'}
              placeholderTextColor="#707070"
              value={userName}
              onChangeText={setUserName}
              onBlur={handleBlur}
              autoCapitalize="none"
            />
            <SearchCheck
              size={32}
              color={isAvailable ? '#0CBA65' : '#999'} // 使用可能なら緑色、それ以外はグレー
            />
          </View>
          {isAvailable && (
            <Text
              style={{
                alignSelf: 'center',
                color: '#0CBA65',
                fontSize: 14,
                marginLeft: 6,
                width: '85%',
              }}
            >
              ※このユーザーネームは使用できます
            </Text>
          )}

          <Text style={styles.sectionNotice}>
            &nbsp;※ユーザーネームは全ユーザーに公開されます
          </Text>
          {/* エラーメッセージを赤文字で表示 */}
          {errorMessage !== '' && (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          )}

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: isAvailable ? '#D4AF37' : '#999' },
            ]}
            onPress={handlePress}
            disabled={!isAvailable}
          >
            <Text style={styles.loginButtonText}>PlanB を始める</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    flexGrow: 1,
    paddingVertical: 4,
  },
  //区切り線
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: 2,
    marginBottom: 0,
    width: '85%',
  },

  // エラーメッセージ
  errorMessage: {
    alignSelf: 'flex-start',
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: '7.5%',
  },

  //ヘッダ
  headerDivider: {
    backgroundColor: '#A3A19E',
    height: 3,
    width: '100%',
  },

  //inputArea
  input: {
    color: '#000',
    flex: 1,
    paddingHorizontal: 12,
  },

  containerTitle: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 5,
    alignSelf: 'center',
    marginTop: 15,
    width: '85%',
  },

  inputContainer: {
    backgroundColor: '#333333',
    marginBottom: 20,
    paddingBottom: 20,
    width: '90%',
  },

  inputWrapper: {
    alignSelf: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    borderColor: '#000',
    height: 40,
    paddingHorizontal: 12,
    width: '85%',
  },

  outerContainer: {
    backgroundColor: '#1A1A1A',
    flex: 1,
  },

  //ログインボタン
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 5,
    alignSelf: 'center',
    paddingHorizontal: 50,
    marginTop: 16,
    width: '85%',
    paddingVertical: 10,
  },

  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  sectionNotice: {
    alignSelf: 'center',
    color: '#FFF',
    fontSize: 13,
    marginBottom: 16,
    marginTop: 1,
    width: '85%',
  },
  //各エリアのタイトル
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 5,
    marginTop: 15,
    width: '85%',
  },
})

export default ChangeUserName
