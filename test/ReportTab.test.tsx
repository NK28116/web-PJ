/**
 * ReportTab コンポーネントのテストスイート
 *
 * 目的: ReportTabコンポーネントがpropsで渡されたデータを正しく表示することを保証する
 *
 * テスト対象: components/templates/ReportTemplate/ReportTab.tsx
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Textコンポーネントのモック（エイリアスパスを使用）
jest.mock('@/atoms/Text', () => ({
  Text: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

// Reportオーガニズムのモック（エイリアスパスを使用）
jest.mock('@/organisms/Report', () => ({
  SectionTitle: ({ title }: { title: string }) => <div data-testid={`section-${title}`}>{title}</div>,
  KPICard: ({ title, value, unit, change }: { title: string; value: number; unit: string; change?: string }) => (
    <div data-testid={`kpi-${title}`}>
      <span>{title}</span>
      <span>{typeof value === 'number' ? value.toLocaleString() : value}</span>
      <span>{unit}</span>
      {change && <span>{change}</span>}
    </div>
  ),
  DonutChart: ({ segments }: { segments: Array<{ value: number; color: string }> }) => (
    <div data-testid="donut-chart" data-segments={segments.length} />
  ),
}));

import ReportTab from '../components/templates/ReportTemplate/ReportTab';
import { operationalReportData } from './mock/reportMockData';

describe('ReportTab Component - Data Rendering', () => {
  /**
   * 正常系テスト: operationalReportDataでレンダリング
   *
   * 検証項目:
   * - コンポーネントが正常にレンダリングされること
   * - 「統合プロフィール閲覧総数」が表示されること
   * - KPIの数値（9,375）が正しく表示されること
   */
  test('should render KPI cards with correct values from operationalReportData', () => {
    render(<ReportTab data={operationalReportData} />);

    // 「統合プロフィール閲覧総数」セクションが表示されること
    expect(screen.getByText('統合プロフィール閲覧総数')).toBeInTheDocument();

    // KPIの数値が正しく表示されること（9,375件）
    expect(screen.getByText('9,375')).toBeInTheDocument();

    // 「統合アクション総数」セクションが表示されること
    expect(screen.getByText('統合アクション総数')).toBeInTheDocument();

    // KPIの数値が正しく表示されること（2,605件）
    expect(screen.getByText('2,605')).toBeInTheDocument();
  });

  /**
   * 正常系テスト: 来店誘導率が表示されること
   *
   * 検証項目:
   * - 「来店誘導率」が表示されること
   * - 数値（27.8%）が正しく表示されること
   */
  test('should render visit conversion rate correctly', () => {
    render(<ReportTab data={operationalReportData} />);

    expect(screen.getByText('来店誘導率')).toBeInTheDocument();
    expect(screen.getByText('27.8')).toBeInTheDocument();
  });

  /**
   * 正常系テスト: DonutChartが正しいセグメント数でレンダリングされること
   *
   * 検証項目:
   * - 統合アクション内訳のチャートが表示されること
   * - 凡例（Google, Instagram）が表示されること
   */
  test('should render action distribution with correct legends', () => {
    render(<ReportTab data={operationalReportData} />);

    // 統合アクション内訳セクション
    expect(screen.getByText('統合アクション内訳')).toBeInTheDocument();

    // 凡例が表示されること
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();

    // 各凡例の値が表示されること（同じ値が複数箇所に表示されるためgetAllByTextを使用）
    expect(screen.getByText('1,400')).toBeInTheDocument();
    expect(screen.getAllByText('1,205').length).toBeGreaterThan(0);
  });

  /**
   * 正常系テスト: 統合アクション内訳詳細が表示されること
   *
   * 検証項目:
   * - 電話、経路検索、Webアクセスが表示されること
   */
  test('should render action details correctly', () => {
    render(<ReportTab data={operationalReportData} />);

    expect(screen.getByText('統合アクション内訳詳細')).toBeInTheDocument();
    expect(screen.getByText('電話')).toBeInTheDocument();
    expect(screen.getByText('経路検索')).toBeInTheDocument();
    expect(screen.getByText('Webアクセス')).toBeInTheDocument();
  });

  /**
   * 正常系テスト: 口コミ返信パフォーマンスが表示されること
   *
   * 検証項目:
   * - 返信率と平均返信時間が表示されること
   */
  test('should render review response performance correctly', () => {
    render(<ReportTab data={operationalReportData} />);

    expect(screen.getByText('口コミ返信パフォーマンス')).toBeInTheDocument();
    expect(screen.getByText('返信率')).toBeInTheDocument();
    expect(screen.getByText('96.2')).toBeInTheDocument();
    expect(screen.getByText('平均返信時間')).toBeInTheDocument();
    expect(screen.getByText('10.4')).toBeInTheDocument();
  });

  /**
   * 正常系テスト: Google検索ワード内訳が表示されること
   *
   * 検証項目:
   * - 検索ワードとランキングが表示されること
   */
  test('should render search keywords correctly', () => {
    render(<ReportTab data={operationalReportData} />);

    expect(screen.getByText('Google検索ワード内訳')).toBeInTheDocument();
    expect(screen.getByText("Kento's Burger")).toBeInTheDocument();
    expect(screen.getByText('中目黒ハンバーガー')).toBeInTheDocument();
  });

  /**
   * 正常系テスト: Instagram遷移元分析が表示されること
   *
   * 検証項目:
   * - フィード投稿、リール動画、ストーリーズなどが表示されること
   */
  test('should render Instagram source analysis correctly', () => {
    render(<ReportTab data={operationalReportData} />);

    expect(screen.getByText('Instagram遷移元分析')).toBeInTheDocument();
    expect(screen.getByText('フィード投稿')).toBeInTheDocument();
    expect(screen.getByText('リール動画')).toBeInTheDocument();
    expect(screen.getByText('ストーリーズ')).toBeInTheDocument();
    expect(screen.getByText('その他(タグ等)')).toBeInTheDocument();
  });

  /**
   * 正常系テスト: MEO順位推移が表示されること
   *
   * 検証項目:
   * - MEO順位推移セクションが表示されること
   * - キーワード名が表示されること
   */
  test('should render MEO ranking history correctly', () => {
    render(<ReportTab data={operationalReportData} />);

    expect(screen.getByText('MEO順位推移')).toBeInTheDocument();
    expect(screen.getByText('「中目黒レストラン」')).toBeInTheDocument();
    expect(screen.getByText('「中目黒ランチ」')).toBeInTheDocument();
    expect(screen.getByText('「中目黒ハンバーガー」')).toBeInTheDocument();
  });

  /**
   * 正常系テスト: 変化率（Change）が正しく表示されること
   *
   * 検証項目:
   * - +25%などの変化率が表示されること
   */
  test('should render change percentages correctly', () => {
    render(<ReportTab data={operationalReportData} />);

    // 変化率が表示されること
    expect(screen.getAllByText('+25%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+29%').length).toBeGreaterThan(0);
  });
});
