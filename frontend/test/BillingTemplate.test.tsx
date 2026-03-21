/**
 * お支払い情報画面のテストスイート
 *
 * テスト対象:
 * - components/templates/BillingTemplate/BillingTemplate.tsx
 *
 * 検証項目:
 * - レンダリング確認（ヘッダー・カード情報・履歴リスト）
 * - 戻るボタンの動作
 * - カード変更ボタンの動作（Stripe Portal 呼び出し）
 * - PDFボタンのハンドラ呼び出し
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BillingTemplate } from '../components/templates/BillingTemplate/BillingTemplate'

// Next.js routerのモック
const mockBack = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    replace: mockReplace,
    pathname: '/billing',
    query: {},
  }),
}))

// Stripe のモック
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => null,
  useElements: () => null,
}))
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: () => Promise.resolve(null),
}))

// useBilling のモック
const mockOpenPortal = jest.fn()
jest.mock('../hooks/useBilling', () => ({
  useBilling: () => ({
    startCheckout: jest.fn(),
    openPortal: mockOpenPortal,
    getSetupIntentSecret: jest.fn(),
    deletePaymentMethod: jest.fn(),
    paymentMethods: [],
    pmLoading: false,
    loading: false,
    error: null,
    refetchPaymentMethods: jest.fn(),
    invoices: [],
    invoicesLoading: false,
    upcoming: null,
    refetchInvoices: jest.fn(),
  }),
}))

// generateReceiptPDF のモック（jsPDF によるPDF生成を回避）
const mockGenerateReceiptPDF = jest.fn()
jest.mock('../utils/generateReceipt', () => ({
  generateReceiptPDF: (...args: unknown[]) => mockGenerateReceiptPDF(...args),
}))

// useProfileのモック
jest.mock('../hooks/useProfile', () => ({
  useProfile: () => ({
    profile: { id: '1', email: 'test@example.com', nickname: 'test', role: 'user', plan_tier: 'free' },
    loading: false,
    error: null,
    refetch: jest.fn(),
    updateProfile: jest.fn(),
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
    expect(screen.getByText('**** **** **** ****')).toBeInTheDocument()
  })

  test('お支払い履歴セクションが表示されること', () => {
    render(<BillingTemplate />)

    expect(screen.getByText('お支払い履歴（請求書・領収書）')).toBeInTheDocument()
    // 実データがない場合は「履歴はありません」が表示される
    expect(screen.getByText('履歴はありません')).toBeInTheDocument()
  })

  test('次回お支払い情報が表示されること', () => {
    render(<BillingTemplate />)

    expect(screen.getByText('次回のお支払い予定はありません')).toBeInTheDocument()
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

describe('BillingTemplate - プラン選択', () => {
  test('3つのプラン（Light/Basic/Pro）が表示されること', () => {
    render(<BillingTemplate />)

    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  test('プランの月額が表示されること', () => {
    render(<BillingTemplate />)

    expect(screen.getByText('¥10,000')).toBeInTheDocument()
    expect(screen.getByText('¥29,800')).toBeInTheDocument()
    expect(screen.getByText('¥59,800')).toBeInTheDocument()
  })

  test('デフォルトで Light プランが選択されていること', () => {
    render(<BillingTemplate />)

    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toBeChecked()
    expect(radios[1]).not.toBeChecked()
    expect(radios[2]).not.toBeChecked()
  })
})

describe('BillingTemplate - カード登録・変更・キャンセルボタンの動作', () => {
  beforeEach(() => {
    mockOpenPortal.mockClear()
    mockBack.mockClear()
  })

  test('「カードを登録する」クリックでカード登録フォームが表示されること', () => {
    render(<BillingTemplate />)

    fireEvent.click(screen.getByText('カードを登録する'))

    expect(screen.getByTestId('card-element')).toBeInTheDocument()
  })

  test('「キャンセル」クリックで router.back() が呼ばれること（フォーム非表示時）', () => {
    render(<BillingTemplate />)

    fireEvent.click(screen.getByText('キャンセル'))

    expect(mockBack).toHaveBeenCalledTimes(1)
  })
})

describe('BillingTemplate - PDFボタン（実データなし時）', () => {
  test('履歴がない場合はPDFボタンが表示されないこと', () => {
    render(<BillingTemplate />)

    const pdfButtons = screen.queryAllByText('PDF')
    expect(pdfButtons.length).toBe(0)
  })
})
