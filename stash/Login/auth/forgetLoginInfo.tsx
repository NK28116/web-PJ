import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native'
import { JSX } from 'react'
import { router } from 'expo-router'

import { useState } from 'react'
import Unreceive from '@/src/components/signUp/Unreceive'
import Header from '@/src/components/Header'
import {
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'

const ForgetLoginInfo = (): JSX.Element => {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordReinput, setPasswordReinput] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

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

      // Firebaseではパスワード更新の前に再認証が必要になる場合あり
      if (user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        ) // currentPasswordはユーザーが現在使っているパスワード
        await reauthenticateWithCredential(user, credential)
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
          title="パスワードリセット"
          showBackButton={true}
          showCloseButton={true}
          onBack={() => router.back()}
          onClose={() => router.push('/')}
        />
        <View style={styles.headerDivider} />

        <Text style={styles.sectionTitle}>
          パスワードリセットのメールをお送りします
          <br />
          登録済みのメールアドレスを入力してください
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.containerTitle}>メールアドレス</Text>

          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            placeholderTextColor="#707070"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          {/* エラーメッセージを赤文字で表示 */}
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

          <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              setModalVisible(!modalVisible)
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text>メールを送信しました メールをご確認ください</Text>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.registerButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => handlePress()}
          >
            <Text style={styles.registerButtonText}>リセットメールを送信</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/forgetMailInfo')}>
            <Text style={styles.forgotPassword}>
              メールアドレスをお忘れの方はこちら
            </Text>
          </TouchableOpacity>
        </View>

        <Unreceive />
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
    alignSelf: 'center',
    textDecorationLine: 'underline',
  },
  loginLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 13,
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerContainer: {
    backgroundColor: '#1A1A1A',
    flex: 1,
  },
  containerTitle: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 5,
    width: '85%',
    alignSelf: 'center',
  },
  registerButton: {
    backgroundColor: '#9B1B1B',
    width: '85%',
    borderRadius: 5,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderColor: '#000',
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: 24,
  },

  inputContainer: {
    marginBottom: 20,
    backgroundColor: '#333333',
    width: '90%',
    paddingBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 40,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  registerButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    margin: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  passwordContainer: {
    alignItems: 'center',
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
  passwordInput: {
    color: '#000',
    flex: 1,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginVertical: 20,
  },
})

export default ForgetLoginInfo
