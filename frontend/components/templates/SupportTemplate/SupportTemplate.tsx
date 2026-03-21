import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MdKeyboardArrowLeft } from 'react-icons/md';

export interface SupportTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'review';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'review') => void;
}

const ACCOUNT_DELETE_TEMPLATE = `件名：アカウント削除依頼

お世話になっております。
下記アカウントの削除を希望いたします。

■ 登録メールアドレス：
■ Wyze ID：
■ 店舗名：
■ 削除理由（任意）：

ご対応のほどよろしくお願いいたします。`;

export const SupportTemplate: React.FC<SupportTemplateProps> = ({
  className,
  activeTab,
  onTabChange,
}) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!name || !email || !category || !message) {
      setError('全ての項目を入力してください');
      return;
    }
    // お問い合わせ API が実装されるまでは送信完了表示のみ
    setSubmitted(true);
  };

  const handleFillDeleteTemplate = () => {
    setCategory('アカウント削除');
    setMessage(ACCOUNT_DELETE_TEMPLATE);
  };

  return (
    <BaseTemplate
      className={className}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <div className="space-y-4 pb-20">
        {/* ヘッダー */}
        <div className="border-b border-gray-300 pb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[16px] text-black font-normal"
          >
            <MdKeyboardArrowLeft size={24} />
            <span>サポート・ヘルプ</span>
          </button>
        </div>

        {submitted ? (
          <div className="border border-gray-300 bg-white p-6 text-center">
            <div className="text-green-500 text-4xl mb-3">✓</div>
            <Text className="text-[16px] text-black font-medium mb-2">
              お問い合わせを受け付けました
            </Text>
            <Text className="text-[13px] text-gray-500 mb-4">
              ご入力いただいたメールアドレスへ返信いたします。
              <br />
              通常 3 営業日以内にご連絡いたします。
            </Text>
            <Button
              onClick={() => router.push('/home')}
              className="bg-[#00A48D] text-white text-[14px] py-2 px-6"
            >
              ホームに戻る
            </Button>
          </div>
        ) : (
          <>
            {/* お問い合わせフォーム */}
            <div className="border border-gray-300 bg-white">
              <div className="border-b border-gray-300 p-3">
                <Text className="text-[14px] text-black font-normal">お問い合わせ</Text>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-[12px] text-gray-500 mb-1">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="山田 太郎"
                    className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-500 mb-1">
                    メールアドレス <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@example.com"
                    className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-500 mb-1">
                    お問い合わせ種別 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded text-black"
                  >
                    <option value="">選択してください</option>
                    <option value="使い方">使い方について</option>
                    <option value="不具合">不具合の報告</option>
                    <option value="料金">料金・プランについて</option>
                    <option value="連携">外部サービス連携について</option>
                    <option value="アカウント削除">アカウント削除</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-500 mb-1">
                    お問い合わせ内容 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="お問い合わせ内容をご記入ください"
                    rows={6}
                    className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded text-black resize-none"
                  />
                </div>

                {error && (
                  <Text className="text-red-500 text-[13px]">{error}</Text>
                )}

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-[#00A48D] text-black text-[14px] py-2"
                >
                  送信する
                </Button>
              </div>
            </div>

            {/* アカウント削除依頼セクション */}
            <div className="border border-gray-300 bg-white">
              <div className="border-b border-gray-300 p-3">
                <Text className="text-[14px] text-black font-normal">退会・アカウント削除</Text>
              </div>
              <div className="p-4 space-y-3">
                <Text className="text-[13px] text-gray-600">
                  アカウントの削除をご希望の場合は、下記ボタンから定型文をお問い合わせ欄に挿入し、必要事項をご記入の上送信してください。
                </Text>
                <Text className="text-[11px] text-gray-400">
                  ※アカウント削除後はデータの復旧ができません。ご注意ください。
                </Text>
                <Button
                  onClick={handleFillDeleteTemplate}
                  className="w-full border border-red-300 text-red-500 text-[14px] py-2 bg-white"
                >
                  アカウント削除依頼の定型文を入力
                </Button>
              </div>
            </div>

            {/* FAQ セクション */}
            <div className="border border-gray-300 bg-white">
              <div className="border-b border-gray-300 p-3">
                <Text className="text-[14px] text-black font-normal">よくあるご質問</Text>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <Text className="text-[13px] text-black font-medium">Q. Google連携がうまくいきません</Text>
                  <Text className="text-[12px] text-gray-500 mt-1">
                    A. ホーム画面のアカウント連携セクションから、再度Google連携をお試しください。
                    それでも解決しない場合はお問い合わせください。
                  </Text>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <Text className="text-[13px] text-black font-medium">Q. プランの変更はできますか？</Text>
                  <Text className="text-[12px] text-gray-500 mt-1">
                    A. メニューの「プラン確認・変更」から変更できます。アップグレードは即時適用されます。
                  </Text>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <Text className="text-[13px] text-black font-medium">Q. 退会するとデータはどうなりますか？</Text>
                  <Text className="text-[12px] text-gray-500 mt-1">
                    A. 退会後、全てのデータは削除されます。復旧はできませんのでご注意ください。
                  </Text>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </BaseTemplate>
  );
};
