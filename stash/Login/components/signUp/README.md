# DevDaily

L-3セクションの背景色が変わっている（#333333)部分に乗っける要素

- dividerがiOSで表示されない可能性がある

## 2025/06/16:

L3-1をコンポーネント化にすることに成功

next ->
L3-2をコンポーネント化

1. StepIndicatorの数字を2に変更
   1. SignNumberをnextStep()で増加するのでStepIndicatorでstepNumber＝2の時の表示にする
   2. signupWayContainerにメールアドレス認証入力を表示する
2. メールアドレス認証入力画面をsignupWayContainerに表示

```App.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

# 2025/06/17

## 作業内容

L3-2-1を乗っけた

### 改善点

stepIndicatorの表示を引数で管理

```tsx
const renderStepContent = (stepNumber: number) => {
  switch (stepNumber) {
    case 1:
      return <SignUpWay />
    case 2:
      return <AuthEmail />
    default:
      return null
  }
}
```

stepNumberで移動できるようにした

```tsx
const MailAddressSignupButton = () => {
  nextStep() // stepNumberを +1
  // 注意：すぐ下で stepNumber を使うと「前の値」が表示される
  setTimeout(() => {
    console.log('ステップ遷移後のstepNumber:', stepNumber + 1) // 表示確認用
  }, 0)
}
```

#### 学習したこと

- useContextを使って階層関係なく管理するには\_layout.tsxで

```
<"contextProvider">
<Stock>
</strock>
</"contexProvider">
```

挟む

- App.tsxは不具合になりうる

### 問題点

#### 作業方針がある

スタイルの修正

#### 作業方針がない

プロパティ抜き出してくるのめんどくさい
リリースまでやったことないから何が必要なのか分からない

### 次回の作業で行うこと

スタイルの修正
L3-2-2を作成

## 所感

適当に作ったコードをchatGPTにぶん投げて修正させるのが一番効率がいいかな

```header.tsx
import {View,Text,StyleSheet} from 'react-native'
import {JSX} from "react";

const Header = () :JSX.Element=> {
    return (
        <View style={styles.header}>
            <View style={styles.headerInner}>
                <Text style={styles.headerTitle}>Memo App</Text>
                <Text style={styles.headerRight}>ログアウト</Text>
            </View>
        </View>
    )
}

const styles=StyleSheet.create({
    header:{
        backgroundColor:'#467FD3',
        height:104,
        justifyContent:'flex-end'
    },
    headerInner:{
        alignItems:'center',
    },
    headerRight:{
        position: 'absolute',
        right:16,
        bottom:16,
        color:'rgba(255,255,255,0.7)'
    },
    headerTitle:{
        marginBottom:8,
        fontSize:22,
        lineHeight:32,
        fontWeight:'bold',
        color:'#fff'
    },
})

export default Header
```

# 2025/06/18

## 作業内容

ログイン画面を最後まで作った

### 改善点

インジケーターごと，ステップごとに作成

#### 学習したこと

checkboxのライブラリ
scrollViewの使い方

### 問題点

継承する部分がまだうまく作れていない

#### 作業方針がある

スタイルの修正

#### 作業方針がない

継承部分の受け渡し
webViewではスクロールしないけど，シュミレーター上のsafariだとスクロールされている
メンバー内リリース，検証環境の作成方法を考える

### 次回の作業で行うこと

layout内のヘッダを削除してヘッダコンポーネントを作成

## 所感

動く画面は完成した
少し余裕ができそう

# 2025/06/19

## 作業内容

スタイル，見た目の改善

### 改善点

- フォーカスした時にズームインしないように修正
- ヘッダを自作のコンポーネントに変換
- はみ出した時にスクロールできるように修正
- 最後まで値を渡せるように改善

#### 学習したこと

- safeAreaViewを使えばlayoutで消えた部分を誤魔化せる

### 問題点

- まだ禁止事項の設定をしていない
- 各ページごと，各コンポーネントごとのスタイルを修正していない
- セレクトボックスを作成していない

#### 作業方針がある

- 禁止事項の設定
- Input
  - メールアドレス形式でない
- Number
  - 強制半角数字1桁
  - 未入力
- UserInfo
  - Password
    - 半角英数字8文字未満
    - 未入力
    - 不一致
    - 禁止文字
  - NickName
    - 未入力
    - 禁止文字
  - 生年月日
    - 未選択
  - 性別
    - 未選択
- Confirm
  - checkbox
    - 未チェック
- Headerの動的設定
  - 各ページをステップナンバーで管理してるからそれに合わせて表示すれば良さそう

#### 作業方針がない

- 生年月日のセレクトボックスはライブラリかなんかないかな
  - 手作業で年月日作るのは面倒
- スタイルの変更は莉子ちゃん待ち
  - でもサイズや位置だから文字色やフォントはこっちで設定してもいいかも
- 時々入力する時に勝手にズームされるのは仕様？

### 次回の作業で行うこと

- 色系のスタイル作成
- 年月日選択のライブラリ探し

## 所感

結構見た目的にはできてきたのでは？
後これをポーとフォリオみたいにしたいけどどこまで隠せばいいんだろう
loginにマージするのはL3-5:ユーザーネーム変更まで作れたら（画面上の動きが完成したら）

# 2025/07/06

## 作業内容

- figma修正の認識合わせ
- userNme の表示

### 改善点

- FinishSignUp.tsx画面にuseNameが表示された

#### 学習したこと

- setUserNameの渡し方

### 問題点

- バリデーションとかスタイルの修正とかはまだ
- 認証番号とかのメソッドも考えてない

#### 作業方針がある

- スタイルの修正
- バリデーションの追加

#### 作業方針がない

- メール認証のやり方

### 次回の作業で行うこと

- スタイルの相対表示とかを考える
- バリデーションのバターン作成
- マージして統合

## 所感

一番の難関を通過したと思う

---
