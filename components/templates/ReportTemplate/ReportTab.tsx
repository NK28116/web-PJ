import { Text } from "@/atoms/Text"
import React, { useState } from "react"
import { AiOutlineQuestionCircle } from "react-icons/ai"
import {
  IoIosArrowRoundDown,
  IoIosArrowRoundUp,
} from "react-icons/io"

/**
 * セクションタイトルとツールチップを表示するコンポーネント
 */
const SectionTitle: React.FC<{ title: string; tooltip?: string }> = ({
	title,
	tooltip,
}) => {
	const [showTooltip, setShowTooltip] = useState(false)

	return (
		<div className="flex items-center gap-2 mb-4">
			<Text className="text-sm text-gray-600">{title}</Text>
			{tooltip && (
				<div className="relative">
					<AiOutlineQuestionCircle
						className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
						size={16}
						onMouseEnter={() => setShowTooltip(true)}
						onMouseLeave={() => setShowTooltip(false)}
						onClick={() => setShowTooltip(!showTooltip)}
					/>
					{showTooltip && (
						<div className="absolute z-10 left-0 top-6 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
							{tooltip}
							<div className="absolute -top-1 left-2 w-2 h-2 bg-gray-800 transform rotate-45" />
						</div>
					)}
				</div>
			)}
		</div>
	)
}

/**
 * KPIカード共通コンポーネント
 */

type KPICardProps = {
	title: string
	value: number | string
	unit: string
	tooltip?: string
	change?: string // "+25%" | "-3.2%"
	className?: string
}

const KPICard: React.FC<KPICardProps> = ({
	title,
	value,
	unit,
	tooltip,
	change,
	className,
}) => {
	const isPositive =
		change?.trim().startsWith("+") ||
		(!!change && !change.trim().startsWith("-"))

	const isNegative = change?.trim().startsWith("-")

	const ArrowIcon = isNegative ? IoIosArrowRoundDown : IoIosArrowRoundUp

	const changeColor = isNegative ? "text-[#E54848]" : "text-[#3C84FF]"

	return (
		<div
			className={[
				"bg-white",
				"p-4",
				"rounded-lg",
				"border border-gray-200",
				className,
			].join(" ")}
		>
			<div className="flex flex-col h-full">
				<SectionTitle title={title} tooltip={tooltip} />

				<div className="flex items-end justify-between ">
					{/* Value + Unit */}
					<div className="flex items-end gap-1">
						<Text className="text-[10.18vw] leading-[12.21vw] font-semibold tracking-tight text-wyze-primary">
							{typeof value === "number" ? value.toLocaleString() : value}
						</Text>

						<Text className="mb-[0.4vw] text-[6.11vw] leading-[7.38vw] font-bold text-gray-900">
							{unit}
						</Text>
					</div>

					{/* Change */}
					{change && (isPositive || isNegative) && (
						<div className="flex items-center mb-[0.6vw]">
							<ArrowIcon size={48} className={changeColor} />
							<span
								className={[
									"text-[6.11vw]",
									"leading-[7.38vw]",
									"font-normal",
									changeColor,
								].join(" ")}
							>
								{change}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

/**
 * 汎用ドーナツグラフ
 */
interface ChartSegment {
	value: number
	color: string
}

const DonutChart: React.FC<{
	segments: ChartSegment[]
	size?: number
	thickness?: number
}> = ({ segments, size = 130, thickness = 20 }) => {
	const radius = (size - thickness) / 2
	const circumference = 2 * Math.PI * radius
	const total = segments.reduce((sum, segment) => sum + segment.value, 0)

	let currentOffset = 0

	return (
		<div className="relative mx-auto" style={{ width: size, height: size }}>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="transform -rotate-90"
			>
				{segments.map((segment, index) => {
					const dash = (segment.value / total) * circumference
					const offset = currentOffset
					currentOffset += dash // 次のセグメントのためにオフセットを更新

					// strokeDashoffsetは反時計回りに適用されるため、負の値にする
					return (
						<circle
							key={index}
							cx={size / 2}
							cy={size / 2}
							r={radius}
							fill="none"
							stroke={segment.color}
							strokeWidth={thickness}
							strokeDasharray={`${dash} ${circumference}`}
							strokeDashoffset={-offset}
						/>
					)
				})}
			</svg>
		</div>
	)
}

/**
 * ダミーデータ定義
 */
const mockReportData = {
	period: "9月1日〜9月30日",
	totalProfileViews: 9375,
	totalProfileViewsChange: "+25%",
	totalActions: 2605,
	totalActionsChange: "+25%",
	visitConversionRate: 27.8,
	visitConversionRateChange: "+1.6%",
	avgRating: 4.2,
	avgRatingChange: "+0.2pt",

	// 統合アクション内訳
	actionDistribution: [
		{ label: "Google", value: 1400, color: "#4285F4" },
		{ label: "Instagram", value: 1205, color: "#CF2E92" },
	],

	// 統合アクション内訳詳細
	actionDetails: [
		{ label: "電話", count: 120, color: "#4285F4" },
		{ label: "経路検索", count: 1280, color: "#CF2E92" },
		{ label: "Webアクセス", count: 1205, color: "#0CBA65" },
	],

	// Instagram遷移元分析
	instagramSource: [
		{ label: "フィード投稿", count: 745, color: "#4285F4" },
		{ label: "リール動画", count: 238, color: "#CF2E92" },
		{ label: "ストーリーズ", count: 1162, color: "#0CBA65" },
		{ label: "その他(タグ等)", count: 1205, color: "#FBBC05" },
	],

	// Google検索ワード内訳
	searchKeywords: [
		{ keyword: "Kento's Burger", rank: 1, type: "brand" },
		{ keyword: "中目黒ハンバーガー", rank: 2, type: "general" },
		{ keyword: "中目黒ランチ", rank: 3, type: "general" },
		{ keyword: "目黒川沿い", rank: 4, type: "area" },
		{ keyword: "ハンバーガー", rank: 5, type: "category" },
	],

	// 曜日・時間帯傾向
	weekdayTrend: [
		{ day: "月", value: 40 },
		{ day: "火", value: 60 },
		{ day: "水", value: 30 },
		{ day: "木", value: 80 },
		{ day: "金", value: 50 },
		{ day: "土", value: 70 },
		{ day: "日", value: 45 },
	],
	hourlyTrend: [
		/* 時間帯データはモックでは省略または簡易表示 */
	],

	// MEO順位推移 (キーワード別)
	meoKeywords: [
		{ name: "中目黒レストラン", rank: 17, change: "↓", changeType: "down" },
		{ name: "中目黒ランチ", rank: 8, change: "↓", changeType: "down" },
		{ name: "中目黒ハンバーガー", rank: 4, change: "↑", changeType: "up" },
	],

	// MEO順位推移グラフデータ
	meoRankingHistory: {
		labels: ["1日","" ,"7日","", "14日", "","21日", "","28日"],
		datasets: [
			{
				label: "中目黒 ハンバーガー",
				color: "#4285F4",
				data: [11, 11, 10, 9, 8, 9, 6, 3],
			},
			{
				label: "中目黒 ランチ",
				color: "#CF2E92",
				data: [19, 19, 18, 16, 14, 6, 7, 8],
			},
			{
				label: "中目黒駅 レストラン",
				color: "#009F00",
				data: [21, 20, 20, 19, 20, 20, 18, 17],
			},
		],
	},

	// 口コミ返信パフォーマンス
	reviewResponse: {
		responseRate: 96.2,
		avgResponseTime: 10.4,
	},

	// 星内訳
	starDistribution: [
		{ star: 5, count: 20 },
		{ star: 4, count: 10 },
		{ star: 3, count: 5 },
		{ star: 2, count: 2 },
		{ star: 1, count: 1 },
	],
}

/**
 * ツールチップ説明文定義
 */
const tooltips = {
	profileViews:
		"Google マップでの店舗表示回数とInstagramプロフィール閲覧の総数。",
	totalActions:
		"Googleマップ経由で、電話・ルート検索・サイト閲覧のいずれかを行った、来店意欲の高いユーザーの総数。",
	visitConversion:
		"閲覧した人のうち、実際に予約や経路案内などのアクションを起こした人の割合です。この数値が高いほど、魅力的な店舗情報を発信できています。",
	actionDistribution:
		"Googleは「電話・経路案内・HP移動」、Instagramは「アクションボタン・リンククリック」の合計値を算出しています。",
	actionDetails:
		"各アクションは、Googleマップ上でボタンがタップされた回数を集計しています。",
	weekdayTrend:
		"このデータは、過去1ヶ月間にユーザーがあなたのお店を調べたタイミングの傾向を示しています。",
	searchKeywords:
		"Googleマップ検索であなたのお店が表示された際のキーワードの内訳です。",
	avgRating: "Googleマップ等のレビューに基づく平均評価スコアです。",
}

/**
 * ReportTabコンポーネント - 運用実績レポートの内容を表示
 */
const ReportTab = () => {
  return (
    <div className="px-4 flex flex-col gap-4">
      <KPICard
        title="統合プロフィール閲覧総数"
        value={mockReportData.totalProfileViews}
        unit="件"
        tooltip={tooltips.profileViews}
        change={mockReportData.totalProfileViewsChange}
        className="col-span-1"
      />
      <KPICard
        title="統合アクション総数"
        value={mockReportData.totalActions}
        unit="件"
        tooltip={tooltips.totalActions}
        change={mockReportData.totalActionsChange}
        className="col-span-1"
      />
      <div className="bg-white p-4 rounded-lg border border-gray-200 col-span-2">
        <SectionTitle
          title="統合アクション内訳"
          tooltip={tooltips.actionDistribution}
        />
        <div className="flex items-center justify-around">
          <div className="w-[120px]">
            <DonutChart
              segments={mockReportData.actionDistribution}
              size={120}
              thickness={20}
            />
          </div>
          <div className="space-y-4">
            {mockReportData.actionDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-24">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-sm text-gray-600">
                    {item.label}
                  </Text>
                </div>
                <Text className="text-lg font-medium">
                  {item.value.toLocaleString()}
                  <span className="text-sm text-gray-500 ml-1">件</span>
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>
      <KPICard
        title="来店誘導率"
        value={mockReportData.visitConversionRate}
        unit="%"
        tooltip={tooltips.visitConversion}
        change={mockReportData.visitConversionRateChange}
        className="col-span-1"
      />
      <div className="relative">
        <div className="absolute right-1/4 top-4 transform -translate-x-1/2 text-xl">
          前月比
        </div>
        <KPICard
          title="口コミ平均評価"
          value={mockReportData.avgRating}
          unit="pt"
          change={mockReportData.avgRatingChange}
          tooltip={""}
          className="col-span-1"
        />
      </div>

      {/* 統合アクション内訳詳細 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle
          title="統合アクション内訳詳細"
          tooltip={tooltips.actionDetails}
        />
        <div className="flex items-center gap-4">
          <div className="w-1/2 flex-shrink-0">
            <DonutChart
              segments={mockReportData.actionDetails.map((d) => ({
                value: d.count,
                color: d.color,
              }))}
              size={120}
              thickness={20}
            />
          </div>

          <div className="flex-1 space-y-4">
            {mockReportData.actionDetails.map((action, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 items-start w-full"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: action.color }}
                  />
                  <Text className="text-lg font-medium text-gray-700">
                    {action.label}
                  </Text>
                </div>

                <div className="flex items-end ml-auto">
                  <Text className="text-lg font-medium ">
                    {action.count.toLocaleString()}
                    <span className="text-lg text-gray-500 ml-1">件</span>
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 曜日・時間帯傾向 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle
          title="曜日・時間帯傾向"
          tooltip={tooltips.weekdayTrend}
        />

        {/* 曜日傾向グラフ */}
        <div className="mb-6">
          <Text className="text-xs text-gray-500 mb-2">曜日傾向</Text>
          <div className="h-[150px] flex items-end justify-between px-2 gap-2 border-b border-gray-200 pb-1">
            {mockReportData.weekdayTrend.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 w-full"
              >
                <div
                  className="w-full bg-[#D9D9D9] rounded-t-sm"
                  style={{ height: `${item.value}%` }}
                />
                <span className="text-xs text-gray-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 時間帯傾向（ヒートマップ風ダミー） */}
        <div>
          <Text className="text-xs text-gray-500 mb-2">時間帯傾向</Text>
          <div className="h-[150px] bg-gray-50 flex items-center justify-center border border-gray-100 rounded">
            <Text className="text-xs text-gray-400">
              （ヒートマップ表示エリア）
            </Text>
          </div>
        </div>
      </div>
      {/* Google検索ワード内訳 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle
          title="Google検索ワード内訳"
          tooltip={tooltips.searchKeywords}
        />
        <div className="space-y-3">
          <div className="flex justify-center mb-4">
            {/* 簡易的な円グラフ（ダミー） */}
            <div className="w-[120px] h-[120px] rounded-full border-[15px] border-[#D9D9D9] relative">
              {/* 実際のデータに基づいてSVGで描画すべきだが、ここでは簡易表現 */}
            </div>
          </div>
          {mockReportData.searchKeywords.map((keyword, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex flex-col">
                <Text className="text-sm font-bold text-gray-800">
                  {keyword.keyword}
                </Text>
              </div>
              <div className="flex items-center gap-1">
                <Text className="text-lg font-bold text-gray-600">
                  {keyword.rank}
                </Text>
                <Text className="text-xs font-bold text-gray-600">位</Text>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="Instagram遷移元分析" />
        <div className="flex flex-col gap-4">
          <div className="flex justify-center my-2">
            <DonutChart
              segments={mockReportData.instagramSource.map((d) => ({
                value: d.count,
                color: d.color,
              }))}
              size={160}
              thickness={30}
            />
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            {mockReportData.instagramSource.map((source, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <Text className="text-xs font-medium text-gray-600">
                    {source.label}
                  </Text>
                </div>
                <Text className="text-lg font-bold pl-5 leading-none">
                  {source.count.toLocaleString()}
                  <span className="text-xs text-gray-500 ml-1 font-normal">
                    件
                  </span>
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute right-1/4 top-4 transform -translate-x-1/2 text-xl">
          前月比
        </div>
        <KPICard
          title="口コミ平均評価"
          value={mockReportData.avgRating}
          unit="pt"
          change={mockReportData.avgRatingChange}
          tooltip={""}
          className="col-span-1"
        />
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 col-span-1">
        <SectionTitle title="星（評価）の内訳" />
        <div className="flex flex-col gap-1">
          {mockReportData.starDistribution.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gray-400 h-full"
                  style={{ width: `${(item.count / 30) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 口コミ返信パフォーマンス */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="口コミ返信パフォーマンス" />
        <div className="flex justify-around items-center py-2">
          <div className="flex flex-col items-center justify-center p-2">
            <Text className="text-xs font-bold text-gray-500 mb-2">
              返信率
            </Text>
            <div className="flex items-end">
              <Text className="text-[2rem] leading-none font-bold text-[#00A48D]">
                {mockReportData.reviewResponse.responseRate}
              </Text>
              <Text className="text-sm mb-1 ml-1 font-bold text-gray-600">
                %
              </Text>
            </div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="flex flex-col items-center justify-center p-2">
            <Text className="text-xs font-bold text-gray-500 mb-2">
              平均返信時間
            </Text>
            <div className="flex items-end">
              <Text className="text-[2rem] leading-none font-bold text-[#00A48D]">
                {mockReportData.reviewResponse.avgResponseTime}
              </Text>
              <Text className="text-sm mb-1 ml-1 font-bold text-gray-600">
                時間
              </Text>
            </div>
          </div>
        </div>
        <Text className="text-[10px] text-right text-gray-400 mt-1">
          （Google推奨：24時間以内）
        </Text>
      </div>


      {/* MEO順位推移 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="MEO順位推移" />
        {/* 折れ線グラフ（SVG簡易実装） */}
        <div className="mt-6 pl-8">
          <div className="h-[150px] border-b border-l border-gray-300 relative mt-4">
            {/* Y軸ラベル */}
            <div className="absolute -left-8 top-[5%] -translate-y-1/2 text-xs text-gray-400">
              1位
            </div>
            <div className="absolute -left-8 top-[50%] -translate-y-1/2 text-xs text-gray-400">
              10位
            </div>
            <div className="absolute -left-8 top-[100%] -translate-y-1/2 text-xs text-gray-400">
              20位
            </div>

            <div className="absolute top-0 left-0 w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="overflow-visible"
              >
                {/* 補助線（横） */}
                <line
                  x1="0"
                  y1="5"
                  x2="100"
                  y2="5"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1="0"
                  y1="50"
                  x2="100"
                  y2="50"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1="0"
                  y1="100"
                  x2="100"
                  y2="100"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />

                {/* 補助線（縦 - 7日ごと） */}
                {mockReportData.meoRankingHistory.labels.map((_, i) => {
                  const x =
                    (i / (mockReportData.meoRankingHistory.labels.length - 1)) *
                    100
                  return (
                    <line
                      key={`vgrid-${i}`}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2="100"
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      vectorEffect="non-scaling-stroke"
                    />
                  )
                })}

                {/* データライン */}
                {mockReportData.meoRankingHistory.datasets.map(
                  (dataset, index) => (
                    <g key={index}>
                      <polyline
                        points={dataset.data
                          .map((rank, i) => {
                            const x =
                              (i /
                                (mockReportData.meoRankingHistory.labels
                                  .length - 1)) *
                              100
                            const y = (rank / 20) * 100 // 20位まで
                            return `${x},${y}`
                          })
                          .join(" ")}
                        fill="none"
                        stroke={dataset.color}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                      {dataset.data.map((rank, i) => (
                        <circle
                          key={i}
                          cx={
                            (i /
                              (mockReportData.meoRankingHistory.labels
                                .length - 1)) *
                            100
                          }
                          cy={(rank / 20) * 100}
                          r="3"
                          fill={dataset.color}
                          // vectorEffect won't prevent ellipse distortion on resize, but helps stroke
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                    </g>
                  ),
                )}
              </svg>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {mockReportData.meoRankingHistory.labels.map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>
        </div>
        <div className="space-y-6 mt-8">
          {mockReportData.meoKeywords.map((item, index) => {
            const dataset = mockReportData.meoRankingHistory.datasets[index]
            return (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                {/* 左側: 線 + キーワード */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-0.5"
                    style={{ backgroundColor: dataset?.color || "#ccc" }}
                  />
                  <Text className="text-base text-gray-800">
                    「{item.name}」
                  </Text>
                </div>

                {/* 右側: 順位 + 変化 */}
                <div className="flex items-center gap-2">
                  <Text
                    className="text-3xl font-bold leading-none"
                    style={{ color: "#00A48D" }}
                  >
                    {item.rank}
                  </Text>
                  <div className="flex items-end gap-1">
                    <span className="text-sm text-gray-800 mb-1">位</span>
                    <span className="text-lg text-gray-800 leading-none">
                      （{item.change}）
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* 星内訳グラフ & 口コミ平均評価 */}
      <div className="grid grid-cols-2 gap-3"></div>
    </div>
  )
}

export default ReportTab
