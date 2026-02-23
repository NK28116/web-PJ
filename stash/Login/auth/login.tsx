import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native'
import { JSX } from 'react'
import { Link, router } from 'expo-router'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebaseConfig'
import Icon from '@/src/components/Icon'
import { useFonts } from 'expo-font'
import Header from '@/src/components/Header'

const SocialLoginButton = ({ label, icon }: { label: string; icon: any }) => {
  return (
    <TouchableOpacity style={styles.socialButton}>
      <View style={styles.socialButtonContent}>
        <Image source={icon} style={styles.socialIcon} resizeMode="contain" />
        <Text style={styles.socialButtonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  )
}

const Login = (): JSX.Element => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fontsLoaded] = useFonts({
    TiroTelugu: require('@/assets/fonts/TiroTelugu-Regular.ttf'),
  })

  const handlePress = (email: string, password: string): void => {
    setErrorMessage('')

    if (!email || !password) {
      setErrorMessage('※未入力の箇所があります')
      return
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user.uid)
        router.replace('/memo/list')
      })
      .catch((error) => {
        const { code, message } = error
        console.log(code, message)
        setErrorMessage(`ログインに失敗しました: ${message}`)
      })
  }

  const forgetLoginInfo = (): void => {
    router.push('/auth/forgetLoginInfo')
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header
          title="ログイン/新規登録"
          showBackButton={false}
          showCloseButton={true}
          onBack={() => router.back()}
          onClose={() => router.push('/')}
        />
        <View style={styles.headerDivider} />

        <Text style={styles.brand}>PLAN B</Text>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.registerButtonText}>新規でアカウント登録</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>ログイン</Text>

        <View style={styles.socialLoginContainer}>
          <SocialLoginButton
            label="LINE"
            icon={require('@/assets/socialAccount/LINE.png')}
          />
          <SocialLoginButton
            label="Apple"
            icon={require('@/assets/socialAccount/apple.png')}
          />
          <SocialLoginButton
            label="Google"
            icon={require('@/assets/socialAccount/Google.png')}
          />
          <SocialLoginButton
            label="Yahoo!"
            icon={require('@/assets/socialAccount/Yahoo.png')}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>メールアドレスでログイン</Text>

        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor="#707070"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        {/* エラーメッセージを赤文字で表示 */}
        {errorMessage !== '' && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="パスワード"
            placeholderTextColor="#707070"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Icon
              name={showPassword ? 'eye' : 'eye-blocked'}
              size={24}
              color="#707070"
            />
          </TouchableOpacity>
        </View>
        {/* エラーメッセージを赤文字で表示 */}
        {errorMessage !== '' && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => handlePress(email, password)}
        >
          <Text style={styles.loginButtonText}>ログイン</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={forgetLoginInfo}>
          <Text style={styles.forgotPassword}>
            メールアドレス、パスワードをお忘れの方はこちら
          </Text>
        </TouchableOpacity>

        <Text style={styles.agreementNote}>
          ※登録することで、
          <Link href={''} asChild replace>
            <TouchableOpacity>
              <Text style={styles.agreementLink}>利用規約</Text>
            </TouchableOpacity>
          </Link>
          、
          <Link href={''} asChild replace>
            <TouchableOpacity>
              <Text style={styles.agreementLink}>プライバシーポリシー</Text>
            </TouchableOpacity>
          </Link>
          、
          <Link href={''} asChild replace>
            <TouchableOpacity>
              <Text style={styles.agreementLink}>Cookieポリシー</Text>
            </TouchableOpacity>
          </Link>
          に同意するものとします。
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  //PlanBロゴ
  brand: {
    color: '#FFF',
    fontFamily: 'Tiro Telugu',
    fontSize: 33,
    fontWeight: '400',
    marginBottom: 19,
    marginTop: 18,
  },

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

  //ヘッダ
  headerDivider: {
    backgroundColor: '#A3A19E',
    height: 3,
    width: '100%',
  },

  //inputArea
input: {
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    height: 40,
    width: '85%',
    marginTop: 15,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom:2,
    borderColor: '#000',
    color: '#000',
  },

  
  
outerContainer: {
    backgroundColor: '#1A1A1A',
    flex: 1,
  },

  //アカウント登録ボタン
  registerButton: {
    backgroundColor: '#9B1B1B',
    alignItems: 'center',
    borderColor: '#000',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 24,
    paddingHorizontal: 40,
    paddingVertical: 10,
    width: '85%',
  },

  //ログインボタン
loginButton: {
    backgroundColor: '#D4AF37',
    width: '85%',
    borderRadius: 5,
    paddingHorizontal: 50,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },

  
  
registerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  //各エリアのタイトル
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 5,
    marginTop: 15,
  },

  // エラーメッセージ
errorMessage: {
    alignSelf: 'flex-start',
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: '7.5%',
  },

  
socialButton: {
    backgroundColor: '#000',
    borderColor: '#FFF',
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 8,
    paddingHorizontal: 3,
    paddingVertical: 5,
    position: 'relative',
    width: '45%',
  },

  socialButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  
  // プライバシーポリシー
agreementNote: {
    color: '#FFF',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    width: '85%',
  },

  
//Line,Google,Apple,Yahooでログイン
socialLoginContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 15,
    marginTop: 5,
    width: '85%',
  },

  socialButtonText: {
    color: '#FFF',
    fontSize: 19,
    textAlign: 'center',
  },

  agreementLink: {
    color: '#38B6FF',
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  //メールアドレス/パスワードを忘れた場合
forgotPassword: {
    color: '#38B6FF',
    fontSize: 13,
    marginBottom: 25,
    marginTop: 25,
  },

  
socialIcon: {
    height: 20,
    left: 0,
    position: 'absolute',
    width: 20,
  },

  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  passwordContainer: {
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    flexDirection: 'row',
    height: 40,
    borderWidth: 1,
    marginTop: 15,
    borderColor: '#000',
    width: '85%',
    marginBottom: 2,
    paddingHorizontal: 12,
  },

  passwordInput: {
    color: '#000',
    flex: 1,
  },
})

export default Login
