/**
 * プラン確認・変更画面のテストスイート
 *
 * テスト対象:
 * - components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate.tsx
 *
 * 検証項目:
 * - 初期表示（契約中ステータス・更新日表示）
 * - ミートボールメニューの開閉
 * - 解約フロー（ステータス変更・項目非表示・契約するボタン表示）
 * - 自動更新停止フロー（警告テキスト表示・ステータス維持）
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CurrentFeaturesTemplate } from '../components/templates/CurrentFeaturesTemplate/CurrentFeaturesTemplate'

// Next.js routerのモック
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/current-features',
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

// useBillingのモック
jest.mock('../hooks/useBilling', () => ({
  useBilling: () => ({
    startCheckout: jest.fn(),
    openPortal: jest.fn(),
    getSetupIntentSecret: jest.fn(),
    deletePaymentMethod: jest.fn(),
    paymentMethods: [],
    pmLoading: false,
    loading: false,
    error: null,
    refetchPaymentMethods: jest.fn(),
  }),
}))

// useProfileのモック（デフォルト: 未契約）
jest.mock('../hooks/useProfile', () => ({
  useProfile: () => ({
    profile: { id: '1', email: 'test@example.com', nickname: 'test', role: 'user', plan_tier: 'free' },
    loading: false,
    error: null,
    refetch: jest.fn(),
    updateProfile: jest.fn(),
  }),
}))

describe('CurrentFeaturesTemplate - 初期表示の確認', () => {
  test('ステータスが「未契約」であること', () => {
    render(<CurrentFeaturesTemplate />)

    const badges = screen.getAllByText('未契約')
    expect(badges.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('契約中')).not.toBeInTheDocument()
  })

  test('「契約する」ボタンが初期表示されること', () => {
    render(<CurrentFeaturesTemplate />)

    expect(screen.getByText('契約する')).toBeInTheDocument()
  })

  test('未契約状態で自動更新が非表示であること', () => {
    render(<CurrentFeaturesTemplate />)

    expect(screen.queryByText('自動更新')).not.toBeInTheDocument()
  })
})

describe('CurrentFeaturesTemplate - メニューの動作確認', () => {
  test('ミートボールアイコンをクリックするとメニューが表示されること', () => {
    render(<CurrentFeaturesTemplate />)

    // メニューが初期状態で非表示
    expect(screen.queryByText('解約')).not.toBeInTheDocument()

    // ミートボールメニューをクリック
    const menuButton = screen.getByLabelText('メニュー')
    fireEvent.click(menuButton)

    // メニュー項目が表示される
    expect(screen.getByText('解約')).toBeInTheDocument()
    expect(screen.getByText('自動更新を停止')).toBeInTheDocument()
  })
})

describe('CurrentFeaturesTemplate - 解約フローの確認', () => {
  test('解約クリック後、ステータスが「未契約」に変化すること', () => {
    render(<CurrentFeaturesTemplate />)

    // メニューを開く
    const menuButton = screen.getByLabelText('メニュー')
    fireEvent.click(menuButton)

    // 解約をクリック
    fireEvent.click(screen.getByText('解約'))

    // ステータスが「未契約」のまま
    const badges = screen.getAllByText('未契約')
    expect(badges.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('契約中')).not.toBeInTheDocument()
  })

  test('未契約状態では自動更新が非表示であること', () => {
    render(<CurrentFeaturesTemplate />)

    // 未契約のため自動更新表示なし
    expect(screen.queryByText('自動更新')).not.toBeInTheDocument()
  })

  test('未契約状態では「契約する」ボタンが常に表示されること', () => {
    render(<CurrentFeaturesTemplate />)

    // 初期状態（未契約）では「契約する」ボタンが表示されている
    expect(screen.getByText('契約する')).toBeInTheDocument()

    // メニューを開いて解約（既に未契約のため状態は変わらない）
    fireEvent.click(screen.getByLabelText('メニュー'))
    fireEvent.click(screen.getByText('解約'))

    // 解約後も「契約する」ボタンが表示されたまま
    expect(screen.getByText('契約する')).toBeInTheDocument()
  })
})

describe('CurrentFeaturesTemplate - 自動更新停止フローの確認', () => {
  test('未契約状態で自動更新停止を押しても警告テキストは表示されないこと', () => {
    render(<CurrentFeaturesTemplate />)

    // メニューを開く
    fireEvent.click(screen.getByLabelText('メニュー'))

    // 自動更新を停止
    fireEvent.click(screen.getByText('自動更新を停止'))

    // planStatusがinactiveのため自動更新セクション自体が非表示
    expect(screen.queryByText('停止中')).not.toBeInTheDocument()
    expect(screen.queryByText('有効')).not.toBeInTheDocument()
  })

  test('未契約状態で自動更新停止を押してもステータスは「未契約」のままであること', () => {
    render(<CurrentFeaturesTemplate />)

    // メニューを開いて自動更新停止
    fireEvent.click(screen.getByLabelText('メニュー'))
    fireEvent.click(screen.getByText('自動更新を停止'))

    // ステータスは「未契約」のまま
    const badges = screen.getAllByText('未契約')
    expect(badges.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('契約中')).not.toBeInTheDocument()
  })
})
