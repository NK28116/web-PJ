// Google Reviews
export interface GoogleReview {
  review_id: string;
  reviewer: string;
  rating: number;
  comment: string;
  create_time: string;
  reply_text?: string;
  reply_time?: string;
  media_urls?: string[];
}

// Report Summary
export interface ReportSummary {
  period: { start: string; end: string };
  profile_views: MetricWithChange;
  total_actions: MetricWithChange;
  action_breakdown: { google: number; instagram: number };
  google_detail?: GoogleReport;
  review_avg_rating: number;
  instagram_detail?: InstagramReport;
}

export interface MetricWithChange {
  value: number;
  change_percent: number;
}

export interface GoogleReport {
  period: { start: string; end: string };
  action_detail: {
    phone_calls: number;
    direction_requests: number;
    website_visits: number;
  };
  day_of_week_trend: Array<{ day_of_week: string; count: number }>;
  hourly_trend: Array<{ hour: number; count: number }>;
  search_keywords: Array<{ rank: number; keyword: string; count: number }>;
  review_stats: {
    avg_rating: { value: number; change_point: number };
    rating_breakdown: Record<string, number>;
    total_count: number;
  };
  reply_performance: {
    reply_rate: number;
    avg_reply_hours: number;
  };
}

export interface InstagramReport {
  period: { start: string; end: string };
  profile_views: MetricWithChange;
  impressions: MetricWithChange;
  reach: MetricWithChange;
  website_clicks: MetricWithChange;
  follower_count: number;
  source_breakdown: {
    feed: number;
    reels: number;
    stories: number;
    other: number;
  };
  top_media: InstagramMediaItem[];
}

export interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url: string;
  caption: string;
  timestamp: string;
  like_count: number;
  comment_count: number;
}

// Billing
export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}
