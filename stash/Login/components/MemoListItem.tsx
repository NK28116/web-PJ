import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { JSX } from 'react'
import { Link } from 'expo-router'
import { deleteDoc, doc } from 'firebase/firestore'

import { auth, db } from '@/firebaseConfig'
import Icon from './Icon'
import { type Memo } from '@/types/memo'
interface Props {
  memo: Memo
}

const handlePress = (id: string): void => {
  if (auth.currentUser === null) {
    return
  }
  const ref = doc(db, `users/${auth.currentUser.uid}/memos`, id)
  Alert.alert('メモを削除します', 'よろしいでしょうか?', [
    { text: 'キャンセル' }, //左
    {
      onPress: () => {
        deleteDoc(ref).catch(() => {
          Alert.alert('削除に失敗しました')
        })
      },
      //右
      style: 'destructive',
      text: '削除する',
    },
  ])
}

const MemoListItem = (props: Props): JSX.Element | null => {
  const { memo } = props
  const { bodyText, updatedAt } = memo
  if (bodyText === null || updatedAt === null) {
    return null
  }
  const dataString = updatedAt.toDate().toLocaleString('ja-JP')
  return (
    <Link href={{ params: { id: memo.id }, pathname: '/memo/detail' }} asChild>
      <TouchableOpacity style={styles.memoListItems}>
        {/*左側*/}
        <View>
          <Text numberOfLines={1} style={styles.memoListTitle}>
            {bodyText}
          </Text>
          {/**/}
          <Text style={styles.memoListDate}>{dataString}</Text>
        </View>
        {/*右側*/}
        <TouchableOpacity onPress={() => handlePress(memo.id)}>
          <Icon name="delete" size={32} color="#B0B0B0" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Link>
  )
}

const styles = StyleSheet.create({
  memoListDate: {
    color: '#848484',
    fontSize: 12,
    lineHeight: 16,
  },
  memoListItems: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: 'rgba(0,0,0,0.15)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 19,
    paddingVertical: 16,
  },
  memoListTitle: {
    fontSize: 16,
    lineHeight: 32,
  },
})

export default MemoListItem
