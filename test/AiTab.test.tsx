/**
 * AiTab コンポーネントのテストスイート
 *
 * 目的: AiTabコンポーネントが正しくレンダリングされることを保証する
 *
 * テスト対象: components/templates/ReportTemplate/AiTab.tsx
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AiTab from '../components/templates/ReportTemplate/AiTab'

describe('AiTab Component', () => {
  /**
   * 正常系テスト: "COMING SOON..."のテキストが表示されること
   *
   * 検証項目:
   * - コンポーネントが正常にレンダリングされること
   * - "COMING SOON..."のテキストが大文字小文字を区別せずに表示されること
   * - font-kdam-thmor-proフォントで32ptのサイズで表示されること
   * - #00A48Dの色で表示されること
   */
  test('renders the "COMING SOON..." message', () => {
    render(<AiTab />)
    const comingSoonElement = screen.getByText(/coming soon.../i)
    expect(comingSoonElement).toBeInTheDocument()
    expect(comingSoonElement).toHaveClass('font-kdam-thmor-pro')
    expect(comingSoonElement).toHaveClass('text-[32pt]')
    expect(comingSoonElement).toHaveClass('text-[#00A48D]')
  })

  /**
   * 正常系テスト: "現在開発中です。"のテキストが表示されること
   *
   * 検証項目:
   * - "現在開発中です。"のテキストが正確に表示されること
   * - font-tiro-teleguフォントで14ptのサイズで表示されること
   * - 黒色(text-black)で表示されること
   */
  test('renders the "現在開発中です。" message', () => {
    render(<AiTab />)
    const developmentMessageElement = screen.getByText('現在開発中です。')
    expect(developmentMessageElement).toBeInTheDocument()
    expect(developmentMessageElement).toHaveClass('font-tiro-telugu')
    expect(developmentMessageElement).toHaveClass('text-[14pt]')
    expect(developmentMessageElement).toHaveClass('text-black')
  })

  /**
   * 正常系テスト: コンポーネントの構造が正しいこと
   *
   * 検証項目:
   * - ルート要素が適切なレイアウトクラスを持つこと
   * - flexboxで中央配置されていること
   */
  test('renders with correct layout structure', () => {
    const { container } = render(<AiTab />)
    const rootDiv = container.firstChild as HTMLElement

    expect(rootDiv).toHaveClass('flex')
    expect(rootDiv).toHaveClass('h-full')
    expect(rootDiv).toHaveClass('flex-col')
    expect(rootDiv).toHaveClass('items-center')
    expect(rootDiv).toHaveClass('justify-center')
    expect(rootDiv).toHaveClass('text-center')
  })

  /**
   * 異常系テスト: コンポーネントが空の内容を表示しないこと
   *
   * 検証項目:
   * - レンダリング後、必ずテキストコンテンツが存在すること
   */
  test('does not render empty content', () => {
    const { container } = render(<AiTab />)
    expect(container.textContent).not.toBe('')
    expect(container.textContent).toContain('COMING SOON')
    expect(container.textContent).toContain('現在開発中です')
  })
})
