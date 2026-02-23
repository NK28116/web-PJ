//TODO:ユーザーネーム変更ページを作る
//TODO:削除予定

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { JSX } from 'react'

import { useState } from 'react'

import { SearchCheck } from 'lucide-react'

type FormData = {
  userName: string
}

type Props = {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
}

const ChangeUserName = ({ form, setForm }: Props): JSX.Element => {
  const [userName, setUserName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [userNameCondition, setUserNameCondition] = useState(false)

  const handlePress = (userName: string): void => {
    setErrorMessage('')
    if (!userName) {
      setErrorMessage('※ユーザーネームを入力してください')
      return
    }
    setUserNameCondition(true)
    console.log('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.signupLabel}>ユーザーネーム変更</Text>
      <Text style={styles.signupLabel}>
        PLAN B で使われるユーザーネームです ユーザーネームはいつでも変更できます
      </Text>

      <TextInput
        style={styles.input}
        placeholder="bxu153h6g3"
        placeholderTextColor="#707070"
        value={userName}
        onChangeText={(text) => {
          setUserName(text)
          setForm((prev) => ({ ...prev, userName: text }))
        }}
      />
      <SearchCheck />
      {errorMessage !== '' && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>
      )}

      <Text>※ユーザーネームは全ユーザーに公開されます</Text>
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => handlePress(userName)}
      >
        <Text style={styles.signupButtonText}>PlanBを始める</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(161,160,160,0.67)',
    flexGrow: 1,
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
    width: '85%',
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginVertical: 20,
  },
  signupButton: {
    backgroundColor: '#9B1B1B',
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
  signupLabel: {
    color: '#FFF',
  },
})

export default ChangeUserName
