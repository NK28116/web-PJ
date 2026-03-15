import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/utils/api';
import type { InstagramMediaItem } from '@/types/api';

export const useInstagramMedia = () => {
  const [media, setMedia] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<InstagramMediaItem[]>('/api/instagram/media');
      console.log('[useInstagramMedia] GET /api/instagram/media:', { count: data.length, data });
      setMedia(data);
    } catch (err) {
      console.error('[useInstagramMedia] GET /api/instagram/media failed:', err);
      setError(err instanceof Error ? err.message : 'Instagramメディアの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return { media, loading, error, refetch: fetchMedia };
};
