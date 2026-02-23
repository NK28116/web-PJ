import { StepContext } from '@/src/components/signUp/StepProvider'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { JSX, use } from 'react'
import { Link } from 'expo-router'

const SignUpWay = (): JSX.Element => {
  const { stepNumber, nextStep } = use(StepContext)
  const MailAddressSignupButton = () => {
    nextStep() // stepNumberを +1
    // 注意：すぐ下で stepNumber を使うと「前の値」が表示される
    setTimeout(() => {
      console.log('ステップ遷移後のstepNumber:', stepNumber + 1) // 表示確認用
    }, 0)
  }
  const SocialSignupButton = ({
    label,
    icon,
  }: {
    label: string
    icon: any
  }) => {
    return (
      <TouchableOpacity style={styles.socialButton}>
        <View style={styles.socialButtonContent}>
          <Image source={icon} style={styles.socialIcon} resizeMode="contain" />
          <Text style={styles.socialButtonText}>{label}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.socialSignupContainer}>
          <Text style={styles.socialSignupText}>外部アカウントで新規登録</Text>
          <SocialSignupButton
            label="LINE"
            icon={require('@/assets/socialAccount/LINE.png')}
          />
          <SocialSignupButton
            label="Apple"
            icon={require('@/assets/socialAccount/apple.png')}
          />
          <SocialSignupButton
            label="Google"
            icon={require('@/assets/socialAccount/Google.png')}
          />
          <SocialSignupButton
            label="Yahoo!"
            icon={require('@/assets/socialAccount/Yahoo.png')}
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.signupButton}
          onPress={MailAddressSignupButton}
        >
          <Text style={styles.signupButtonText}>メールアドレスで新規登録</Text>
        </TouchableOpacity>

        <Link href={'auth/login'} asChild replace>
          <TouchableOpacity>
            <Text style={styles.alreadyMember}>
              すでにアカウントをお持ちの方はこちら
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  alreadyMember: {
    alignSelf: 'center',
    color: '#38B6FF',
    fontSize: 13,
    marginBottom: 25,
    marginTop: 25,
    textDecorationLine: 'underline',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    //backgroundColor: '#a41a1a',
    paddingVertical: 4,
  },
  divider: {
    alignSelf: 'center',
    backgroundColor: '#A3A19E',
    height: 2,
    marginVertical: 16,
    width: '85%',
  },
  signupButton: {
    backgroundColor: '#100F0D',
    alignSelf: 'center',
    borderColor: '#F2F2F2',
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 50,
    paddingVertical: 10,
    width: '85%',
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  socialButton: {
    backgroundColor: '#1F1F1F',
    borderColor: '#FFF',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    marginVertical: 5,
    paddingHorizontal: 16,
    paddingVertical: 4,
    position: 'relative',
    width: '40%',
  },

  socialButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  socialButtonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  socialIcon: {
    height: 20,
    left: -13,
    position: 'absolute',
    width: 20,
  },
  socialSignupContainer: {
    alignItems: 'stretch',
    backgroundColor:"transparent",
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginTop: 24,
    width: '100%',
  },
  socialSignupText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 40,
  },
})

export default SignUpWay
