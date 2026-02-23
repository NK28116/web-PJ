import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { JSX, useEffect } from 'react'
import { router } from 'expo-router'
import { useState } from 'react'
import Header from '@/src/components/Header'

type Props = {
  userName: string
  birthDay: string
}

const FindMailAddress = ({ userName, birthDay }: Props): JSX.Element => {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // 仮のメールアドレス検索ロジック（実際はAPI通信など）
    if (userName === 'bxu153h6g3' && birthDay === '1990-01-01') {
      setEmail('example@example.com')
    } else {
      setErrorMessage('メールアドレスが見つかりませんでした。')
    }
  }, [userName, birthDay])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header
        title="メールアドレスをお忘れの方"
        showBackButton={true}
        showCloseButton={true}
        onBack={() => router.back()}
        onClose={() => router.push('/')}
      />
      <Text style={styles.sectionTitle}>
        以下の情報に一致するメールアドレスが見つかりました。
      </Text>

      <View style={styles.mailAddressContainer}>
        <Text>{email}</Text>
      </View>

      {errorMessage !== '' && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>
      )}
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
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 5,
    paddingHorizontal: 50,
    width: '85%',
    marginTop: 16,
    paddingVertical: 10,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loginLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 13,
  },
  mailAddressContainer: {
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    height: 40,
    borderColor: '#000',
    marginVertical: 8,
    borderWidth: 1,
    width: '85%',
    color: '#000',
    paddingHorizontal: 12,
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

  passwordInput: {
    color: '#000',
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 40,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginVertical: 20,
  },
})

export default FindMailAddress
