import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useState, JSX } from 'react'
import BirthDayPicker from '../CustomWheelPicker/BirthDayPicker'
import Icon from '../Icon'
import AreaPicker from '../CustomWheelPicker/AreaPicker'

type FormData = {
  password: string
  nickName: string
  birthDay: string
  sex: string
  playArea: string
}

type Props = {
  form: FormData
  email: string
  setEmail: (email: string) => void
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  onNextStep: () => void
}

const AuthEmailUserInfo = ({
  form,
  setForm,
  email,
  setEmail,
  onNextStep,
}: Props): JSX.Element => {
  const [password, setPassword] = useState('')
  const [passwordReinput, setPasswordReinput] = useState('')
  const [nickname, setNickname] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [birthDay, setBirthDay] = useState<String>('2000-01-01')
  const [showPicker, setShowPicker] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [playArea, setPlayArea] = useState('')

  const sexOptions = [
    { label: '男性', value: '男性' },
    { label: '女性', value: '女性' },
    { label: 'その他', value: 'その他' },
  ]

  // パスワードバリデーション
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

  const handlePress = (): void => {
    setErrorMessage('')
    const pwError = validatePassword(password)
    if (pwError) {
      setErrorMessage(pwError)
      return
    }
    console.log('ユーザー情報入力完了')
    onNextStep() // ステップ4へ進む
  }

  const comparePassword = (pw: string): void => {
    if (password !== pw) {
      setErrorMessage('パスワードが一致しません')
    } else {
      setErrorMessage('')
    }
  }

  const SexChoiceButton = ({ label }: { label: string }) => {
    const isSelected = form.sex === label
    return (
      <TouchableOpacity
        style={[styles.sexChoiceButton, isSelected && styles.selectedButton]}
        onPress={() => setForm({ ...form, sex: label })}
      >
        <View style={styles.sexChoiceButtonContent}>
          <Text
            style={[
              styles.sexChoiceButtonText,
              isSelected && styles.selectedText,
            ]}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfoInputContainer}>
        {/*メールアドレス表示*/}
        <Text style={styles.signupLabel}>メールアドレス</Text>
        <Text style={styles.mailAddressBox}>{email}</Text>

        {/*パスワード作成*/}
        <Text style={styles.signupLabel}>
          パスワード(8文字以上)<Text style={styles.attention}>※必須</Text>
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

        <Text style={styles.passwordRequirement}>
          以下のうち2種類以上を含めてください：
          <br />
          ・半角小文字 &nbsp;&nbsp;・半角大文字 <br />
          ・数字(0-9)
        </Text>
        {/*「パスワード作成」で作成したパスワードと一致*/}
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

        {/*ニックネーム作成*/}
        <Text style={styles.signupLabel}>ニックネーム</Text>
        <TextInput
          value={nickname}
          placeholder="ニックネーム"
          onChangeText={(text) => {
            setNickname(text)
            setForm((prev) => ({ ...prev, nickName: text }))
          }}
          style={styles.input}
        />

        {/*生年月日ドロップダウン選択*/}
        <View style={styles.pickerContainer}>
          <BirthDayPicker
            birthDay={birthDay}
            onChange={(birthDay: string) => {
              setBirthDay(birthDay)
              setForm((prev) => ({ ...prev, birthDay: birthDay }))
            }}
          />
          {/*
          <Text>フォーム内の誕生日: {form.birthDay}</Text>
          */}
        </View>

        {/*性別3択選択*/}
        <Text style={styles.signupLabel}>性別</Text>
        <View style={styles.sexChoiceButtonContainer}>
          {sexOptions.map((option) => (
            <SexChoiceButton key={option.value} label={option.label} />
          ))}
        </View>

        {/*よく遊ぶエリアドロップダウン選択*/}
        <View style={styles.pickerContainer}>
          <AreaPicker
            area={playArea}
            onChange={(playArea: string) => {
              setPlayArea(playArea)
              setForm((prev) => ({ ...prev, playArea: playArea }))
            }}
          />
        </View>

        <Text style={styles.annotation}>
          ※ニックネームのみ全ユーザーに公開されます
        </Text>
        <Text style={styles.annotation}>
          ※より多くの情報をご入力いただくことで、
          PLANBからの提案を最大限にご利用いただけます
        </Text>

        {errorMessage !== '' && (
          <Text style={{ color: 'red' }}>{errorMessage}</Text>
        )}

        <TouchableOpacity onPress={handlePress} style={styles.signupButton}>
          <Text style={styles.signupConfirmLabel}>入力内容の確認へ進む</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  attention: {
    color: 'red',
    fontSize: 14,
  },
  container: {
    alignItems: 'center',
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
  mailAddressBox: {
    backgroundColor: '#444444',
    borderRadius: 5,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    height: 33,
    lineHeight: 17,
    marginBottom: 16,
    paddingLeft: 5,
    paddingVertical: 7,
    textAlignVertical: 'center',
    width: '85%',
  },
  passwordContainer: {
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    borderColor: '#000',
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    height: 40,
    marginBottom: 2,
    marginTop: 1,
    width: '85%',
  },
  passwordInput: {
    color: '#000',
    flex: 1,
    paddingHorizontal: 12,
  },
  passwordRequirement: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 20,
    marginTop: 11,
    textAlign: 'left',
    width: '85%',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '85%',
  },
  selectedButton: {
    backgroundColor: '#444444',
  },
  sexChoiceButton: {
    backgroundColor: '#AFAEAC',
    borderColor: '#000000',
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 27,
    paddingVertical: 10,
  },
  annotation: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'left',
    width: '85%',
  },

  userInfoInputContainer: {
    width: '90%',
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 10,
  },
  selectedText: {
    color: '#ffffff',
  },
  signupLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 16,
    marginBottom: 1,
    alignSelf: 'flex-start',
    marginLeft: '7.5%',
  },

  sexChoiceButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    alignContent: 'stretch',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  sexChoiceButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sexChoiceButtonText: {
    color: '#444444',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: '#9B1B1B',
    borderColor: '#000000',
    width: '85%',
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 50,
    alignSelf: 'center',
    paddingVertical: 10,
    marginTop: 16,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  signupConfirmLabel: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
  },
})

export default AuthEmailUserInfo
