/**
 * レポートタブ用モックデータ
 */

export interface ReportData {
  period: string;
  totalProfileViews: number;
  totalProfileViewsChange: string;
  totalActions: number;
  totalActionsChange: string;
  visitConversionRate: number;
  visitConversionRateChange: string;
  avgRating: number;
  avgRatingChange: string;
  actionDistribution: Array<{ label: string; value: number; color: string }>;
  actionDetails: Array<{ label: string; count: number; color: string }>;
  mediaBreakdown: Array<{ label: string; value: number; color: string }>;
  instagramSource: Array<{ label: string; count: number; color: string }>;
  searchKeywords: Array<{ keyword: string; rank: number; type: string; count: number; color: string }>;
  weekdayTrend: Array<{ day: string; value: number }>;
  timeTrend: Array<{ hour: string; value: number }>;
  meoKeywords: Array<{ name: string; rank: number; change: string; changeType: string }>;
  meoRankingHistory: {
    labels: string[];
    datasets: Array<{ label: string; color: string; data: number[] }>;
  };
  reviewResponse: {
    responseRate: number;
    avgResponseTime: number;
  };
  starDistribution: Array<{ star: number; count: number }>;
  reviewStatus: {
    completed: number;
    inProgress: number;
    pending: number;
  };
}

/**
 * 実運用データ（Operational State）
 */
export const operationalReportData: ReportData = {
  period: '9月1日〜9月30日',
  totalProfileViews: 9375,
  totalProfileViewsChange: '+25%',
  totalActions: 2605,
  totalActionsChange: '+29%',
  visitConversionRate: 27.8,
  visitConversionRateChange: '+1.6%',
  avgRating: 4.2,
  avgRatingChange: '+0.2pt',

  actionDistribution: [
    { label: 'Google', value: 1400, color: '#4285F4' },
    { label: 'Instagram', value: 1205, color: '#CF2E92' },
  ],

  actionDetails: [
    { label: '電話', count: 120, color: '#4285F4' },
    { label: '経路検索', count: 1280, color: '#CF2E92' },
    { label: 'Webアクセス', count: 1205, color: '#0CBA65' },
  ],

  mediaBreakdown: [
    { label: 'Google', value: 1400, color: '#4285F4' },
    { label: 'Instagram', value: 850, color: '#CF2E92' },
    { label: 'Webサービス', value: 355, color: '#0CBA65' },
  ],

  instagramSource: [
    { label: 'フィード投稿', count: 745, color: '#4285F4' },
    { label: 'リール動画', count: 238, color: '#CF2E92' },
    { label: 'ストーリーズ', count: 1162, color: '#0CBA65' },
    { label: 'その他(タグ等)', count: 1205, color: '#FBBC05' },
  ],

  searchKeywords: [
    { keyword: "Kento's Burger", rank: 1, type: 'brand', count: 450, color: '#4285F4' },
    { keyword: '中目黒ハンバーガー', rank: 2, type: 'general', count: 320, color: '#CF2E92' },
    { keyword: '中目黒ランチ', rank: 3, type: 'general', count: 280, color: '#0CBA65' },
    { keyword: '目黒川沿い', rank: 4, type: 'area', count: 150, color: '#FBBC05' },
    { keyword: 'ハンバーガー', rank: 5, type: 'category', count: 100, color: '#9E9E9E' },
  ],

  weekdayTrend: [
    { day: '月', value: 40 },
    { day: '火', value: 60 },
    { day: '水', value: 30 },
    { day: '木', value: 80 },
    { day: '金', value: 50 },
    { day: '土', value: 70 },
    { day: '日', value: 45 },
  ],

  timeTrend: [
    { hour: '9時', value: 20 },
    { hour: '10時', value: 35 },
    { hour: '11時', value: 55 },
    { hour: '12時', value: 85 },
    { hour: '13時', value: 70 },
    { hour: '14時', value: 45 },
    { hour: '15時', value: 40 },
    { hour: '16時', value: 50 },
    { hour: '17時', value: 65 },
    { hour: '18時', value: 90 },
    { hour: '19時', value: 75 },
    { hour: '20時', value: 55 },
    { hour: '21時', value: 30 },
  ],

  meoKeywords: [
    { name: '中目黒レストラン', rank: 17, change: '↓', changeType: 'down' },
    { name: '中目黒ランチ', rank: 8, change: '↓', changeType: 'down' },
    { name: '中目黒ハンバーガー', rank: 4, change: '↑', changeType: 'up' },
  ],

  meoRankingHistory: {
    labels: ['1日', '', '7日', '', '14日', '', '21日', '', '28日'],
    datasets: [
      {
        label: '中目黒 ハンバーガー',
        color: '#4285F4',
        data: [11, 11, 10, 9, 8, 9, 6, 3],
      },
      {
        label: '中目黒 ランチ',
        color: '#CF2E92',
        data: [19, 19, 18, 16, 14, 6, 7, 8],
      },
      {
        label: '中目黒駅 レストラン',
        color: '#009F00',
        data: [21, 20, 20, 19, 20, 20, 18, 17],
      },
    ],
  },

  reviewResponse: {
    responseRate: 96.2,
    avgResponseTime: 10.4,
  },

  starDistribution: [
    { star: 5, count: 20 },
    { star: 4, count: 10 },
    { star: 3, count: 5 },
    { star: 2, count: 2 },
    { star: 1, count: 1 },
  ],

  reviewStatus: {
    completed: 4,
    inProgress: 8,
    pending: 17,
  },
};

/**
 * 初期状態（リリース時）データ
 */
export const initialReportData: ReportData = {
  period: '-',
  totalProfileViews: 0,
  totalProfileViewsChange: '-',
  totalActions: 0,
  totalActionsChange: '-',
  visitConversionRate: 0,
  visitConversionRateChange: '-',
  avgRating: 0,
  avgRatingChange: '-',
  actionDistribution: [],
  actionDetails: [],
  mediaBreakdown: [],
  instagramSource: [],
  searchKeywords: [],
  weekdayTrend: [],
  timeTrend: [],
  meoKeywords: [],
  meoRankingHistory: { labels: [], datasets: [] },
  reviewResponse: { responseRate: 0, avgResponseTime: 0 },
  starDistribution: [],
  reviewStatus: { completed: 0, inProgress: 0, pending: 0 },
};

/**
 * ツールチップ説明文定義
 */
export const tooltips = {
  profileViews:
    'Google マップでの店舗表示回数とInstagramプロフィール閲覧の総数。',
  totalActions:
    'Googleマップ経由で、電話・ルート検索・サイト閲覧のいずれかを行った、来店意欲の高いユーザーの総数。',
  visitConversion:
    '閲覧した人のうち、実際に予約や経路案内などのアクションを起こした人の割合です。この数値が高いほど、魅力的な店舗情報を発信できています。',
  actionDistribution:
    'Googleは「電話・経路案内・HP移動」、Instagramは「アクションボタン・リンククリック」の合計値を算出しています。',
  actionDetails:
    '各アクションは、Googleマップ上でボタンがタップされた回数を集計しています。',
  mediaBreakdown:
    '媒体別（Google、Instagram、Webサービス）のアクション数の内訳です。',
  weekdayTrend:
    'このデータは、過去1ヶ月間にユーザーがあなたのお店を調べたタイミングの傾向を示しています。',
  timeTrend:
    '時間帯別のアクセス傾向を示しています。ピーク時間帯の把握に役立ちます。',
  searchKeywords:
    'Googleマップ検索であなたのお店が表示された際のキーワードの内訳です。',
  avgRating: 'Googleマップ等のレビューに基づく平均評価スコアです。',
};
