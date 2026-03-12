package models

import "time"

// ReportSummary は統合サマリーレスポンス
type ReportSummary struct {
	Period              ReportPeriod         `json:"period"`
	ProfileViews        MetricWithChange     `json:"profile_views"`
	TotalActions        MetricWithChange     `json:"total_actions"`
	ActionBreakdown     ActionBreakdown      `json:"action_breakdown"`
	ConversionRate      PercentWithChange    `json:"conversion_rate"`
	ReviewAvgRating     RatingWithChange     `json:"review_avg_rating"`
}

// ReportPeriod はレポート期間
type ReportPeriod struct {
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

// MetricWithChange は前期比較付きの指標
type MetricWithChange struct {
	Value         int     `json:"value"`
	ChangePercent float64 `json:"change_percent"`
}

// PercentWithChange はパーセンテージ指標
type PercentWithChange struct {
	Value         float64 `json:"value"`
	ChangePercent float64 `json:"change_percent"`
}

// RatingWithChange は評価指標
type RatingWithChange struct {
	Value       float64 `json:"value"`
	ChangePoint float64 `json:"change_point"`
}

// ActionBreakdown はGoogle/Instagramのアクション内訳
type ActionBreakdown struct {
	Google    int `json:"google"`
	Instagram int `json:"instagram"`
}

// GoogleReport はGBP詳細レポート
type GoogleReport struct {
	Period           ReportPeriod       `json:"period"`
	ActionDetail     GoogleActionDetail `json:"action_detail"`
	DayOfWeekTrend   []DayOfWeekEntry   `json:"day_of_week_trend"`
	HourlyTrend      []HourlyEntry      `json:"hourly_trend"`
	SearchKeywords   []SearchKeyword    `json:"search_keywords"`
	ReviewStats      ReviewStats        `json:"review_stats"`
	ReplyPerformance ReplyPerformance   `json:"reply_performance"`
}

// GoogleActionDetail は電話・経路・Webアクセスの内訳
type GoogleActionDetail struct {
	PhoneCalls     int `json:"phone_calls"`
	DirectionReqs  int `json:"direction_requests"`
	WebsiteVisits  int `json:"website_visits"`
}

// DayOfWeekEntry は曜日別データ
type DayOfWeekEntry struct {
	DayOfWeek string `json:"day_of_week"`
	Count     int    `json:"count"`
}

// HourlyEntry は時間帯別データ
type HourlyEntry struct {
	Hour  int `json:"hour"`
	Count int `json:"count"`
}

// SearchKeyword は検索ワード
type SearchKeyword struct {
	Rank    int    `json:"rank"`
	Keyword string `json:"keyword"`
	Count   int    `json:"count"`
}

// ReviewStats は口コミ統計
type ReviewStats struct {
	AvgRating       RatingWithChange `json:"avg_rating"`
	RatingBreakdown map[int]int      `json:"rating_breakdown"`
	TotalCount      int              `json:"total_count"`
}

// ReplyPerformance は口コミ返信パフォーマンス
type ReplyPerformance struct {
	ReplyRate     float64 `json:"reply_rate"`
	AvgReplyHours float64 `json:"avg_reply_hours"`
}

// InstagramReport はInstagram詳細レポート
type InstagramReport struct {
	Period          ReportPeriod         `json:"period"`
	ProfileViews    MetricWithChange     `json:"profile_views"`
	Impressions     MetricWithChange     `json:"impressions"`
	Reach           MetricWithChange     `json:"reach"`
	WebsiteClicks   MetricWithChange     `json:"website_clicks"`
	FollowerCount   int                  `json:"follower_count"`
	SourceBreakdown InstagramSources     `json:"source_breakdown"`
	TopMedia        []InstagramMediaItem `json:"top_media"`
}

// InstagramSources はInstagram遷移元分析
type InstagramSources struct {
	Feed    int `json:"feed"`
	Reels   int `json:"reels"`
	Stories int `json:"stories"`
	Other   int `json:"other"`
}

// InstagramMediaItem はInstagram投稿アイテム
type InstagramMediaItem struct {
	ID           string    `json:"id"`
	MediaType    string    `json:"media_type"`
	MediaURL     string    `json:"media_url"`
	Caption      string    `json:"caption"`
	Timestamp    time.Time `json:"timestamp"`
	LikeCount    int       `json:"like_count"`
	CommentCount int       `json:"comment_count"`
}

// GoogleReview は口コミ
type GoogleReview struct {
	ReviewID    string    `json:"review_id"`
	Reviewer    string    `json:"reviewer"`
	Rating      int       `json:"rating"`
	Comment     string    `json:"comment"`
	CreateTime  time.Time `json:"create_time"`
	ReplyText   string    `json:"reply_text,omitempty"`
	ReplyTime   *time.Time `json:"reply_time,omitempty"`
}

// GoogleLocation は管理対象店舗
type GoogleLocation struct {
	Name         string `json:"name"`
	LocationID   string `json:"location_id"`
	Title        string `json:"title"`
	Address      string `json:"address"`
	PhoneNumber  string `json:"phone_number,omitempty"`
	Category     string `json:"category,omitempty"`
}

// ReviewReplyRequest は口コミ返信リクエスト
type ReviewReplyRequest struct {
	Comment string `json:"comment" binding:"required"`
}

// InstagramMediaCreateRequest はInstagram投稿リクエスト
type InstagramMediaCreateRequest struct {
	ImageURL string `json:"image_url" binding:"required"`
	Caption  string `json:"caption"`
}
