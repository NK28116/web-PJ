import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { JSX } from 'react'
import { useState } from 'react'
import AuthEmailInput from '@/src/components/signUp/AuthEmailInput'
import AuthEmailNumber from '@/src/components/signUp/AuthEmailNumber'
import AuthEmailInfoConfirm from '@/src/components/signUp/AuthEmailInfoConfirm'
import AuthEmailUserInfo from '@/src/components/signUp/AuthEmailUserInfo'

type Props = {
  step: number
  setStep: (step: number) => void
  setUserName: (name: string) => void
}

const AuthEmail = ({ step, setStep, setUserName }: Props): JSX.Element => {
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({
    birthDay: '',
    nickName: '',
    password: '',
    favoriteArea: '',
    sex: '',
  })

  const handleSignUp = async () => {
    try {
      // Firebase登録処理など
      console.log('登録情報:', form)
      // await createUserWithEmailAndPassword(auth, form.email, form.password);
      // router.push('/signup/success');
    } catch (error) {
      console.error('登録失敗:', error)
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {(step === 1 || step === 2) && (
          <Text style={styles.sectionTitle}>メールアドレス認証</Text>
        )}

        {step === 1 && (
          <AuthEmailInput
            email={email}
            setEmail={setEmail}
            onNextStep={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <AuthEmailNumber
            email={email}
            setEmail={setEmail}
            onNextStep={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <AuthEmailUserInfo
            email={email}
            setEmail={setEmail}
            form={form}
            setForm={setForm}
            onNextStep={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <AuthEmailInfoConfirm
            email={email}
            setEmail={setEmail}
            password={form.password}
            nickName={form.nickName}
            birthDay={form.birthDay}
            sex={form.sex}
            favoriteArea={form.favoriteArea}
            onPrevStep={() => setStep(3)}
            onSubmit={handleSignUp}
            setUserName={setUserName}
          />
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    paddingVertical: 4,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    marginVertical: 23,
  },
})

export default AuthEmail
