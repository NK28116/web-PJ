import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { JSX } from 'react'
import { Link } from 'expo-router'

import { useState } from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'

type Props = {
  email: string
  setEmail: (email: string) => void
  onNextStep: () => void
}

const AuthEmailNumber = ({ email, onNextStep }: Props): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState('')
  const [code, setCode] = useState(['', '', '', ''])

  const handleVerify = (): void => {
    setErrorMessage('')
    if (!code) {
      setErrorMessage('※未入力の箇所があります')
      return
    }

    // 認証コードのバリデーションなどがあればここに記述
    console.log('認証完了')
    onNextStep() // ステップ3へ進む
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.checkEmail}>
          <FontAwesome5 name="check-circle" size={24} color="green" />
          <Text style={styles.signupLabel}>
            以下のメールアドレスに送信しました
          </Text>
        </View>

        <Text style={styles.showEmail}>{email}</Text>
        <Text style={styles.signupLabel}>
          メールに記載された
          <br />
          4桁の認証コードを入力してください
        </Text>

        <View style={styles.inputNumberContainer}>
          {/* 認証コード入力欄 */}
          {[0, 1, 2, 3].map((i) => (
            <TextInput
              key={i}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              style={styles.inputNumber}
              maxLength={1}
              value={code[i]}
              onChangeText={(text) => {
                // 半角数字のみ許可
                const num = text.replace(/[^0-9]/g, '')
                const newCode = [...code]
                newCode[i] = num
                setCode(newCode)
              }}
            />
          ))}
          {errorMessage !== '' && (
            <Text style={{ color: 'red', marginBottom: 12 }}>
              {errorMessage}
            </Text>
          )}
        </View>

        {/* メール再送信・再設定 */}
        <Link href="" asChild replace>
          <TouchableOpacity>
            <Text style={styles.reSendMail}>認証メールを再送信</Text>
          </TouchableOpacity>
        </Link>

        {/* 認証ボタン */}
        <TouchableOpacity onPress={handleVerify} style={styles.signupButton}>
          <Text style={styles.signupButtonText}>認証</Text>
        </TouchableOpacity>

        <Link href="" asChild replace>
          <TouchableOpacity>
            <Text style={styles.reSendMail}>メールアドレスを再設定</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  checkEmail: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderColor: '#000',
    borderRadius: 5,
    borderWidth: 1,
    color: '#000',
    height: 40,
    marginVertical: 8,
    paddingHorizontal: 12,
    width: '15%',
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
  },
  inputNumber: {
    backgroundColor: '#D9D9D9',
    borderColor: '#000',
    borderRadius: 5,
    borderWidth: 1,
    color: '#000',
    height: 45,
    fontSize: 24,
    marginHorizontal: 5,
    marginVertical: 8,
    width: 37,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlign: 'center',
  },
  inputNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
  },
  reSendMail: {
    color: '#38B6FF',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginVertical: 20,
  },
  showEmail: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 8,
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: '#9B1B1B',
    borderColor: '#000000',
    borderRadius: 5,
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 16,
    width: '85%',
    paddingHorizontal: 50,
    paddingVertical: 10,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  signupLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 13,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 40,
  },
})

export default AuthEmailNumber
