import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { JSX, useState } from 'react'

type Props = {
  email: string
  setEmail: (email: string) => void
  onNextStep: () => void
}

const AuthEmailInput = ({
  email,
  setEmail,
  onNextStep,
}: Props): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState('')

  const handlePress = (): void => {
    setErrorMessage('')
    if (!email) {
      setErrorMessage('※未入力の箇所があります')
      return
    }

    console.log('認証メールを送信')
    onNextStep() // ステップ2へ進む
  }

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>メールアドレス</Text>
      <TextInput
        style={styles.input}
        //placeholder="example@example.com"
        //placeholderTextColor="#707070"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      {errorMessage !== '' && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>
      )}
      <TouchableOpacity style={styles.signupButton} onPress={handlePress}>
        <Text style={styles.signupButtonText}>認証メールを送信</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 20,
    paddingHorizontal: '7.5%',

    paddingTop: 10,
    //backgroundColor:'#eaffb4ff',
    width: '100%',
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderColor: '#000',
    borderRadius: 5,
    borderWidth: 1,
    color: '#000',
    height: 33,
    marginVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
  },
  inputLabel: {
    alignItems: 'flex-start',
    //backgroundColor:'#eaffb4ff',
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    width: '100%',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginVertical: 20,
  },
  signupButton: {
    backgroundColor: '#9B1B1B',
    borderColor: '#000000',
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 16,
    paddingVertical: 3,
    width: '100%',
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
})

export default AuthEmailInput
