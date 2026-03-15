import { Text } from '@/atoms/Text';
import {
  SectionTitle,
  KPICard,
  DonutChart,
  EmptyState,
  isEmpty,
} from '@/organisms/Report';
import React from 'react';
import type { ReportData } from '@/test/mock/reportMockData';
import { tooltips } from '@/test/mock/reportMockData';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
} from 'recharts';
import type { InstagramMediaItem } from '@/types/api';

export interface ReportTabProps {
  data: ReportData;
  instagramMedia?: InstagramMediaItem[];
}

const ReportTab: React.FC<ReportTabProps> = ({ data, instagramMedia }) => {
  return (
    <div className="px-4 flex flex-col gap-4">
      {/* KPIカード */}
      <KPICard
        title="統合プロフィール閲覧総数"
        value={data.totalProfileViews}
        unit="件"
        tooltip={tooltips.profileViews}
        change={data.totalProfileViewsChange}
      />
      <KPICard
        title="統合アクション総数"
        value={data.totalActions}
        unit="件"
        tooltip={tooltips.totalActions}
        change={data.totalActionsChange}
      />

      {/* 統合アクション内訳 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="統合アクション内訳" tooltip={tooltips.actionDistribution} />
        {isEmpty(data.actionDistribution) ? (
          <EmptyState />
        ) : (
          <div className="flex items-center justify-around">
            <div className="w-[120px]">
              <DonutChart segments={data.actionDistribution} size={120} thickness={20} />
            </div>
            <div className="space-y-4">
              {data.actionDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-24">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <Text className="text-sm text-gray-600">{item.label}</Text>
                  </div>
                  <Text className="text-lg font-medium">
                    {item.value.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">件</span>
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KPIカード */}
      <KPICard
        title="来店誘導率"
        value={data.visitConversionRate}
        unit="%"
        tooltip={tooltips.visitConversion}
        change={data.visitConversionRateChange}
      />
      <KPICard
        title="口コミ平均評価"
        value={data.avgRating}
        unit="pt"
        change={data.avgRatingChange}
        changeLabel="前月比"
        tooltip={tooltips.avgRating}
      />

      {/* 統合アクション内訳詳細 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="統合アクション内訳詳細" tooltip={tooltips.actionDetails} />
        {isEmpty(data.actionDetails) ? (
          <EmptyState />
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-1/2 flex-shrink-0">
              <DonutChart
                segments={data.actionDetails.map((d) => ({
                  value: d.count,
                  color: d.color,
                }))}
                size={120}
                thickness={20}
              />
            </div>
            <div className="flex-1 space-y-4">
              {data.actionDetails.map((action, index) => (
                <div key={index} className="flex flex-col gap-1 items-start w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: action.color }} />
                    <Text className="text-lg font-medium text-gray-700">{action.label}</Text>
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
        )}
      </div>

      {/* 媒体別内訳 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="媒体別内訳" tooltip={tooltips.mediaBreakdown} />
        {isEmpty(data.mediaBreakdown) ? (
          <EmptyState />
        ) : (
          <div className="flex items-center justify-around">
            <div className="w-[140px]">
              <DonutChart segments={data.mediaBreakdown} size={140} thickness={25} />
            </div>
            <div className="space-y-4">
              {data.mediaBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-28">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <Text className="text-sm text-gray-600">{item.label}</Text>
                  </div>
                  <Text className="text-lg font-medium">
                    {item.value.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">件</span>
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 曜日・時間帯傾向（recharts） */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="曜日・時間帯傾向" tooltip={tooltips.weekdayTrend} />

        <div className="mb-6">
          <Text className="text-xs text-gray-500 mb-2">曜日傾向</Text>
          {isEmpty(data.weekdayTrend) ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <RechartsBarChart data={data.weekdayTrend.map((d) => ({ name: d.day, value: d.value }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip formatter={(value) => [`${value} 件`, '']} />
                <Bar dataKey="value" fill="#D9D9D9" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <Text className="text-xs text-gray-500 mb-2">時間帯傾向</Text>
          {isEmpty(data.timeTrend) ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <RechartsBarChart data={data.timeTrend.map((d) => ({ name: d.hour, value: d.value }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={1} />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip formatter={(value) => [`${value} 件`, '']} />
                <Bar dataKey="value" fill="#00A48D" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Google検索ワード内訳 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="Google検索ワード内訳" tooltip={tooltips.searchKeywords} />
        {isEmpty(data.searchKeywords) ? (
          <EmptyState />
        ) : (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <DonutChart
                segments={data.searchKeywords.map((k) => ({
                  value: k.count,
                  color: k.color,
                }))}
                size={100}
                thickness={18}
              />
            </div>
            <div className="flex-1 space-y-1">
              {data.searchKeywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: keyword.color }}
                    />
                    <Text className="text-xs font-medium text-gray-800 truncate">{keyword.keyword}</Text>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                    <Text className="text-base font-bold text-[#00A48D]">{keyword.rank}</Text>
                    <Text className="text-[10px] font-bold text-gray-600">位</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instagram遷移元分析 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="Instagram遷移元分析" />
        {isEmpty(data.instagramSource) ? (
          <EmptyState />
        ) : (
          <div className="flex items-center justify-around">
            <div className="w-[140px]">
              <DonutChart
                segments={data.instagramSource.map((d) => ({
                  value: d.count,
                  color: d.color,
                }))}
                size={140}
                thickness={25}
              />
            </div>
            <div className="space-y-4">
              {data.instagramSource.map((source, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-28">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <Text className="text-sm text-gray-600">{source.label}</Text>
                  </div>
                  <Text className="text-lg font-medium">
                    {source.count.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">件</span>
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instagram メディア投稿一覧 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="Instagram 投稿一覧" />
        {!instagramMedia || instagramMedia.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {instagramMedia.slice(0, 6).map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-lg overflow-hidden">
                {item.media_url && (
                  <img
                    src={item.media_url}
                    alt={item.caption || 'Instagram post'}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-2">
                  <Text className="text-xs text-gray-700 line-clamp-2">{item.caption}</Text>
                  <div className="flex items-center gap-3 mt-1">
                    <Text className="text-[10px] text-gray-400">♥ {item.like_count}</Text>
                    <Text className="text-[10px] text-gray-400">💬 {item.comment_count}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 星（評価）の内訳 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="星（評価）の内訳" />
        {isEmpty(data.starDistribution) ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-1">
            {data.starDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Text className="text-xs text-gray-500 w-6">{item.star}★</Text>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full"
                    style={{ width: `${(item.count / 30) * 100}%` }}
                  />
                </div>
                <Text className="text-xs text-gray-500 w-8 text-right">{item.count}</Text>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 口コミ返信パフォーマンス */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="口コミ返信パフォーマンス" />
        {!data.reviewResponse || (data.reviewResponse.responseRate === 0 && data.reviewResponse.avgResponseTime === 0) ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex justify-around items-center py-2">
              <div className="flex flex-col items-center justify-center p-2">
                <Text className="text-xs font-bold text-gray-500 mb-2">返信率</Text>
                <div className="flex items-end">
                  <Text className="text-4xl leading-none font-bold text-wyze-primary">
                    {data.reviewResponse.responseRate}
                  </Text>
                  <Text className="text-base mb-1 ml-1 font-bold text-gray-600">%</Text>
                </div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="flex flex-col items-center justify-center p-2">
                <Text className="text-xs font-bold text-gray-500 mb-2">平均返信時間</Text>
                <div className="flex items-end">
                  <Text className="text-4xl leading-none font-bold text-wyze-primary">
                    {data.reviewResponse.avgResponseTime}
                  </Text>
                  <Text className="text-base mb-1 ml-1 font-bold text-gray-600">時間</Text>
                </div>
              </div>
            </div>
            <Text className="text-xs text-right text-gray-400 mt-1">
              （Google推奨：24時間以内）
            </Text>
          </>
        )}
      </div>

      {/* MEO順位推移（recharts） */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SectionTitle title="MEO順位推移" />
        {isEmpty(data.meoRankingHistory?.datasets) || isEmpty(data.meoRankingHistory?.labels) ? (
          <EmptyState />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <RechartsLineChart
                data={data.meoRankingHistory.labels.map((label, i) => {
                  const point: Record<string, string | number> = { name: label };
                  data.meoRankingHistory.datasets.forEach((ds) => {
                    point[ds.label] = ds.data[i] ?? 0;
                  });
                  return point;
                })}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis reversed domain={[1, 20]} tick={{ fontSize: 10 }} width={30} />
                <Tooltip />
                {data.meoRankingHistory.datasets.map((ds) => (
                  <Line
                    key={ds.label}
                    type="monotone"
                    dataKey={ds.label}
                    stroke={ds.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>

            <div className="space-y-6 mt-8">
              {[...data.meoKeywords]
                .sort((a, b) => a.rank - b.rank)
                .map((item) => {
                  const datasetIndex = data.meoKeywords.findIndex((k) => k.name === item.name);
                  const dataset = data.meoRankingHistory.datasets[datasetIndex];
                  return (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-0.5"
                          style={{ backgroundColor: dataset?.color || '#ccc' }}
                        />
                        <Text className="text-base text-gray-800">「{item.name}」</Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Text className="text-3xl font-bold leading-none" style={{ color: '#00A48D' }}>
                          {item.rank}
                        </Text>
                        <div className="flex items-end gap-1">
                          <span className="text-sm text-gray-800 mb-1">位</span>
                          <span className="text-lg text-gray-800 leading-none">（{item.change}）</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <p className="mt-4 text-xs text-gray-400 leading-relaxed">
              ※MEO順位は、店舗所在地を基準とした検索結果を表示しています。検索する場所やデバイスによって順位が異なる場合があります。
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportTab;
