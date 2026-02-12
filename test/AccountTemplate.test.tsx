/**
 * アカウント情報画面のテストスイート
 *
 * テスト対象:
 * - components/templates/AccountTemplate/AccountTemplate.tsx
 *
 * 検証項目:
 * - レンダリング確認（プロフィール・オーナー・通知セクション）
 * - モックデータの値が正しく表示されていること
 * - 通知トグルのON/OFF切り替え
 * - 戻るボタンの動作
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AccountTemplate } from '../components/templates/AccountTemplate/AccountTemplate'

// Next.js routerのモック
const mockBack = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    pathname: '/account',
  }),
}))

// BaseTemplateのモック
jest.mock('../components/templates/BaseTemplate', () => ({
  BaseTemplate: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="base-template">{children}</div>
  ),
}))

// SideMenuのモック
jest.mock('../components/organisms/SideMenu', () => ({
  SideMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="side-menu">{children}</div>
  ),
}))

describe('AccountTemplate - レンダリング確認', () => {
  test('ヘッダーに「店舗・アカウント設定」が表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('店舗・アカウント設定')).toBeInTheDocument()
  })

  test('店舗プロフィール情報セクションが表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('店舗プロフィール情報')).toBeInTheDocument()
  })

  test('オーナーアカウント設定セクションが表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('オーナーアカウント設定')).toBeInTheDocument()
  })

  test('通知設定セクションが表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('通知設定')).toBeInTheDocument()
  })
})

describe('AccountTemplate - 値の表示確認', () => {
  test('店舗名が表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('サンプル店舗 渋谷店')).toBeInTheDocument()
  })

  test('住所が表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('東京都渋谷区神南1-2-3')).toBeInTheDocument()
  })

  test('電話番号が表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('03-1234-5678')).toBeInTheDocument()
  })

  test('担当者名が表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('山田 太郎')).toBeInTheDocument()
  })

  test('メールアドレスが表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('taro.yamada@example.com')).toBeInTheDocument()
  })

  test('パスワードがマスクされて表示されること', () => {
    render(<AccountTemplate />)
    expect(screen.getByText('********')).toBeInTheDocument()
  })
})

describe('AccountTemplate - トグル動作', () => {
  test('月次レポートのトグルをクリックするとOFFに切り替わること', () => {
    render(<AccountTemplate />)

    const toggle = screen.getByRole('switch', { name: '月次レポート' })
    // 初期値: ON
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(toggle)
    // OFF に切り替わる
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  test('競合変動アラートのトグルをクリックするとONに切り替わること', () => {
    render(<AccountTemplate />)

    const toggle = screen.getByRole('switch', { name: '競合変動アラート' })
    // 初期値: OFF
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(toggle)
    // ON に切り替わる
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  test('通知設定の3項目が全て表示されること', () => {
    render(<AccountTemplate />)

    expect(screen.getByText('月次レポート')).toBeInTheDocument()
    expect(screen.getByText('競合変動アラート')).toBeInTheDocument()
    expect(screen.getByText('低評価口コミアラート')).toBeInTheDocument()
  })
})

describe('AccountTemplate - 戻るボタン', () => {
  beforeEach(() => {
    mockBack.mockClear()
  })

  test('「店舗・アカウント設定」クリックで router.back() が呼ばれること', () => {
    render(<AccountTemplate />)

    const backButton = screen.getByText('店舗・アカウント設定').closest('button')!
    fireEvent.click(backButton)

    expect(mockBack).toHaveBeenCalledTimes(1)
  })
})
