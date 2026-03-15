import { useCallback, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-611370943102.us-east1.run.app';
const AUTH_TOKEN_KEY = 'auth_token';

export interface AccountLinkingState {
  google: boolean;
  instagram: boolean;
}

export const useAccountLink = () => {
  const [linkingState, setLinkingState] = useState<AccountLinkingState>({
    google: false,
    instagram: false,
  });
  const [loading, setLoading] = useState(true);

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  };

  // 連携状態を取得
  const fetchLinkStatus = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/link-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: AccountLinkingState = await res.json();
        setLinkingState(data);
      }
    } catch (err) {
      console.error('Failed to fetch link status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinkStatus();
  }, [fetchLinkStatus]);

  // OAuth認可画面へ遷移
  const linkGoogle = useCallback(() => {
    const token = getToken();
    if (!token) return;
    window.location.href = `${API_URL}/api/auth/google/login?token=${encodeURIComponent(token)}`;
  }, []);

  const linkInstagram = useCallback(() => {
    const token = getToken();
    if (!token) return;
    window.location.href = `${API_URL}/api/auth/instagram/login?token=${encodeURIComponent(token)}`;
  }, []);

  // 連携解除
  const unlinkAccount = useCallback(async (provider: 'google' | 'instagram') => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/unlink/${provider}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLinkingState((prev) => ({ ...prev, [provider]: false }));
      }
    } catch (err) {
      console.error(`Failed to unlink ${provider}:`, err);
    }
  }, []);

  const toggleGoogle = useCallback(() => {
    if (linkingState.google) {
      unlinkAccount('google');
    } else {
      linkGoogle();
    }
  }, [linkingState.google, unlinkAccount, linkGoogle]);

  const toggleInstagram = useCallback(() => {
    if (linkingState.instagram) {
      unlinkAccount('instagram');
    } else {
      linkInstagram();
    }
  }, [linkingState.instagram, unlinkAccount, linkInstagram]);

  return {
    linkingState,
    loading,
    toggleGoogle,
    toggleInstagram,
    refetch: fetchLinkStatus,
  };
};
