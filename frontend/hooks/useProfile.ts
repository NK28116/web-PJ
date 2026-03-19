import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPut } from '@/utils/api';
import type { ProfileResponse } from '@/types/api';

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ProfileResponse>('/api/user/profile');
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (nickname: string, email?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, string> = { nickname };
      if (email) body.email = email;
      const data = await apiPut<ProfileResponse>('/api/user/profile', body);
      setProfile(data);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'プロフィールの更新に失敗しました';
      if (msg.includes('409') || msg.includes('already in use')) {
        setError('このメールアドレスは既に使用されています');
      } else {
        setError(msg);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, error, refetch: fetchProfile, updateProfile };
};
