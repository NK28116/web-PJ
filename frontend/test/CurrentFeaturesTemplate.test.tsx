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

describe('CurrentFeaturesTemplate - 初期表示の確認', () => {
  test('ステータスが「契約中」であること', () => {
    render(<CurrentFeaturesTemplate />)

    expect(screen.getByText('契約中')).toBeInTheDocument()
  })

  test('次回更新日が表示されていること', () => {
    render(<CurrentFeaturesTemplate />)

    expect(screen.getByText('2027/01/01 (自動更新)')).toBeInTheDocument()
  })

  test('契約期間が表示されていること', () => {
    render(<CurrentFeaturesTemplate />)

    expect(screen.getByText('契約期間')).toBeInTheDocument()
    expect(screen.getByText('2026/01/01 - 2026/12/31')).toBeInTheDocument()
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

    // ステータスが「未契約」に変化
    expect(screen.getByText('未契約')).toBeInTheDocument()
    expect(screen.queryByText('契約中')).not.toBeInTheDocument()
  })

  test('解約後、更新日と契約期間が非表示になること', () => {
    render(<CurrentFeaturesTemplate />)

    // メニューを開いて解約
    fireEvent.click(screen.getByLabelText('メニュー'))
    fireEvent.click(screen.getByText('解約'))

    // 契約期間と更新日が非表示
    expect(screen.queryByText('契約期間')).not.toBeInTheDocument()
    expect(screen.queryByText('更新日')).not.toBeInTheDocument()
  })

  test('解約後、「契約する」ボタンが表示されること', () => {
    render(<CurrentFeaturesTemplate />)

    // 初期状態では「契約する」ボタンは非表示
    expect(screen.queryByText('契約する')).not.toBeInTheDocument()

    // メニューを開いて解約
    fireEvent.click(screen.getByLabelText('メニュー'))
    fireEvent.click(screen.getByText('解約'))

    // 「契約する」ボタンが表示される
    expect(screen.getByText('契約する')).toBeInTheDocument()
  })
})

describe('CurrentFeaturesTemplate - 自動更新停止フローの確認', () => {
  test('自動更新停止後、更新日が警告テキストに変化すること', () => {
    render(<CurrentFeaturesTemplate />)

    // メニューを開く
    fireEvent.click(screen.getByLabelText('メニュー'))

    // 自動更新を停止
    fireEvent.click(screen.getByText('自動更新を停止'))

    // 更新日の表示が変化
    expect(screen.getByText('自動更新が設定されていません')).toBeInTheDocument()
    expect(screen.queryByText('2027/01/01 (自動更新)')).not.toBeInTheDocument()
  })

  test('自動更新停止後、ステータスは「契約中」のままであること', () => {
    render(<CurrentFeaturesTemplate />)

    // メニューを開いて自動更新停止
    fireEvent.click(screen.getByLabelText('メニュー'))
    fireEvent.click(screen.getByText('自動更新を停止'))

    // ステータスは「契約中」のまま
    expect(screen.getByText('契約中')).toBeInTheDocument()
    expect(screen.queryByText('未契約')).not.toBeInTheDocument()
  })
})
