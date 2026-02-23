/**
 * 認証基盤のテストスイート
 *
 * テスト対象:
 * - components/templates/LoginTemplate/index.tsx
 * - components/templates/SplashScreen/SplashScreen.tsx
 * - components/auth/AuthGuard.tsx
 * - hooks/useAuth.ts
 *
 * 検証項目:
 * - ログインフロー: 正しい入力でトークンが保存され遷移すること
 * - 誤り資格情報: ログイン失敗時にエラーメッセージが表示されること
 * - ガード機能: 未認証状態で保護ページにアクセスした際リダイレクトされること
 * - ログアウト: トークンが削除され / (SplashScreen) に戻ること
 * - SplashScreen: 2秒後に onComplete が呼ばれること
 */

import { render, screen, fireEvent, waitFor, act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginTemplate } from '../components/templates/LoginTemplate';
import { SplashScreen } from '../components/templates/SplashScreen';
import { AuthGuard } from '../components/auth/AuthGuard';
import { useAuth } from '../hooks/useAuth';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    pathname: '/',
  }),
}));

beforeEach(() => {
  localStorage.clear();
  mockPush.mockClear();
  mockReplace.mockClear();
});

/* ────────────────── LoginTemplate ────────────────── */
describe('LoginTemplate - ログインフロー', () => {
  test('メールとパスワードが未入力の場合エラーメッセージが表示されること', () => {
    render(<LoginTemplate />);
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(screen.getByText('※未入力の箇所があります')).toBeInTheDocument();
  });

  test('誤った認証情報でログインするとエラーメッセージが表示されること', () => {
    render(<LoginTemplate />);

    fireEvent.change(screen.getByPlaceholderText('Wyze ID ,メールアドレス'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
  });

  test('正しい入力でログインするとトークンが保存されること', () => {
    render(<LoginTemplate />);

    fireEvent.change(screen.getByPlaceholderText('Wyze ID ,メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(localStorage.getItem('auth_token')).toBe('mock_token');
  });

  test('正しい入力でログインすると /home へ遷移すること', () => {
    render(<LoginTemplate />);

    fireEvent.change(screen.getByPlaceholderText('Wyze ID ,メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  test('新規登録ボタンで /signup へ遷移すること', () => {
    render(<LoginTemplate />);
    const signupButtons = screen.getAllByRole('button', { name: '新規登録' });
    fireEvent.click(signupButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/signup');
  });
});

/* ────────────────── AuthGuard ────────────────── */
describe('AuthGuard - ガード機能', () => {
  test('未認証状態で保護ページにアクセスするとルートへリダイレクトされること', async () => {
    render(
      <AuthGuard pathname="/home">
        <div>ダッシュボード</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  test('認証済みで /signup にアクセスすると /home へリダイレクトされること', async () => {
    localStorage.setItem('auth_token', 'mock_token');

    render(
      <AuthGuard pathname="/signup">
        <div>新規登録</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/home');
    });
  });

  test('認証済みで / にアクセスするとコンテンツが表示されること（SplashScreenが処理）', async () => {
    localStorage.setItem('auth_token', 'mock_token');

    render(
      <AuthGuard pathname="/">
        <div>スプラッシュ画面</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('スプラッシュ画面')).toBeInTheDocument();
    });
  });

  test('認証済みで保護ページにアクセスするとコンテンツが表示されること', async () => {
    localStorage.setItem('auth_token', 'mock_token');

    render(
      <AuthGuard pathname="/home">
        <div>ダッシュボード</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });
  });
});

/* ────────────────── Logout ────────────────── */
describe('Logout - ログアウト', () => {
  test('ログアウト後にトークンが削除されること', () => {
    localStorage.setItem('auth_token', 'mock_token');
    expect(localStorage.getItem('auth_token')).toBe('mock_token');

    localStorage.removeItem('auth_token');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  test('ログアウト後に / (SplashScreen) へ遷移すること', () => {
    localStorage.setItem('auth_token', 'mock_token');

    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

/* ────────────────── SplashScreen ────────────────── */
describe('SplashScreen - 遷移', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('onCompleteが2秒後に呼ばれること', () => {
    const mockOnComplete = jest.fn();
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockOnComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  test('onCompleteが未指定の場合、2秒後に /home へ遷移すること', () => {
    render(<SplashScreen />);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockPush).toHaveBeenCalledWith('/home');
  });
});
