import { Button } from "@/atoms/Button";
import { Text } from "@/atoms/Text";
import { BaseTemplate } from "@/templates/BaseTemplate";
import { useBilling } from "@/hooks/useBilling";
import { useProfile } from "@/hooks/useProfile";
import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";


type PlanStatus = "active" | "inactive";

const PLAN_DISPLAY: Record<string, { name: string; price: string }> = {
  light: { name: "Light プラン", price: "10,000" },
  basic: { name: "Basic プラン", price: "29,800" },
  pro: { name: "Pro プラン", price: "59,800" },
};

const PLAN_DATA_DEFAULT = {
  currency: "円(税抜)",
  paymentMethod: "クレジットカード",
};

const PLANS = [
  {
    id: 'light',
    name: 'Light',
    description: '連携重視',
    price: 10000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT || '',
  },
  {
    id: 'basic',
    name: 'Basic',
    description: '自動化重視',
    price: 29800,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC || '',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: '戦略重視',
    price: 59800,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '',
  },
];

export interface CurrentFeaturesTemplateProps {
  className?: string;
  activeTab?: "home" | "post" | "report" | "review";
  onTabChange?: (tab: "home" | "post" | "report" | "review") => void;
}

export const CurrentFeaturesTemplate: React.FC<
  CurrentFeaturesTemplateProps
> = ({ className, activeTab, onTabChange }) => {
  const { profile } = useProfile();
  const planTier = profile?.plan_tier || "free";
  const planStatus: PlanStatus = planTier !== "free" ? "active" : "inactive";
  const planInfo = PLAN_DISPLAY[planTier] || { name: "未契約", price: "0" };

  const [selectedPlanId, setSelectedPlanId] = useState<string>(PLANS[0].id);
  const {
    startCheckout,
    openPortal,
    getSetupIntentSecret,
    deletePaymentMethod,
    paymentMethods,
    pmLoading,
    loading: billingLoading,
    error: billingError,
    refetchPaymentMethods,
    invoices,
    invoicesLoading,
    upcoming,
  } = useBilling();
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isAutoRenewal, setIsAutoRenewal] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const PRICE_IDS = {
    light: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT || "",
    basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC || "",
    pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "",
  } as const;

  const handleCancel = () => {
    // TODO: Stripe Portal経由で解約API呼び出し
    setIsAutoRenewal(false);
    setIsMenuOpen(false);
  };

  const handleStopAutoRenewal = () => {
    setIsAutoRenewal(false);
    setIsMenuOpen(false);
  };

  const handleUpgrade = (priceId: string) => {
    startCheckout(priceId);
  };
  
    const handleCheckout = () => {
    const plan = PLANS.find((p) => p.id === selectedPlanId);
    if (!plan || !plan.priceId) return;
    startCheckout(plan.priceId);
  };
    
    const formatCurrency = (amount: number): string => {
  return `¥${new Intl.NumberFormat('ja-JP').format(amount)}`;
};
    
  const isAnyLoading = billingLoading || pmLoading || formSubmitting;

  return (
    <BaseTemplate
      className={className}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <div className="space-y-4 pb-20">
        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <div className="flex items-center gap-4">
            <Text className="text-[16px] text-black font-normal">
              現在のプラン
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Text className="text-[16px] text-black font-normal">
              {planInfo.name}
            </Text>
            {planStatus === "active" ? (
              <div className="border border-[#00A48D] text-[#00A48D] px-2 py-0.5 text-[12px]">
                契約中
              </div>
            ) : (
              <div className="border border-gray-400 text-gray-400 px-2 py-0.5 text-[12px]">
                未契約
              </div>
            )}
            {/* ミートボールメニュー */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="メニュー"
                className="p-1 text-gray-600 hover:text-black"
              >
                <BsThreeDotsVertical size={18} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 shadow-md z-10 min-w-[160px]">
                  <button
                    onClick={handleCancel}
                    className="block w-full text-left px-4 py-2 text-[14px] text-black hover:bg-gray-100"
                  >
                    解約
                  </button>
                  <button
                    onClick={handleStopAutoRenewal}
                    className="block w-full text-left px-4 py-2 text-[14px] text-black hover:bg-gray-100"
                  >
                    自動更新を停止
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* プラン選択セクション */}
        <div className="border border-gray-300 bg-white">
          <div className="border-b border-gray-300 p-3">
            <Text className="text-[14px] text-black font-normal">
              {profile?.plan_tier && profile.plan_tier !== "free"
                ? "プランを変更"
                : "プランを選択"}
            </Text>
          </div>
          <div className="p-4 space-y-2">
            {PLANS.map((plan) => {
              const isCurrent = profile?.plan_tier === plan.id;
              return (
                <label
                  key={plan.id}
                  className={`flex items-center justify-between p-3 rounded border ${
                    isCurrent
                      ? "border-gray-200 bg-gray-50 cursor-default"
                      : selectedPlanId === plan.id
                        ? "border-[#00A48D] bg-[#f0faf8] cursor-pointer"
                        : "border-gray-200 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={() => !isCurrent && setSelectedPlanId(plan.id)}
                      disabled={isCurrent}
                      className="accent-[#00A48D]"
                    />
                    <div>
                      <Text
                        className={`text-[14px] font-medium ${isCurrent ? "text-gray-400" : "text-black"}`}
                      >
                        {plan.name}
                        {isCurrent && (
                          <span className="ml-2 text-[11px] text-[#00A48D]">
                            現在のプラン
                          </span>
                        )}
                      </Text>
                      <Text className="text-[12px] text-gray-500">
                        {plan.description}
                      </Text>
                    </div>
                  </div>
                  <Text
                    className={`text-[14px] ${isCurrent ? "text-gray-400" : "text-black"}`}
                  >
                    {formatCurrency(plan.price)}
                    <span className="text-[11px] text-gray-500">/月</span>
                  </Text>
                </label>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <Button
              onClick={handleCheckout}
              className="w-full bg-[#00A48D] text-black text-[14px] py-2"
              disabled={
                isAnyLoading ||
                !PLANS.find((p) => p.id === selectedPlanId)?.priceId ||
                profile?.plan_tier === selectedPlanId
              }
            >
              {isAnyLoading ? "処理中..." : planStatus === "inactive" ? "契約する" : "プランを変更する"}
            </Button>
          </div>
        </div>
        


        {/* 契約情報ブロック */}
        <div className="border border-gray-300 p-4 space-y-3 bg-white">
          <div className="flex justify-between">
            <Text className="text-[14px] text-black">月額料金</Text>
            <Text className="text-[14px] text-black">
              {planInfo.price} {PLAN_DATA_DEFAULT.currency}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text className="text-[14px] text-black">支払方法</Text>
            <Text className="text-[14px] text-black">
              {PLAN_DATA_DEFAULT.paymentMethod}
            </Text>
          </div>
          {planStatus === "active" && (
            <div className="flex justify-between">
              <Text className="text-[14px] text-black">自動更新</Text>
              {isAutoRenewal ? (
                <Text className="text-[14px] text-[#00A48D]">有効</Text>
              ) : (
                <Text className="text-[14px] text-red-500">停止中</Text>
              )}
            </div>
          )}
        </div>

        {billingError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[14px] p-3">
            {billingError}
          </div>
        )}

        {/* プラン変更ブロック（契約中のみ表示） */}
        {planStatus === "active" &&
          (() => {
            const tierOrder = ["light", "basic", "pro"];
            const currentIdx = tierOrder.indexOf(planTier);
            const upgradePlans = tierOrder
              .filter((_, i) => i > currentIdx)
              .map((id) => ({
                id,
                ...PLAN_DISPLAY[id],
                priceId: PRICE_IDS[id as keyof typeof PRICE_IDS],
              }));
            if (upgradePlans.length === 0) return null;
            return (
              <div className="border border-gray-300 bg-white">
                <div className="border-b border-gray-300 p-2">
                  <Text className="text-[14px] text-black">プラン変更</Text>
                </div>
                <div className="p-4 space-y-2">
                  {upgradePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between"
                    >
                      <Text className="text-[14px] text-black">
                        {plan.name}（¥{plan.price}/月）
                      </Text>
                      <Button
                        className="text-[14px] text-black"
                        onClick={() => handleUpgrade(plan.priceId)}
                        disabled={billingLoading}
                      >
                        {billingLoading ? "処理中..." : "アップグレード"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        {/* --- DEV_ONLY: 状態リセットボタン（リリース前に削除） --- */}
        {planStatus === "active" && !isAutoRenewal && (
          <div className="flex justify-center">
            <Button
              onClick={() => setIsAutoRenewal(true)}
              className="border border-orange-400 text-orange-400 px-6 py-2 text-[12px]"
            >
              [DEV] 自動更新を再開
            </Button>
          </div>
        )}
        {/* --- /DEV_ONLY --- */}
      </div>
    </BaseTemplate>
  );
};
