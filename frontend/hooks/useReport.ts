import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/utils/api';
import type { ReportSummary } from '@/types/api';
import type { ReportData } from '@/test/mock/reportMockData';
import { initialReportData } from '@/test/mock/reportMockData';

export type ReportErrorKind = 'NOT_CONNECTED' | 'RATE_LIMIT' | 'PARTIAL' | 'ERROR' | null;

const KEYWORD_COLORS = ['#4285F4', '#CF2E92', '#0CBA65', '#FBBC05', '#9E9E9E'];

function periodToQuery(period: string): { start: string; end: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (period) {
    case 'lastWeek': {
      const end = new Date(now); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setDate(start.getDate() - 7);
      return { start: fmt(start), end: fmt(end) };
    }
    case 'last2Week': {
      const end = new Date(now); end.setDate(end.getDate() - 1);
      const start = new Date(end); start.setDate(start.getDate() - 13);
      return { start: fmt(start), end: fmt(end) };
    }
    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: fmt(start), end: fmt(now) };
    }
    default: { // lastMonth
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: fmt(start), end: fmt(end) };
    }
  }
}

function toReportData(s: ReportSummary): ReportData {
  const gd = s.google_detail;
  const ig = s.instagram_detail;

  const googleActions = s.action_breakdown.google;
  const igActions = s.action_breakdown.instagram;

  return {
    period: `${s.period.start} ~ ${s.period.end}`,
    totalProfileViews: s.profile_views.value,
    totalProfileViewsChange: formatChange(s.profile_views.change_percent),
    totalActions: s.total_actions.value,
    totalActionsChange: formatChange(s.total_actions.change_percent),
    visitConversionRate: s.conversion_rate ?? (s.profile_views.value > 0
      ? Math.round((s.total_actions.value / s.profile_views.value) * 1000) / 10
      : 0),
    visitConversionRateChange: '-',
    avgRating: s.review_avg_rating,
    avgRatingChange: gd ? `${gd.review_stats.avg_rating.change_point >= 0 ? '+' : ''}${gd.review_stats.avg_rating.change_point}pt` : '-',

    actionDistribution: [
      { label: 'Google', value: googleActions, color: '#4285F4' },
      { label: 'Instagram', value: igActions, color: '#CF2E92' },
    ],

    actionDetails: gd ? [
      { label: '電話', count: gd.action_detail.phone_calls, color: '#4285F4' },
      { label: '経路検索', count: gd.action_detail.direction_requests, color: '#CF2E92' },
      { label: 'Webアクセス', count: gd.action_detail.website_visits, color: '#0CBA65' },
    ] : [],

    mediaBreakdown: [
      { label: 'Google', value: googleActions, color: '#4285F4' },
      { label: 'Instagram', value: igActions, color: '#CF2E92' },
    ],

    instagramSource: ig ? [
      { label: 'プロフィールリンク', count: ig.profile_link_clicks?.value ?? ig.source_breakdown.feed, color: '#4285F4' },
      { label: 'ストーリーリンク', count: ig.story_link_clicks?.value ?? ig.source_breakdown.stories, color: '#CF2E92' },
      { label: 'リール動画', count: ig.source_breakdown.reels, color: '#0CBA65' },
      { label: 'その他(タグ等)', count: ig.source_breakdown.other, color: '#FBBC05' },
    ] : [],

    searchKeywords: gd ? gd.search_keywords.map((k, i) => ({
      keyword: k.keyword,
      rank: k.rank,
      type: 'general',
      count: k.count,
      color: KEYWORD_COLORS[i % KEYWORD_COLORS.length],
    })) : [],

    weekdayTrend: gd ? gd.day_of_week_trend.map((d) => ({ day: d.day_of_week, value: d.count })) : [],
    timeTrend: gd ? gd.hourly_trend.map((h) => ({ hour: `${h.hour}時`, value: h.count })) : [],

    meoKeywords: [],
    meoRankingHistory: { labels: [], datasets: [] },

    reviewResponse: gd ? {
      responseRate: Math.round(gd.reply_performance.reply_rate * 10) / 10,
      avgResponseTime: Math.round(gd.reply_performance.avg_reply_hours * 10) / 10,
    } : { responseRate: 0, avgResponseTime: 0 },

    starDistribution: gd ? [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: gd.review_stats.rating_breakdown[String(star)] || 0,
    })) : [],

    reviewStatus: { completed: 0, inProgress: 0, pending: 0 },
  };
}

function formatChange(pct: number): string {
  if (pct === 0) return '±0%';
  return `${pct > 0 ? '+' : ''}${Math.round(pct)}%`;
}

export const useReport = (period: string) => {
  const [data, setData] = useState<ReportData>(initialReportData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ReportErrorKind>(null);
  const [partialErrors, setPartialErrors] = useState<{ google?: string; instagram?: string }>({});

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorKind(null);
    setPartialErrors({});
    try {
      const q = periodToQuery(period);
      const summary = await apiGet<ReportSummary>(`/api/reports/summary?start=${q.start}&end=${q.end}`);
      console.log('[useReport] GET /api/reports/summary:', { period, query: q, summary });

      // 部分エラーの収集
      const partial: { google?: string; instagram?: string } = {};
      if (summary.google_error) {
        partial.google = summary.google_error.code === 'NOT_CONNECTED'
          ? 'Google未連携'
          : summary.google_error.code === '429'
            ? 'Googleレート制限超過'
            : 'Googleデータ取得失敗';
      }
      if (summary.instagram_error) {
        partial.instagram = summary.instagram_error.code === 'NOT_CONNECTED'
          ? 'Instagram未連携'
          : summary.instagram_error.code === '429'
            ? 'Instagramレート制限超過'
            : 'Instagramデータ取得失敗';
      }
      if (Object.keys(partial).length > 0) {
        setPartialErrors(partial);
        setErrorKind('PARTIAL');
      }

      setData(toReportData(summary));
    } catch (err) {
      console.error('[useReport] GET /api/reports/summary failed:', err);
      const msg = err instanceof Error ? err.message : 'レポートの取得に失敗しました';
      setError(msg);
      setErrorKind('ERROR');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, loading, error, errorKind, partialErrors, refetch: fetchReport };
};
