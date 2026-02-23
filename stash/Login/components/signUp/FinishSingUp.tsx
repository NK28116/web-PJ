import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { JSX } from 'react'
import { router } from 'expo-router'

import { useState } from 'react'

import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import ChangeUserName from '@/src/components/signUp/ChangeUserName'

type FormData = {
  userName: string
}
type Props = {
  userName: string
}

const FinishSingUp = ({ userName }: Props): JSX.Element => {
  const [showChangeUserName, setShowChangeUserName] = useState(false)
  const [form, setForm] = useState<FormData>({ userName })

  return (
    <View style={styles.container}>
      {showChangeUserName ? (
        <ChangeUserName form={form} setForm={setForm} />
      ) : (
        <>
          <FontAwesome5 name="check-circle" size={64} color="green" />

          <Text style={styles.signupLabel}>アカウント登録が完了しました</Text>

          <Text style={styles.signupLabel}>@{userName}</Text>

          <Text style={styles.signupLabel}>PLAN B へようこそ！</Text>

          {/*TODO: ユーザーネーム変更リンクを作成*/}
          <TouchableOpacity
            onPress={() =>
              router.push({
                params: { userName: form.userName },
                pathname: '/auth/changeUserName',
              })
            }
          >
            <Text style={styles.agreementLink}>ユーザーネームを変更</Text>
          </TouchableOpacity>

          <Text style={styles.agreementNote}>
            プロダクトの概要/魅力 xxxxxxxxxxxxxxxxができます。
            今すぐxxxxxxxxxxxxxをしてみよう！
          </Text>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.replace('/memo/list')}
          >
            <Text style={styles.signupButtonText}>PlanBを始める</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  agreementLink: {
    color: '#38B6FF',
    fontSize: 13,
    textAlign: 'center',
  },

  agreementNote: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    width: '85%',
  },
  container: {
    alignItems: 'center',
    flexGrow: 1,
    marginVertical: 24,
    paddingVertical: 4,
  },
  signupButton: {
    backgroundColor: '#D4AF37',
    borderColor: '#000000',
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 50,
    paddingVertical: 5,
    width: '85%',
  },
  signupButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  signupLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '400',
    marginVertical: 13,
  },
})

export default FinishSingUp
