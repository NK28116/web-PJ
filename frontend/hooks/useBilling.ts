import { useCallback, useState } from 'react';
import { apiPost } from '@/utils/api';
import type { CheckoutResponse, PortalResponse } from '@/types/api';

export const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async (priceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<CheckoutResponse>('/api/billing/checkout', { price_id: priceId });
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : '決済セッションの作成に失敗しました');
      setLoading(false);
    }
  }, []);

  const openPortal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<PortalResponse>('/api/billing/portal');
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ポータルの作成に失敗しました');
      setLoading(false);
    }
  }, []);

  return { startCheckout, openPortal, loading, error };
};
