import { View, Text, StyleSheet } from 'react-native'
import { JSX, useState, use } from 'react'

import { useFonts } from 'expo-font'
import StepIndicator from '@/src/components/signUp/StepIndicator'
import SignUpWay from '@/src/components/signUp/SignUpWay'
import { StepContext } from '@/src/components/signUp/StepProvider'
import AuthEmail from '@/src/components/signUp/AuthEmail'
import FinishSingUp from '@/src/components/signUp/FinishSingUp'
import Header from '@/src/components/Header'
import { router } from 'expo-router'
import Unreceive from '@/src/components/signUp/Unreceive'

const SignUp = (): JSX.Element => {
  // const { stepNumber } = useContext(StepContext)
  const { stepNumber } = use(StepContext)
  const [step, setStep] = useState(1)
  const [fontsLoaded] = useFonts({
    TiroTelugu: require('@/assets/fonts/TiroTelugu-Regular.ttf'),
  })
  const [userName, setUserName] = useState('')

  const renderStepContent = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <SignUpWay />
      case 2:
        return (
          <AuthEmail step={step} setStep={setStep} setUserName={setUserName} />
        )
      case 3:
        return <FinishSingUp userName={userName} />
      default:
        return <SignUpWay />
    }
  }

  return (
    <View style={styles.container}>
      <Header
        title="新規アカウント登録"
        showBackButton={true}
        showCloseButton={true}
        onBack={() => router.back()}
        onClose={() => router.push('/')}
      />
      <View style={styles.headerDivider} />
      <Text style={styles.brand}>PLAN B</Text>
      {/* ステップ表示 */}
      <StepIndicator step={stepNumber} />
      {/* ステップに応じたコンテンツの表示 */}
      <View style={styles.signupWayContainer}>
        {renderStepContent(stepNumber)}
      </View>
      {/*stepNumber===2かつstep===2の時のみ <Unreceive />を表示したい*/}
      {stepNumber === 2 && step === 2 && <Unreceive />}
    </View>
  )
}

const styles = StyleSheet.create({
  brand: {
    color: '#FFF',
    fontFamily: 'Tiro Telugu',
    fontSize: 32,
    marginBottom: 5,
    marginTop: 4,
  },
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#1A1A1A',
    flexGrow: 1,
    paddingVertical: 4,
    width: '100%',
  },
  divider: {
    backgroundColor: '#FFFFFF',
    height: 2,
    width: '100%',
  },
  headerDivider: {
    backgroundColor: '#A3A19E',
    height: 2,
    marginVertical: 16,
    width: '100%',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginVertical: 20,
  },
  signupLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 13,
  },
  signupWayContainer: {
    backgroundColor: '#333333',
    justifyContent: 'flex-end',
    width: '95%',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 40,
  },
})

export default SignUp
