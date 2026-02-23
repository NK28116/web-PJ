import { StepIndicator } from '@/atoms/StepIndicator';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { MdCheckCircleOutline } from 'react-icons/md';

const MOCK_AUTH_CODE = ['1', '2', '3', '4', '5', '6'];
const INDUSTRY_OPTIONS = ['飲食', '美容', 'その他'] as const;
type Industry = typeof INDUSTRY_OPTIONS[number] | '';

export const SignUpTemplate: React.FC = () => {
  // 外部ステップ: 1=登録方法選択 / 2=アカウント情報入力 / 3=登録完了
  const [step, setStep] = useState(1);
  // ステップ2のサブステップ: 1=メール入力 / 2=認証コード / 3=ユーザー情報
  const [subStep, setSubStep] = useState(1);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [industry, setIndustry] = useState<Industry>('');
  const [shopName, setShopName] = useState('');
  const [agree, setAgree] = useState(false);
  const [wyzeId, setWyzeId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const router = useRouter();

  const validatePassword = (pw: string): string => {
    if (!pw) return '※パスワードを入力してください';
    if (pw.length < 8) return 'パスワードは8文字以上で入力してください';
    let types = 0;
    if (/[a-z]/.test(pw)) types++;
    if (/[A-Z]/.test(pw)) types++;
    if (/[0-9]/.test(pw)) types++;
    if (types < 2)
      return 'パスワードは半角小文字・半角大文字・数字のうち2種類以上を含めてください';
    return '';
  };

  const handleEmailSubmit = () => {
    setErrorMessage('');
    if (!email) {
      setErrorMessage('※メールアドレスを入力してください');
      return;
    }
    setSubStep(2);
  };

  const handleCodeVerify = () => {
    setErrorMessage('');
    if (code.some((c) => !c)) {
      setErrorMessage('※6桁の認証コードを入力してください');
      return;
    }
    if (code.join('') !== MOCK_AUTH_CODE.join('')) {
      setErrorMessage('認証コードが正しくありません');
      return;
    }
    setSubStep(3);
  };

  const handleUserInfoSubmit = () => {
    setErrorMessage('');
    if (!nickname) {
      setErrorMessage('※ニックネームを入力してください');
      return;
    }
    const pwError = validatePassword(password);
    if (pwError) {
      setErrorMessage(pwError);
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('パスワードが一致しません');
      return;
    }
    if (!shopName) {
      setErrorMessage('※店舗名を入力してください');
      return;
    }
    if (!agree) {
      setErrorMessage('利用規約・プライバシーポリシー・cookieポリシーに同意してください');
      return;
    }
    // ユニークなuuidを付与
    setWyzeId(`wyze_${Date.now().toString(36)}`);
    setStep(3);
  };

  const handleClear = () => {
    setNickname('');
    setPassword('');
    setPasswordConfirm('');
    setBirthDate('');
    setIndustry('');
    setShopName('');
    setAgree(false);
    setErrorMessage('');
  };

  const handleFinish = () => {
    register(email, wyzeId);
    router.replace('/home');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            onNext={() => { setErrorMessage(''); setStep(2); setSubStep(1); }}
            onLoginRedirect={() => router.push('/')}
          />
        );
      case 2:
        switch (subStep) {
          case 1:
            return (
              <SubStep2_1
                email={email}
                setEmail={setEmail}
                errorMessage={errorMessage}
                onSubmit={handleEmailSubmit}
              />
            );
          case 2:
            return (
              <SubStep2_2
                email={email}
                code={code}
                setCode={setCode}
                errorMessage={errorMessage}
                onVerify={handleCodeVerify}
                onResend={() => {}}
                onResetEmail={() => { setErrorMessage(''); setSubStep(1); }}
              />
            );
          case 3:
            return (
              <SubStep2_3
                email={email}
                nickname={nickname}
                setNickname={setNickname}
                password={password}
                setPassword={setPassword}
                passwordConfirm={passwordConfirm}
                setPasswordConfirm={setPasswordConfirm}
                birthDate={birthDate}
                setBirthDate={setBirthDate}
                industry={industry}
                setIndustry={setIndustry}
                shopName={shopName}
                setShopName={setShopName}
                agree={agree}
                setAgree={setAgree}
                errorMessage={errorMessage}
                onClear={handleClear}
                onSubmit={handleUserInfoSubmit}
              />
            );
          default:
            return null;
        }
      case 3:
        return <Step3 wyzeId={wyzeId} onStart={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#B9EAE5] flex flex-col items-center max-w-[393px] mx-auto">
      {/* ブランドロゴ */}
      <p
        className="text-[#00A48D] text-[32px] font-normal mt-4 mb-[5px]"
        style={{ fontFamily: "'Kdam Thmor Pro', serif" }}
      >
        Wyze
      </p>

      {/* ステップインジケーター (3ステップ) */}
      <StepIndicator step={step} />

      {/* ステップコンテンツ */}
      <div className="w-[95%] bg-[#00A48D] mt-2 rounded-[5px]">{renderStep()}</div>
    </div>
  );
};

/* ──────────────────────────── Step1: 登録方法選択 ──────────────────────────── */
interface Step1Props {
  onNext: () => void;
  onLoginRedirect: () => void;
}

const Step1: React.FC<Step1Props> = ({ onNext, onLoginRedirect }) => (
  <div className="flex flex-col items-center py-6">
    <div className="w-[85%] h-[2px] bg-[#A3A19E] my-4" />
    <button
      onClick={onNext}
      className="w-[85%] bg-[#100F0D] text-white border border-[#F2F2F2] rounded-[5px] py-[10px] text-base font-bold text-center mt-4"
    >
      メールアドレスで新規登録
    </button>
    <button
      onClick={onLoginRedirect}
      className="text-[#38B6FF] text-[13px] underline mt-6 mb-4"
    >
      すでにアカウントをお持ちの方はこちら
    </button>
  </div>
);

/* ──────────────────────────── SubStep2-1: メールアドレス入力 ──────────────────────────── */
interface SubStep2_1Props {
  email: string;
  setEmail: (v: string) => void;
  errorMessage: string;
  onSubmit: () => void;
}

const SubStep2_1: React.FC<SubStep2_1Props> = ({ email, setEmail, errorMessage, onSubmit }) => {
  const handleFillEmailNormal = () => setEmail('test@example.com');
  const handleFillEmailAbnormal = () => setEmail('invalid-email');

  return (
    <div className="flex flex-col items-center py-6 px-4">
      {/* DEV_ONLY: 開発用ボタン */}
      <button
        onClick={handleFillEmailNormal}
        className="text-yellow-300 text-[11px] underline mt-1 mb-1 border border-yellow-300 rounded px-2 py-1"
      >
        正常系メール入力（開発用）
      </button>
      <button
        onClick={handleFillEmailAbnormal}
        className="text-yellow-300 text-[11px] underline mt-1 mb-1 border border-yellow-300 rounded px-2 py-1"
      >
        異常系メール入力（開発用）
      </button>

      <p className="text-white text-sm font-normal w-full mb-1">メールアドレス</p>
      <input
        type="email"
        placeholder="example@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoCapitalize="none"
        className="w-full h-10 bg-[#D9D9D9] border border-black rounded-[5px] px-3 mb-1 text-black placeholder-[#707070]"
      />
      {errorMessage && (
        <p className="w-full text-red-400 text-[13px] mb-2">{errorMessage}</p>
      )}
      <button
        onClick={onSubmit}
        className="w-full bg-[#FFF767] text-[#00A48D] text-base font-bold py-[10px] rounded-[5px] mt-4"
      >
        認証メールを送信
      </button>
    </div>
  );
};

/* ──────────────────────────── SubStep2-2: 認証コード入力 ──────────────────────────── */
interface SubStep2_2Props {
  email: string;
  code: string[];
  setCode: (c: string[]) => void;
  errorMessage: string;
  onVerify: () => void;
  onResend: () => void;
  onResetEmail: () => void;
}

const SubStep2_2: React.FC<SubStep2_2Props> = ({
  email,
  code,
  setCode,
  errorMessage,
  onVerify,
  onResend,
  onResetEmail,
}) => {
  const [showResendNotification, setShowResendNotification] = useState(false);
  const [showVerifyNotification, setShowVerifyNotification] = useState(false);

  const handleCodeChange = (index: number, value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = num.slice(-1);
    setCode(newCode);
  };

  // DEV_ONLY: モックコードを自動入力するボタン
  const handleFillMockCode = () => {
    setCode([...MOCK_AUTH_CODE]);
  };
  const handleFillMockCodeAbnormal = () => {
    setCode(['0', '0', '0', '0', '0', '0']);
  };

  const handleResend = () => {
    onResend();
    setShowResendNotification(true);
    setTimeout(() => setShowResendNotification(false), 2000);
  };

  // 認証コードが全て入力済みの場合、1秒間成功通知を表示してから遷移
  const handleVerify = () => {
    if (code.every((c) => c !== '')) {
      setShowVerifyNotification(true);
      setTimeout(() => {
        setShowVerifyNotification(false);
        onVerify();
      }, 1000);
    } else {
      onVerify();
    }
  };

  return (
    <div className="flex flex-col items-center py-6 px-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-400 text-xl">✓</span>
        <p className="text-white text-sm">以下のメールアドレスに送信しました</p>
      </div>
      <p className="text-white text-sm font-normal mb-3">{email}</p>
      <p className="text-white text-sm text-center mb-4">
        メールに記載された6桁の認証コードを入力してください
      </p>

      <div className="flex gap-2 justify-center my-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code[i]}
            onChange={(e) => handleCodeChange(i, e.target.value)}
            className="w-9 h-12 bg-[#D9D9D9] border border-black rounded text-center text-xl font-bold text-black"
          />
        ))}
      </div>

      {errorMessage && (
        <p className="text-red-400 text-[13px] mt-1">{errorMessage}</p>
      )}

      {/* DEV_ONLY: 開発用モックコード取得ボタン */}
      <button
        onClick={handleFillMockCode}
        className="text-yellow-300 text-[11px] underline mt-3 mb-1 border border-yellow-300 rounded px-2 py-1"
      >
        認証コードを取得（開発用）
      </button>
      <button
        onClick={handleFillMockCodeAbnormal}
        className="text-yellow-300 text-[11px] underline mt-1 mb-1 border border-yellow-300 rounded px-2 py-1"
      >
        異常系コード入力（開発用）
      </button>

      <button
        onClick={handleResend}
        className="text-[#38B6FF] text-[13px] underline mt-2 mb-1"
      >
        認証メールを再送信
      </button>

      {/* 再送信通知 */}
      {showResendNotification && (
        <div className="flex items-center gap-1 bg-white/20 rounded px-3 py-1 mt-1">
          <span className="text-green-400 text-sm">
            <MdCheckCircleOutline />
          </span>
          <span className="text-white text-[12px]">再送信しました</span>
        </div>
      )}

      <button
        onClick={handleVerify}
        className="w-full bg-[#FFF767] text-[#00A48D] text-base font-bold py-[10px] rounded-[5px] mt-3"
      >
        認証
      </button>

      {/* 認証成功通知 */}
      {showVerifyNotification && (
        <div className="flex items-center gap-1 bg-[#474747] rounded px-3 py-1 mt-1">
          <span className="text-green-400 text-sm">
            <MdCheckCircleOutline />
          </span>
          <span className="text-white text-[12px]">認証が成功しました</span>
        </div>
      )}

      <button
        onClick={onResetEmail}
        className="text-[#38B6FF] text-[13px] underline mt-4 mb-2"
      >
        メールアドレスを再設定
      </button>

      {/* メールが届かない場合のガイド */}
      <div className="w-full mt-4 border-t border-white/30 pt-3">
        <p className="text-white text-[12px] font-bold mb-2">メールが届かない場合は？</p>
        <p className="text-white text-[11px] mb-1">
          ・docomo、au、SoftBankのメールアドレスをご利用の方
        </p>
        <p className="text-white/80 text-[11px] mb-2 pl-2">
          メール設定でPLANBからの受信が許可されているかご確認ください。
        </p>
        <p className="text-white text-[11px] mb-1">
          ・docomoのメールアドレスをご利用の方でWi-Fi(無線)接続をされている方
        </p>
        <p className="text-white/80 text-[11px] mb-2 pl-2">
          「設定」→「無線とネットワーク」→「Wi-Fi」のチェックを外してから、再度「送信する」ボタンを押してください。
        </p>
        <p className="text-white text-[11px] mb-1">
          ・GmailやiCloudの無料メールアドレスをご利用の方
        </p>
        <p className="text-white/80 text-[11px] mb-1 pl-2">
          迷惑メールに届いている場合がございます。メールを受信トレイに移してからご利用ください。
        </p>
      </div>
    </div>
  );
};

/* ──────────────────────────── SubStep2-3: ユーザー情報入力 ──────────────────────────── */
interface SubStep2_3Props {
  email: string;
  nickname: string;
  setNickname: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (v: string) => void;
  birthDate: string;
  setBirthDate: (v: string) => void;
  industry: Industry;
  setIndustry: (v: Industry) => void;
  shopName: string;
  setShopName: (v: string) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  errorMessage: string;
  onClear: () => void;
  onSubmit: () => void;
}

const SubStep2_3: React.FC<SubStep2_3Props> = ({
  email,
  nickname, setNickname,
  password, setPassword,
  passwordConfirm, setPasswordConfirm,
  birthDate, setBirthDate,
  industry, setIndustry,
  shopName, setShopName,
  agree, setAgree,
  errorMessage, onClear, onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // DEV_ONLY: 正常系テストデータを入力
  const handleFillUserInfoNormal = () => {
    setNickname('テストユーザー');
    setPassword('Password1');
    setPasswordConfirm('Password1');
    setBirthDate('1990-01-01');
    setIndustry('飲食');
    setShopName('テスト店舗');
    setAgree(true);
  };

  // DEV_ONLY: 異常系テストデータを入力（バリデーションエラー確認用）
  const handleFillUserInfoAbnormal = () => {
    setNickname('');
    setPassword('weak');
    setPasswordConfirm('mismatch');
    setBirthDate('');
    setIndustry('');
    setShopName('');
    setAgree(false);
  };

  return (
    <div className="flex flex-col items-center py-6 px-4">

            {/* DEV_ONLY: 開発用ボタン */}
      <button
        onClick={handleFillUserInfoNormal}
        className="text-yellow-300 text-[11px] underline mt-3 mb-1 border border-yellow-300 rounded px-2 py-1"
      >
         正常系ユーザー情報を入力（開発用）
      </button>
      
            {/* DEV_ONLY: 開発用ボタン */}
      <button
        onClick={handleFillUserInfoAbnormal}
        className="text-yellow-300 text-[11px] underline mt-3 mb-1 border border-yellow-300 rounded px-2 py-1"
      >
        異常系ユーザー情報を取得（開発用）
      </button>


      {/* メールアドレス（表示のみ） */}
      <p className="text-white text-sm font-normal w-full mb-1">メールアドレス</p>
      <div className="w-full bg-[#444444] rounded-[5px] px-3 py-2 mb-4 text-white text-sm">
        {email}
      </div>

      {/* パスワード */}
      <p className="text-white text-sm font-normal w-full mb-1">
        パスワード(8文字以上) <span className="text-red-400">※必須</span>
      </p>
      <div className="w-full h-10 bg-[#D9D9D9] border border-black rounded-[5px] flex items-center px-3 mb-1">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 bg-transparent text-black placeholder-[#707070] outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="text-[#707070] text-xs ml-2"
        >
          {showPassword ? '非表示' : '表示'}
        </button>
      </div>
      <p className="text-white text-[11px] w-full mb-3">
        半角小文字・半角大文字・数字のうち2種類以上を含めてください
      </p>
            {errorMessage && (
        <p className="text-red-400 text-[13px] mt-1">{errorMessage}</p>
      )}

      {/* パスワード確認 */}
      <div className="w-full h-10 bg-[#D9D9D9] border border-black rounded-[5px] flex items-center px-3 mb-4">
        <input
          type={showConfirm ? 'text' : 'password'}
          placeholder="パスワード再入力"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="flex-1 bg-transparent text-black placeholder-[#707070] outline-none"
        />
        <button
          type="button"
          onClick={() => setShowConfirm((p) => !p)}
          className="text-[#707070] text-xs ml-2"
        >
          {showConfirm ? '非表示' : '表示'}
        </button>
      </div>
            {errorMessage && (
        <p className="text-red-400 text-[13px] mt-1">{errorMessage}</p>
      )}

      {/* ニックネーム */}
      <p className="text-white text-sm font-normal w-full mb-1">ニックネーム</p>
      <input
        type="text"
        placeholder="ニックネーム"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full h-10 bg-[#D9D9D9] border border-black rounded-[5px] px-3 mb-4 text-black placeholder-[#707070]"
      />
            {errorMessage && (
        <p className="text-red-400 text-[13px] mt-1">{errorMessage}</p>
      )}

      {/* 生年月日 */}
      <p className="text-white text-sm font-normal w-full mb-1">生年月日</p>
      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        className="w-full h-10 bg-[#D9D9D9] border border-black rounded-[5px] px-3 mb-4 text-black"
      />

      {/* 業種 */}
      <p className="text-white text-sm font-normal w-full mb-1">業種 <span className="text-red-400">※必須</span></p>
      <select
        value={industry}
        onChange={(e) => setIndustry(e.target.value as Industry)}
        className="w-full h-10 bg-[#D9D9D9] border border-black rounded-[5px] px-3 mb-1 text-black"
      >
        <option value="">選択してください</option>
        {INDUSTRY_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
            {errorMessage && (
        <p className="text-red-400 text-[13px] mt-1">{errorMessage}</p>
      )}
      <p className="text-white text-[11px] w-full mb-4">
        ※Googleビジネスプロフィールへの投稿カテゴリ設定に利用します。最も近い業種を選択してください。
      </p>
      

      {/* 店舗名 */}
      <p className="text-white text-sm font-normal w-full mb-1">店舗名 <span className="text-red-400">※必須</span></p>
      <input
        type="text"
        placeholder="店舗名"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        className="w-full h-10 bg-[#D9D9D9] border border-black rounded-[5px] px-3 mb-1 text-black placeholder-[#707070]"
      />
            {errorMessage && (
        <p className="text-red-400 text-[13px] mt-1">{errorMessage}</p>
      )}
      <p className="text-white text-[11px] w-full mb-4">
        ※最初に連携する主要な店舗名を入力してください。2店舗目以降は、登録完了後の管理画面から追加できます。
      </p>

      {/* 同意チェックボックス */}
      <label className="flex items-start gap-2 w-full mb-2 cursor-pointer">
        <input
          type="checkbox"
          id="agree"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 flex-shrink-0"
        />
        <span className="text-white text-[11px]">
          <a href="#" className="text-[#38B6FF] underline">利用規約</a>、
          <a href="#" className="text-[#38B6FF] underline">プライバシーポリシー</a>、
          <a href="#" className="text-[#38B6FF] underline">cookieポリシー</a>
          に同意します
        </span>
      </label>

      <p className="text-white text-[11px] w-full mb-1">
        ご入力内容をご確認ください。内容に誤りがないか確認の上、「登録」ボタンを押してください。
        登録後の情報変更はマイページから行えます。
      </p>
      <p className="text-white text-[11px] w-full mb-4">
        本登録をもって、利用規約、プライバシーポリシー、Cookieポリシーに同意いただいたものとみなします。
      </p>

      {errorMessage && (
        <p className="text-red-400 text-[13px] mb-2 w-full">{errorMessage}</p>
      )}
      
            <button
        onClick={onClear}
        className="w-full bg-[#006355] text-white border border-white text-base font-normal py-2 rounded-[5px] mt-1"
      >
        入力内容の修正
      </button>

      {/*ユニークなuuidを付与*/}
      <button
        onClick={onSubmit}
        className="w-full bg-[#006355] text-white border border-white text-base font-normal py-2 rounded-[5px] mt-1"
      >
        登録する
      </button>
    </div>
  );
};

/* ──────────────────────────── Step3: 登録完了 ──────────────────────────── */
interface Step3Props {
  wyzeId: string;
  onStart: () => void;
}

const Step3: React.FC<Step3Props> = ({ wyzeId, onStart }) => (
  <div className="flex flex-col items-center py-8 px-4">
    <div className="text-green-400 text-6xl mb-4">✓</div>
    <p className="text-white text-base font-normal my-2">アカウント登録が完了しました</p>
    {wyzeId && (
      <p className="text-white text-base font-normal my-1">WyzeID: {wyzeId}</p>
    )}
    <p className="text-white text-base font-normal my-2">Wyze へようこそ！</p>
    <p className="text-white text-[13px] text-center w-[85%] mt-2 mb-4">
      ご登録ありがとうございます！ 早速、集客自動化の第一歩として、
      GoogleビジネスプロフィールとInstagram
      の連携を始めましょう！
    </p>
    <button
      onClick={onStart}
      className="w-[85%] bg-[#D4AF37] text-black border border-black text-base font-bold py-[5px] rounded-[5px] mt-2"
    >
      Wyzeを始める
    </button>
  </div>
);
