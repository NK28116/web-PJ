/**
 * お支払い情報画面のテストスイート
 *
 * テスト対象:
 * - components/templates/BillingTemplate/BillingTemplate.tsx
 *
 * 検証項目:
 * - レンダリング確認（ヘッダー・カード情報・履歴リスト）
 * - 戻るボタンの動作
 * - カード編集モーダルの開閉
 * - PDFボタンのハンドラ呼び出し
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BillingTemplate } from '../components/templates/BillingTemplate/BillingTemplate'

// Next.js routerのモック
const mockBack = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    pathname: '/billing',
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

describe('BillingTemplate - レンダリング確認', () => {
  test('ヘッダーに「お支払い情報」が表示されること', () => {
    render(<BillingTemplate />)

    expect(screen.getByText('お支払い情報')).toBeInTheDocument()
  })

  test('カード情報セクションが表示されること', () => {
    render(<BillingTemplate />)

    expect(screen.getByText('登録クレジットカード情報')).toBeInTheDocument()
    expect(screen.getByText('**** **** **** 1234')).toBeInTheDocument()
  })

  test('お支払い履歴が表示されること', () => {
    render(<BillingTemplate />)

    expect(screen.getByText('お支払い履歴（請求書・領収書）')).toBeInTheDocument()
    expect(screen.getByText('2026/01/01')).toBeInTheDocument()
    expect(screen.getByText('2025/12/01')).toBeInTheDocument()
    expect(screen.getByText('2025/11/01')).toBeInTheDocument()
  })

  test('金額がカンマ区切り円マーク付きで表示されること', () => {
    render(<BillingTemplate />)

    const amounts = screen.getAllByText('¥33,000')
    expect(amounts.length).toBeGreaterThanOrEqual(3)
  })

  test('次回お支払い情報が表示されること', () => {
    render(<BillingTemplate />)

    expect(screen.getByText(/次回のお支払い：2026\/02\/01/)).toBeInTheDocument()
  })
})

describe('BillingTemplate - 戻るボタン', () => {
  beforeEach(() => {
    mockBack.mockClear()
  })

  test('「お支払い情報」クリックで router.back() が呼ばれること', () => {
    render(<BillingTemplate />)

    const backButton = screen.getByText('お支払い情報').closest('button')!
    fireEvent.click(backButton)

    expect(mockBack).toHaveBeenCalledTimes(1)
  })
})

describe('BillingTemplate - モーダル動作', () => {
  test('「カード情報を変更する」クリックでモーダルが開くこと', () => {
    render(<BillingTemplate />)

    // モーダルが初期状態で非表示
    expect(screen.queryByText('カード情報の変更')).not.toBeInTheDocument()

    // ボタンクリック
    fireEvent.click(screen.getByText('カード情報を変更する'))

    // モーダルが表示される
    expect(screen.getByText('カード情報の変更')).toBeInTheDocument()
    expect(screen.getByText('保存する')).toBeInTheDocument()
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  test('「キャンセル」クリックでモーダルが閉じること', () => {
    render(<BillingTemplate />)

    // モーダルを開く
    fireEvent.click(screen.getByText('カード情報を変更する'))
    expect(screen.getByText('カード情報の変更')).toBeInTheDocument()

    // キャンセルでモーダルを閉じる
    fireEvent.click(screen.getByText('キャンセル'))
    expect(screen.queryByText('カード情報の変更')).not.toBeInTheDocument()
  })

  test('「保存する」クリックでモーダルが閉じること', () => {
    render(<BillingTemplate />)

    // モーダルを開く
    fireEvent.click(screen.getByText('カード情報を変更する'))

    // 保存でモーダルを閉じる
    fireEvent.click(screen.getByText('保存する'))
    expect(screen.queryByText('カード情報の変更')).not.toBeInTheDocument()
  })

  test('オーバーレイクリックでモーダルが閉じること', () => {
    render(<BillingTemplate />)

    // モーダルを開く
    fireEvent.click(screen.getByText('カード情報を変更する'))
    expect(screen.getByText('カード情報の変更')).toBeInTheDocument()

    // オーバーレイ（モーダル背景）をクリック
    const overlay = screen.getByText('カード情報の変更').closest('.bg-white')!.parentElement!
    fireEvent.click(overlay)
    expect(screen.queryByText('カード情報の変更')).not.toBeInTheDocument()
  })
})

describe('BillingTemplate - PDFボタン', () => {
  test('「領収書 / PDF」ボタンがセクションタイトル横に1つだけ表示されること', () => {
    render(<BillingTemplate />)

    const pdfButtons = screen.getAllByText('領収書 / PDF')
    expect(pdfButtons).toHaveLength(1)
  })

  test('「領収書 / PDF」クリックで領収書形式のログ出力とalertが行われること', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation()
    render(<BillingTemplate />)

    fireEvent.click(screen.getByText('領収書 / PDF'))

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    const output = consoleSpy.mock.calls[0][0] as string
    expect(output).toContain('領収書.pdf')
    expect(output).toContain('2026年01月01日 ¥33,000')
    expect(output).toContain('合計')
    expect(output).toContain('¥99,000')
    expect(alertSpy).toHaveBeenCalledWith('領収書(PDF)を出力しました。コンソールを確認してください。')
    consoleSpy.mockRestore()
    alertSpy.mockRestore()
  })
})
