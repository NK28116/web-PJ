import { View, Text, StyleSheet } from 'react-native'
import { JSX } from 'react'
const Unreceive = (): JSX.Element => {
  return (
    <View style={styles.UnreceivedArea}>
      <Text style={[styles.UnreceivedTitle]}>
        {/* UnreceivedTitle*/}
        メールが届かない場合は？
      </Text>
      <Text style={[styles.UnreceivedCutomor]}>
        {/* UnreceivedCutomor*/}
        ・docomo、au、SoftBankのメールアドレスをご利用の方
      </Text>
      <Text style={[styles.UnreceivedSolution]}>
        &nbsp;&nbsp;メール設定でPLANBからの受信が許可されているかご確認ください。
        {/* UnreceivedCutomor*/}
      </Text>
      <Text style={[styles.UnreceivedCutomor]}>
        ・docomoのメールアドレスをご利用の方でWi-Fi(無線)接続をされている方
      </Text>
      <Text style={[styles.UnreceivedSolution]}>
        「設定」→「無線とネットワーク」→「Wi-Fi」のチェックを外してから、
        再度「送信する」ボタンを押してください。
        {/* UnreceivedCutomor*/}
      </Text>
      <Text style={[styles.UnreceivedCutomor]}>
        ・GmailやiCloudの無料メールアドレスをご利用の方
      </Text>
      <Text style={[styles.UnreceivedSolution]}>
        &nbsp;&nbsp;迷惑メールに届いている場合がございます。
        メールを受信トレイに移してからご利用ください。
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  UnreceivedArea: {
    alignSelf: 'center',
    backgroundColor: '#605E5E',
    margin: 16,
    padding: 16,
    width: '95%',
  },
  UnreceivedCutomor: {
    color: '#fff',

    fontSize: 12,

    fontWeight: 'bold',
    //backgroundColor: '#96f69bff',
    marginTop: 8,
  },
  UnreceivedSolution: {
    color: '#fff',
    //backgroundColor: '#e98cb8ff',
    fontSize: 12,
  },
  UnreceivedTitle: {
    color: '#fff',
    //backgroundColor:'#e87777ff',
    fontSize: 15,
    fontWeight: 'bold',
  },
})

export default Unreceive
