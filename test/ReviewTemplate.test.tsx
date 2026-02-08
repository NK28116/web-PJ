/**
 * Review機能のテストスイート
 *
 * 目的: /reviewルートとReviewTemplate、Headerコンポーネントの口コミ・返信タブが正しく動作することを保証する
 *
 * テスト対象:
 * - pages/review.tsx
 * - components/templates/ReviewTemplate/ReviewTemplate.tsx
 * - components/organisms/Header/Header.tsx
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReviewTemplate } from '../components/templates/ReviewTemplate/ReviewTemplate'
import { Header } from '../components/organisms/Header/Header'

// Next.js routerのモック
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/review',
  }),
}))

// BaseTemplateのモック
jest.mock('../components/templates/BaseTemplate', () => ({
  BaseTemplate: ({ children, activeTab, customTabLabels }: { 
    children: React.ReactNode; 
    activeTab?: string;
    customTabLabels?: { [key: string]: string };
  }) => (
    <div data-testid="base-template" data-active-tab={activeTab}>
      {customTabLabels && (
        <span data-testid="custom-labels">{JSON.stringify(customTabLabels)}</span>
      )}
      {children}
    </div>
  ),
}))

// SideMenuのモック
jest.mock('../components/organisms/SideMenu', () => ({
  SideMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="side-menu">{children}</div>
  ),
}))

describe('Review機能 - ルーティングテスト', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  /**
   * 正常系テスト: /reviewルートでReviewTemplateが読み込まれること
   *
   * 検証項目:
   * - ReviewTemplateコンポーネントが正しくレンダリングされること
   * - activeTabが'review'に設定されていること
   */
  test('should load ReviewTemplate component correctly for /review route', () => {
    render(<ReviewTemplate />)

    // BaseTemplateが正しいactiveTabで呼び出されていること
    const baseTemplate = screen.getByTestId('base-template')
    expect(baseTemplate).toBeInTheDocument()
    expect(baseTemplate).toHaveAttribute('data-active-tab', 'review')
  })

  /**
   * 正常系テスト: customTabLabelsで'口コミ・返信'が設定されていること
   *
   * 検証項目:
   * - customTabLabelsに'review': '口コミ・返信'が含まれていること
   */
  test('should set customTabLabels with review label as 口コミ・返信', () => {
    render(<ReviewTemplate />)

    const customLabels = screen.getByTestId('custom-labels')
    expect(customLabels).toHaveTextContent('口コミ・返信')
  })
})

describe('Header Component - 口コミ・返信タブテスト', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  /**
   * 正常系テスト: Headerに'口コミ・返信'タブが表示されること
   *
   * 検証項目:
   * - '口コミ・返信'というラベルのタブボタンが存在すること
   */
  test('should display 口コミ・返信 tab in Header', () => {
    render(<Header activeTab="home" />)

    const reviewTab = screen.getByText('口コミ・返信')
    expect(reviewTab).toBeInTheDocument()
  })

  /**
   * 正常系テスト: '口コミ・返信'タブクリックで/reviewに遷移すること
   *
   * 検証項目:
   * - '口コミ・返信'タブをクリックするとrouter.push('/review')が呼ばれること
   */
  test('should navigate to /review when clicking 口コミ・返信 tab', () => {
    render(<Header activeTab="home" />)

    const reviewTab = screen.getByText('口コミ・返信')
    fireEvent.click(reviewTab)

    expect(mockPush).toHaveBeenCalledWith('/review')
  })

  /**
   * 正常系テスト: activeTab='review'の時にreviewタブがアクティブ表示されること
   *
   * 検証項目:
   * - activeTab='review'の時、reviewタブにアクティブインジケーターが表示されること
   */
  test('should show active indicator when activeTab is review', () => {
    const { container } = render(<Header activeTab="review" />)

    // アクティブインジケーターを持つタブを確認
    // reviewタブがアクティブの場合、アクティブインジケーター（緑色のバー）が表示される
    // 幅45pxの緑色のインジケーターが存在することを確認
    const activeIndicator = container.querySelector('div.w-\\[45px\\]')
    
    expect(activeIndicator).toBeInTheDocument()
  })

  /**
   * 正常系テスト: onTabChangeコールバックが正しく呼ばれること
   *
   * 検証項目:
   * - '口コミ・返信'タブクリック時にonTabChangeが'review'で呼ばれること
   */
  test('should call onTabChange with review when clicking 口コミ・返信 tab', () => {
    const mockOnTabChange = jest.fn()
    render(<Header activeTab="home" onTabChange={mockOnTabChange} />)

    const reviewTab = screen.getByText('口コミ・返信')
    fireEvent.click(reviewTab)

    expect(mockOnTabChange).toHaveBeenCalledWith('review')
  })

  /**
   * 正常系テスト: customTabLabelsでreviewタブのラベルをカスタマイズできること
   *
   * 検証項目:
   * - customTabLabelsを指定するとタブラベルが変更されること
   */
  test('should use custom label when customTabLabels is provided', () => {
    render(<Header activeTab="review" customTabLabels={{ 'review': 'カスタムラベル' }} />)

    const customLabel = screen.getByText('カスタムラベル')
    expect(customLabel).toBeInTheDocument()
  })
})

describe('activeTab prop - review値の処理テスト', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  /**
   * 正常系テスト: HeaderコンポーネントがactiveTab='review'を正しく処理すること
   *
   * 検証項目:
   * - activeTab='review'が型として有効であること
   * - 他のタブに切り替え可能であること
   */
  test('should correctly handle activeTab review value in Header', () => {
    render(<Header activeTab="review" />)

    // reviewタブが存在し、他のタブもクリック可能
    // ホームタブはタブナビゲーション内のボタンを取得（サイドメニューにも同じテキストがあるため role で絞り込み）
    const homeTabs = screen.getAllByText('ホーム')
    // タブ内のボタン要素を取得（最初の要素がタブナビゲーション内のボタン）
    const homeTabButton = homeTabs.find(el => el.tagName === 'BUTTON')
    
    expect(homeTabButton).toBeInTheDocument()
    fireEvent.click(homeTabButton!)

    expect(mockPush).toHaveBeenCalledWith('/home')
  })

  /**
   * 正常系テスト: 全タブ間の遷移が正しく動作すること
   *
   * 検証項目:
   * - home, post, report, reviewの4つのタブ全てがクリック可能であること
   * - 各タブクリック時に正しいルートへ遷移すること
   */
  test('should navigate correctly between all tabs including review', () => {
    render(<Header activeTab="review" />)

    // ヘルパー関数：タブナビゲーション内のボタンを取得
    const getTabButton = (text: string) => {
      const elements = screen.getAllByText(text)
      return elements.find(el => el.tagName === 'BUTTON')!
    }

    // ホームタブ
    fireEvent.click(getTabButton('ホーム'))
    expect(mockPush).toHaveBeenCalledWith('/home')

    // 投稿タブ
    fireEvent.click(getTabButton('投稿'))
    expect(mockPush).toHaveBeenCalledWith('/post')

    // レポートタブ
    fireEvent.click(getTabButton('レポート'))
    expect(mockPush).toHaveBeenCalledWith('/report')

    // 口コミ・返信タブ
    fireEvent.click(getTabButton('口コミ・返信'))
    expect(mockPush).toHaveBeenCalledWith('/review')
  })
})

describe('旧機能の非存在確認テスト - auto-reply/replyの参照がないこと', () => {
  /**
   * 確認テスト: Headerのtabs配列にauto-replyやreply（review以外）が含まれていないこと
   *
   * 検証項目:
   * - 'auto-reply'という文字列がタブに存在しないこと
   * - 'reply'という単独のタブIDが存在しないこと（'review'のみが正しい）
   */
  test('should not have auto-reply tab in Header', () => {
    render(<Header activeTab="home" />)

    // auto-replyやreplyという単独タブが存在しないことを確認
    const autoReplyTab = screen.queryByText('auto-reply')
    const autoReplyTabJp = screen.queryByText('自動返信')
    
    expect(autoReplyTab).not.toBeInTheDocument()
    expect(autoReplyTabJp).not.toBeInTheDocument()
  })

  /**
   * 確認テスト: ReviewTemplateにauto-reply機能が含まれていないこと
   *
   * 検証項目:
   * - ReviewTemplate内に'自動返信'というテキストが存在しないこと
   * - ReviewTemplate内に'auto-reply'というテキストが存在しないこと
   */
  test('should not have auto-reply functionality in ReviewTemplate', () => {
    render(<ReviewTemplate />)

    // 自動返信関連のテキストが存在しないことを確認
    const autoReplyText = screen.queryByText(/自動返信/)
    const autoReplyTextEn = screen.queryByText(/auto-reply/i)
    
    expect(autoReplyText).not.toBeInTheDocument()
    expect(autoReplyTextEn).not.toBeInTheDocument()
  })

  /**
   * 確認テスト: タブリストが正しい4つのタブのみを含むこと
   *
   * 検証項目:
   * - ホーム、投稿、レポート、口コミ・返信の4タブのみが存在すること
   */
  test('should only have home, post, report, and review tabs', () => {
    render(<Header activeTab="home" />)

    // ヘルパー関数：タブナビゲーション内のボタンを取得
    const getTabButton = (text: string) => {
      const elements = screen.getAllByText(text)
      return elements.find(el => el.tagName === 'BUTTON')
    }

    // 正しい4つのタブが存在（ボタンとして存在することを確認）
    expect(getTabButton('ホーム')).toBeInTheDocument()
    expect(getTabButton('投稿')).toBeInTheDocument()
    expect(getTabButton('レポート')).toBeInTheDocument()
    expect(getTabButton('口コミ・返信')).toBeInTheDocument()

    // 旧タブが存在しない（ボタンとして）
    const replyOnlyElements = screen.queryAllByText(/^返信$/)
    const replyButtons = replyOnlyElements.filter(el => el.tagName === 'BUTTON')
    expect(replyButtons.length).toBe(0) // '口コミ・返信'は含まれるが'返信'単独タブは含まれない
    expect(screen.queryByText(/^reply$/i)).not.toBeInTheDocument()
  })
})

describe('ReviewTemplate Component - コンテンツ表示テスト', () => {
  /**
   * 正常系テスト: ReviewTemplateの統計情報が表示されること
   *
   * 検証項目:
   * - 未返信口コミ数が表示されていること
   * - 総合評価が表示されていること
   * - 返信率が表示されていること
   * - 平均返信時間が表示されていること
   */
  test('should display statistics in ReviewTemplate', () => {
    render(<ReviewTemplate />)

    expect(screen.getByText('未返信口コミ数')).toBeInTheDocument()
    expect(screen.getByText('総合評価')).toBeInTheDocument()
    expect(screen.getByText('返信率（％）')).toBeInTheDocument()
    expect(screen.getByText('平均返信時間')).toBeInTheDocument()
  })

  /**
   * 正常系テスト: 口コミ一覧が表示されること
   *
   * 検証項目:
   * - 口コミデータが表示されていること
   * - 返信するボタンが表示されていること
   */
  test('should display review list in ReviewTemplate', () => {
    render(<ReviewTemplate />)

    // ダミーデータの口コミが表示されている
    expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
    expect(screen.getByText('田中 健太')).toBeInTheDocument()
    
    // 返信ボタンが表示されている
    const replyButtons = screen.getAllByText('返信する')
    expect(replyButtons.length).toBeGreaterThan(0)
  })
})
