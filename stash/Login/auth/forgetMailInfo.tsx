import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { JSX } from 'react'
import { router } from 'expo-router'

import { useState } from 'react'
import Header from '@/src/components/Header'
import BirthDayPicker from '@/src/components/CustomWheelPicker/BirthDayPicker'
import FindMailAddress from '@/src/components/signUp/FindMailAddress'

const ForgetMailInfo = (): JSX.Element => {
  const [userName, setUserName] = useState('')
  const [birthDay, setBirthDay] = useState('2000-01-01')
  const [errorMessage, setErrorMessage] = useState('')
  const [showResult, setShowResult] = useState(false)

  const handlePress = () => {
    setErrorMessage('')

    if (!userName) {
      setErrorMessage('※未入力の箇所があります')
      return
    }

    // 簡易的な一致チェック（本来はサーバーサイドで行う）
    if (userName === 'bxu153h6g3' && birthDay === '1990-01-01') {
      setShowResult(true)
    } else {
      setErrorMessage('一致する情報が見つかりませんでした。')
    }
  }

  if (showResult) {
    return <FindMailAddress userName={userName} birthDay={birthDay} />
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header
        title="メールアドレスをお忘れの方"
        showBackButton={true}
        showCloseButton={true}
        onBack={() => router.back()}
        onClose={() => router.push('/')}
      />
      <View style={styles.headerDivider} />
      <Text style={styles.sectionTitle}>
        以下の情報のご入力で、条件に一致するメールアドレスが見つかりました。
        お心覚えがある場合は、再度ログインをお試しください。
      </Text>

      <Text style={styles.registerButtonText}>生年月日</Text>
      <BirthDayPicker
        birthDay={birthDay}
        onChange={(date: string) => setBirthDay(date)}
      />

      <TextInput
        style={styles.input}
        placeholder="ユーザーネーム"
        value={userName}
        onChangeText={setUserName}
      />

      {errorMessage !== '' && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>
      )}

      <TouchableOpacity style={styles.registerButton} onPress={handlePress}>
        <Text style={styles.registerButtonText}>検索</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    flexGrow: 1,
    paddingVertical: 4,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: 2,
    width: '85%',
  },
  headerDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: 2,
    marginVertical: 16,
    width: '100%',
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    borderColor: '#000',
    height: 40,
    borderWidth: 1,
    marginVertical: 8,
    color: '#000',
    width: '85%',
    paddingHorizontal: 12,
  },
  forgotPassword: {
    color: '#38B6FF',
    fontSize: 13,
    marginBottom: 25,
    marginTop: 25,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 5,
    width: '85%',
    paddingHorizontal: 50,
    marginTop: 16,
    paddingVertical: 10,
  },
  agreementLink: {
    color: '#38B6FF',
    fontSize: 13,
    textAlign: 'center',
  },
  loginLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 13,
  },
  agreementNote: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    width: '85%',
  },
  registerButton: {
    backgroundColor: '#9B1B1B',
    width: '85%',
    borderRadius: 5,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 24,
  },

  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 40,
  },
  passwordContainer: {
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    flexDirection: 'row',
    height: 40,
    marginVertical: 8,
    borderColor: '#000',
    width: '85%',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  registerButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  brand: {
    color: '#FFF',
    fontFamily: 'Tiro Telugu',
    fontSize: 32,
    marginBottom: 27,
    marginTop: 4,
  },
  passwordInput: {
    color: '#000',
    flex: 1,
  },

  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginVertical: 20,
  },
  socialButton: {
    backgroundColor: '#000',
    alignItems: 'center',
    
    borderColor: '#FFF',
    // または 'transparent'
    borderRadius: 5,
    borderWidth: 1,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '45%',
  },
  socialButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  socialButtonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },

  socialIcon: {
    alignItems: 'flex-start',
    height: 20,
    marginRight: 2,
    width: 20,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 24,
    width: '85%',
  },
})

export default ForgetMailInfo
