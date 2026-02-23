import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { JSX, use } from 'react'
import { Link } from 'expo-router'
import Checkbox from 'expo-checkbox'

import { useState } from 'react'
import { StepContext } from '@/src/components/signUp/StepProvider'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/firebaseConfig'
import Icon from '../Icon'

type Props = {
  email: string
  setEmail: (email: string) => void
  password: string
  setUserName: (name: string) => void
  nickName: string
  birthDay: string
  sex: string
  playArea: string
  onPrevStep: () => void
  onSubmit: () => void
}

const AuthEmailInfoConfirm = ({
  email,
  setEmail,
  password,
  setUserName,
  nickName,
  birthDay,
  sex,
  playArea,
  onPrevStep,
  onSubmit,
}: Props): JSX.Element => {
  const [isSelected, setSelection] = useState(false)
  const [isChecked, setChecked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { stepNumber, nextStep } = use(StepContext)
  //(メールアドレス,パスワード)の組み合わせをFirebaseに登録
  const MakeUserAccount = async (
    email: string,
    password: string
  ): Promise<string> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const uid = userCredential.user.uid
      console.log('ユーザー作成成功:', uid)
      return uid
    } catch (error: any) {
      console.log(error.code, error.message)
      Alert.alert(error.message)
      throw error
    }
  }
  //nickName,birthDay,sex,playAreaをFirebaseに登録
  const RegisterUserInfo = async (
    uid: string,
    userString: string,
    nickName: string,
    birthDay: string,
    sex: string,
    playArea: string
  ): Promise<void> => {
    const ref = collection(db, `users/${uid}/Info`)
    try {
      const docRef = await addDoc(ref, {
        birthDay,
        nickName,
        playArea,
        sex,
        updatedAt: Timestamp.fromDate(new Date()),
        userString,
      })
      console.log('ユーザー情報登録成功:', docRef.id)
    } catch (error) {
      console.log('ユーザー情報登録失敗:', error)
      throw error
    }
  }
  const ConfirmButton = async () => {
    try {
      const uid = await MakeUserAccount(email, password)
      const userString = uid.slice(0, 10).toLowerCase()
      const finalUserName =
        nickName.trim() !== '' ? nickName.trim() : userString
      await RegisterUserInfo(uid, userString, nickName, birthDay, sex, playArea)

      console.log('userString:', userString)
      console.log('nickName:', nickName)
      console.log('birthDay:', birthDay)
      console.log('sex:', sex)
      console.log('playArea:', playArea)
      console.log('最終ユーザー名:', finalUserName)

      setUserName(finalUserName)
      nextStep()
    } catch (error) {
      console.error('登録処理でエラーが発生:', error)
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.userInputInfo}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>メールアドレス</Text>
        </View>
        <Text style={styles.sectionTitle}>{email}</Text>

        <View style={styles.dottedLine} />

        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>パスワード</Text>
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Icon
              name={showPassword ? 'eye' : 'eye-blocked'}
              size={16}
              color="#707070"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>
          {showPassword ? password : '●'.repeat(password.length)}
        </Text>

        <View style={styles.dottedLine} />

        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>ニックネーム</Text>
        </View>
        <Text style={styles.sectionTitle}>{nickName}</Text>

        <View style={styles.dottedLine} />

        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>生年月日</Text>
        </View>
        <Text style={styles.sectionTitle}>{birthDay}</Text>

        <View style={styles.dottedLine} />

        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>性別</Text>
        </View>
        <Text style={styles.sectionTitle}>{sex}</Text>

        <View style={styles.dottedLine} />

        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>よく遊ぶエリア</Text>
        </View>
        <Text style={styles.sectionTitle}>{playArea}</Text>
        <View style={styles.dottedLine} />
      </View>

      <Text style={styles.warningText}>※ニックネームのみ公開されます</Text>

      <Text style={styles.warningText}>※生年月日は変更できません</Text>

      <View style={styles.checkboxContainer}>
        <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
          color={'#000000'}
        />
        <Text style={styles.agreementNote}>
          ※登録することで、
          <Link href="">
            <Text style={styles.agreementLink}>利用規約</Text>
          </Link>
          、
          <Link href="">
            <Text style={styles.agreementLink}>プライバシーポリシー</Text>
          </Link>
          、
          <Link href="">
            <Text style={styles.agreementLink}>Cookieポリシー</Text>
          </Link>
          に同意します。
        </Text>
      </View>

      <TouchableOpacity style={styles.fixInfoButton} onPress={onPrevStep}>
        <Text style={styles.signupButtonText}>入力内容の修正</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.signupButton,
          { backgroundColor: isSelected ? '#9B1B1B' : '#555' },
        ]}
        onPress={ConfirmButton}
      >
        <Text style={styles.signupButtonText}>登録</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  checkboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 16,
    width: '85%',
    marginBottom: 4,
  },
  container: {
    alignItems: 'center',
    flexGrow: 1,
    paddingVertical: 24,
  },
  agreementNote: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderColor: '#888',
    borderStyle: 'dashed',
    marginBottom: 6,
    alignSelf: 'center',
    width: '85%',
    marginTop: 6,
  },
  agreementLink: {
    color: '#38B6FF',
    textDecorationLine: 'underline',
  },
  fixInfoButton: {
    backgroundColor: '#000000',
    borderRadius: 5,
    width: '85%',
    marginTop: 20,
    borderColor: '#FFFFFF',
    paddingVertical: 12,
    borderWidth: 1,
  },
  checkbox: {
    height: 20,
    marginRight: 8,
    borderColor: '#FFF',
    width: 20,
    borderRadius: 3,
    borderWidth: 1,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: '7.5%',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    alignSelf: 'flex-end',
    fontWeight: '400',
    marginRight: '7.5%',
    textAlign: 'left',
    marginTop: 2,
  },
  signupButton: {
    backgroundColor: '#AAAAAA',
    borderRadius: 5,
    marginTop: 20,
    paddingVertical: 12,
    width: '85%',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  userInputInfo: {
    backgroundColor: '#000000',
    marginBottom: 20,
    width: '85%',
  },
  warningText: {
    color: '#FF4D4D',
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: '7.5%',
    marginTop: 4,
  },
})
export default AuthEmailInfoConfirm
