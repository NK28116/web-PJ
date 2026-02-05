/**
 * ReportTemplate コンポーネントのテストスイート
 *
 * 目的: ReportTemplateコンポーネントのタブ切り替え機能が正しく動作することを保証する
 *
 * テスト対象: components/templates/ReportTemplate/ReportTemplate.tsx
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReportTemplate } from '../components/templates/ReportTemplate/ReportTemplate'

// BaseTemplateのモック
jest.mock('../components/templates/BaseTemplate', () => ({
  BaseTemplate: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// AiTabコンポーネントのモック
jest.mock('../components/templates/ReportTemplate/AiTab', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="ai-tab">
      <p className="font-kdam-thmor-pro text-[32pt] text-[#00A48D]">COMING SOON...</p>
      <p className="font-tiro-telugu text-[14pt] text-black">現在開発中です。</p>
    </div>
  ),
}))

// ReportTabコンポーネントのモック
jest.mock('../components/templates/ReportTemplate/ReportTab', () => ({
  __esModule: true,
  default: ({ data }: { data: unknown }) => (
    <div data-testid="report-tab">
      レポート内容
      {data && <span data-testid="has-data">データあり</span>}
    </div>
  ),
}))

describe('ReportTemplate Component - Tab Switching Functionality', () => {
  /**
   * 正常系テスト: レポートタブの初期表示
   *
   * 検証項目:
   * - ページを開いたとき、デフォルトで「運用実績レポート」タブがアクティブであること
   * - レポートタブの内容が表示されていること
   * - AIタブの内容が表示されていないこと
   */
  test('should display report tab by default on initial render', () => {
    render(<ReportTemplate />)

    // レポートタブボタンが存在すること
    const reportTabButton = screen.getByText('運用実績レポート')
    expect(reportTabButton).toBeInTheDocument()

    // レポートタブがアクティブ状態であること（緑色のボーダー）
    expect(reportTabButton).toHaveClass('text-[#00A48D]')
    expect(reportTabButton).toHaveClass('border-[#00A48D]')

    // レポートタブの内容が表示されていること
    const reportTabContent = screen.getByTestId('report-tab')
    expect(reportTabContent).toBeInTheDocument()
    expect(reportTabContent).toHaveTextContent('レポート内容')

    // AIタブの内容が表示されていないこと
    const aiTabContent = screen.queryByTestId('ai-tab')
    expect(aiTabContent).not.toBeInTheDocument()
  })

  /**
   * 正常系テスト: AIタブへの切り替え
   *
   * 検証項目:
   * - 「AI分析」タブをクリックすると、画面の内容が切り替わること
   * - AIタブがアクティブ状態になること
   * - AIタブの内容が表示されること
   * - レポートタブの内容が非表示になること
   */
  test('should switch to AI tab when AI tab button is clicked', () => {
    render(<ReportTemplate />)

    // AIタブボタンをクリック
    const aiTabButton = screen.getByText('AI分析')
    fireEvent.click(aiTabButton)

    // AIタブがアクティブ状態であること
    expect(aiTabButton).toHaveClass('text-[#00A48D]')
    expect(aiTabButton).toHaveClass('border-[#00A48D]')

    // AIタブの内容が表示されていること
    const aiTabContent = screen.getByTestId('ai-tab')
    expect(aiTabContent).toBeInTheDocument()

    // レポートタブの内容が非表示になっていること
    const reportTabContent = screen.queryByTestId('report-tab')
    expect(reportTabContent).not.toBeInTheDocument()
  })

  /**
   * 正常系テスト: AIタブの表示内容
   *
   * 検証項目:
   * - "COMING SOON..." というテキストが表示されていること
   * - "COMING SOON..." のフォントが `Kdam Thmor Pro` になっていること
   * - "COMING SOON..." の文字色が緑色 (#00A48D) になっていること
   * - "現在開発中です。" というテキストが表示されていること
   * - "現在開発中です。" のフォントが `Tiro Telugu` になっていること
   * - "現在開発中です。" の文字色が黒色になっていること
   */
  test('should display correct content in AI tab with proper styling', () => {
    render(<ReportTemplate />)

    // AIタブボタンをクリック
    const aiTabButton = screen.getByText('AI分析')
    fireEvent.click(aiTabButton)

    // "COMING SOON..." テキストの検証
    const comingSoonText = screen.getByText(/COMING SOON.../i)
    expect(comingSoonText).toBeInTheDocument()
    expect(comingSoonText).toHaveClass('font-kdam-thmor-pro')
    expect(comingSoonText).toHaveClass('text-[32pt]')
    expect(comingSoonText).toHaveClass('text-[#00A48D]')

    // "現在開発中です。" テキストの検証
    const developmentText = screen.getByText('現在開発中です。')
    expect(developmentText).toBeInTheDocument()
    expect(developmentText).toHaveClass('font-tiro-telugu')
    expect(developmentText).toHaveClass('text-[14pt]')
    expect(developmentText).toHaveClass('text-black')
  })

  /**
   * 正常系テスト: レポートタブへの再切り替え
   *
   * 検証項目:
   * - AIタブ表示中に再度「運用実績レポート」タブをクリックすると、元のレポート画面に戻ること
   * - レポートタブがアクティブ状態になること
   * - レポートタブの内容が表示されること
   * - AIタブの内容が非表示になること
   */
  test('should switch back to report tab when report tab button is clicked again', () => {
    render(<ReportTemplate />)

    // AIタブへ切り替え
    const aiTabButton = screen.getByText('AI分析')
    fireEvent.click(aiTabButton)

    // AIタブが表示されていることを確認
    expect(screen.getByTestId('ai-tab')).toBeInTheDocument()

    // レポートタブボタンをクリックして戻る
    const reportTabButton = screen.getByText('運用実績レポート')
    fireEvent.click(reportTabButton)

    // レポートタブがアクティブ状態であること
    expect(reportTabButton).toHaveClass('text-[#00A48D]')
    expect(reportTabButton).toHaveClass('border-[#00A48D]')

    // レポートタブの内容が表示されていること
    const reportTabContent = screen.getByTestId('report-tab')
    expect(reportTabContent).toBeInTheDocument()
    expect(reportTabContent).toHaveTextContent('レポート内容')

    // AIタブの内容が非表示になっていること
    const aiTabContent = screen.queryByTestId('ai-tab')
    expect(aiTabContent).not.toBeInTheDocument()
  })

  /**
   * 正常系テスト: タブの複数回切り替え
   *
   * 検証項目:
   * - タブを複数回切り替えても正しく動作すること
   * - 各タブクリックで適切なコンテンツが表示されること
   */
  test('should handle multiple tab switches correctly', () => {
    render(<ReportTemplate />)

    const reportTabButton = screen.getByText('運用実績レポート')
    const aiTabButton = screen.getByText('AI分析')

    // 初期状態: レポートタブ
    expect(screen.getByTestId('report-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-tab')).not.toBeInTheDocument()

    // 1回目: AIタブへ
    fireEvent.click(aiTabButton)
    expect(screen.getByTestId('ai-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('report-tab')).not.toBeInTheDocument()

    // 2回目: レポートタブへ
    fireEvent.click(reportTabButton)
    expect(screen.getByTestId('report-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-tab')).not.toBeInTheDocument()

    // 3回目: AIタブへ
    fireEvent.click(aiTabButton)
    expect(screen.getByTestId('ai-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('report-tab')).not.toBeInTheDocument()

    // 4回目: レポートタブへ
    fireEvent.click(reportTabButton)
    expect(screen.getByTestId('report-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-tab')).not.toBeInTheDocument()
  })

  /**
   * 異常系テスト: タブボタンが存在すること
   *
   * 検証項目:
   * - 「運用実績レポート」タブボタンが存在すること
   * - 「AI分析」タブボタンが存在すること
   */
  test('should render both tab buttons', () => {
    render(<ReportTemplate />)

    const reportTabButton = screen.getByText('運用実績レポート')
    const aiTabButton = screen.getByText('AI分析')

    expect(reportTabButton).toBeInTheDocument()
    expect(aiTabButton).toBeInTheDocument()
  })

  /**
   * 異常系テスト: タブが同時に表示されないこと
   *
   * 検証項目:
   * - レポートタブとAIタブが同時に表示されないこと
   */
  test('should not display both tabs simultaneously', () => {
    render(<ReportTemplate />)

    // 初期状態
    expect(screen.getByTestId('report-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-tab')).not.toBeInTheDocument()

    // AIタブに切り替え
    const aiTabButton = screen.getByText('AI分析')
    fireEvent.click(aiTabButton)

    expect(screen.getByTestId('ai-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('report-tab')).not.toBeInTheDocument()
  })

  /**
   * 異常系テスト: 期間選択コンポーネントが表示されること
   *
   * 検証項目:
   * - 期間選択機能が両方のタブで利用可能であること
   * - タブ切り替え時も期間選択が維持されること
   */
  test('should display period selector in both tabs', () => {
    render(<ReportTemplate />)

    // 期間選択のデフォルト値を確認（先月）
    const periodSelector = screen.getByText('先月')
    expect(periodSelector).toBeInTheDocument()

    // AIタブに切り替えても期間選択は表示されたまま
    const aiTabButton = screen.getByText('AI分析')
    fireEvent.click(aiTabButton)

    expect(screen.getByText('先月')).toBeInTheDocument()
  })
})
