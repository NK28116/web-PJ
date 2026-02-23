import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native'
import { JSX } from 'react'
import { router } from 'expo-router'

import { useState } from 'react'
import Icon from '@/src/components/Icon'
import Header from '@/src/components/Header'

import { getAuth, updatePassword } from 'firebase/auth'

type FormData = {
  password: string
}

type Props = {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
}

const ReConfirmPassword = ({ form, setForm }: Props): JSX.Element => {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordReinput, setPasswordReinput] = useState('')
  const [showPassword, setShowPassword] = useState(false) // ✅ 追加

  const comparePassword = (text: string) => {
    // ✅ 追加
    if (text !== password) {
      setErrorMessage('パスワードが一致しません')
    } else {
      setErrorMessage('')
    }
  }
  const validatePassword = (pw: string): string => {
    if (!pw) return '※未入力の箇所があります'
    if (pw.length < 8) return 'パスワードは8文字以上で入力してください'
    let types = 0
    if (/[a-z]/.test(pw)) types++
    if (/[A-Z]/.test(pw)) types++
    if (/[0-9]/.test(pw)) types++
    if (types < 2)
      return 'パスワードは半角小文字・半角大文字・数字のうち2種類以上を含めてください'
    return ''
  }

  const handlePress = async (): Promise<void> => {
    setErrorMessage('')

    if (!password || !passwordReinput) {
      setErrorMessage('※未入力の箇所があります')
      return
    }

    if (password !== passwordReinput) {
      setErrorMessage('パスワードが一致しません')
      return
    }

    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) {
        setErrorMessage('ユーザー情報が見つかりません')
        return
      }

      await updatePassword(user, password)
      setModalVisible(true)
    } catch (error) {
      console.error(error)
      setErrorMessage('パスワード変更に失敗しました')
    }
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header
          title="パスワード再設定"
          showBackButton={false}
          showCloseButton={false}
          onBack={() => router.back()}
          onClose={() => router.push('/')}
        />
        <View style={styles.headerDivider} />

        <Text style={styles.sectionTitle}>
          新しいパスワードを設定してください
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.containerTitle}>
            新しいパスワード (8文字以上)
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry
              placeholder="パスワード"
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setForm((prev) => ({ ...prev, password: text }))
                // 入力ごとにバリデーション
                const pwError = validatePassword(text)
                setErrorMessage(pwError)
              }}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Icon
                name={showPassword ? 'eye' : 'eye-blocked'}
                size={24}
                color="#707070"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionNotice}>
            以下のうち2種類以上を含めてください：
            <br />
            ・半角小文字・半角大文字 <br />
            ・数字(0-9)
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry
              placeholder="パスワード再入力"
              value={passwordReinput}
              onChangeText={(text) => {
                setPasswordReinput(text)
                comparePassword(text)
              }}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Icon
                name={showPassword ? 'eye' : 'eye-blocked'}
                size={24}
                color="#707070"
              />
            </TouchableOpacity>
          </View>

          {errorMessage !== '' && (
            <Text
              style={{
                alignSelf: 'center',
                color: 'red',
                marginBottom: 12,
                width: '85%',
              }}
            >
              {errorMessage}
            </Text>
          )}

          <TouchableOpacity onPress={handlePress} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>設定</Text>
          </TouchableOpacity>

          {/* ✅ モーダルの常時描画（visibleで表示制御） */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text>パスワードを変更しました</Text>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => {
                    setModalVisible(false)
                    router.push('/auth/login') // モーダル閉じたあとにログイン画面へ遷移など
                  }}
                >
                  <Text style={styles.registerButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    alignSelf: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    height: 40,
    marginVertical: 8,
    borderColor: '#000',
    width: '85%',
    borderWidth: 1,
    color: '#000',
    paddingHorizontal: 12,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 5,
    width: '85%',
    paddingHorizontal: 50,
    marginTop: 16,
    paddingVertical: 10,
  },
  forgotPassword: {
    color: '#38B6FF',
    fontSize: 13,
    marginBottom: 25,
    marginTop: 25,
    textDecorationLine: 'underline',
  },
  loginLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 13,
  },
  agreementLink: {
    color: '#38B6FF',
    fontSize: 13,
    textAlign: 'center',
  },
  outerContainer: {
    backgroundColor: '#1A1A1A',
    flex: 1,
  },
  agreementNote: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    width: '85%',
  },
  registerButton: {
    alignSelf: 'center',
    width: '85%',
    backgroundColor: '#9B1B1B',
    borderRadius: 5,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 24,
  },

  centeredView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: '#333333',
    marginBottom: 20,
    paddingBottom: 20,
    width: '90%',
  },
  registerButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  containerTitle: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 5,
    alignSelf: 'center',
    marginTop: 15,
    width: '85%',
  },
  passwordContainer: {
    alignSelf: 'center',
    backgroundColor: '#D9D9D9',
    flexDirection: 'row',
    borderRadius: 5,
    height: 40,
    marginVertical: 8,
    width: '85%',
    borderColor: '#000',
    paddingHorizontal: 12,
    borderWidth: 1,
  },

  inputWrapper: {
    alignSelf: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    flexDirection: 'row',
    borderWidth: 1,
    height: 40,
    borderColor: '#000',
    width: '85%',
    paddingHorizontal: 12,
  },

  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginVertical: 20,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    elevation: 5,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  passwordInput: {
    flex: 1,
    color: '#000',
  },
  sectionNotice: {
    alignSelf: 'center',
    color: '#FFF',
    fontSize: 13,
    marginBottom: 16,
    marginTop: 1,
    width: '85%',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 24,
    width: '85%',
  },
})

export default ReConfirmPassword
