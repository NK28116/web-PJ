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
 * - ガード機能: 未認証状態で保護ページにアクセスした際 /login へリダイレクトされること
 * - ログアウト: localStorage が完全クリアされ /login に戻ること
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

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  localStorage.clear();
  mockPush.mockClear();
  mockReplace.mockClear();
  mockFetch.mockClear();
});

/* ────────────────── LoginTemplate ────────────────── */
describe('LoginTemplate - ログインフロー', () => {
  test('メールとパスワードが未入力の場合エラーメッセージが表示されること', async () => {
    render(<LoginTemplate />);
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    await waitFor(() => {
      expect(screen.getByText('※未入力の箇所があります')).toBeInTheDocument();
    });
  });

  test('誤った認証情報でログインするとエラーメッセージが表示されること', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'invalid credentials' }),
    });

    render(<LoginTemplate />);

    fireEvent.change(screen.getByPlaceholderText('Wyze ID ,メールアドレス'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
    });
  });

  test('正しい入力でログインするとトークンが保存されること', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'mock_jwt_token',
        user: { id: 'user-123', email: 'test@example.com', role: 'user' },
      }),
    });

    render(<LoginTemplate />);

    fireEvent.change(screen.getByPlaceholderText('Wyze ID ,メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('mock_jwt_token');
    });
  });

  test('正しい入力でログインすると /home へ遷移すること', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'mock_jwt_token',
        user: { id: 'user-123', email: 'test@example.com', role: 'user' },
      }),
    });

    render(<LoginTemplate />);

    fireEvent.change(screen.getByPlaceholderText('Wyze ID ,メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/home');
    });
  });

  test('ログイン成功時に以前のユーザーデータがクリアされること', async () => {
    // 前ユーザーのデータを localStorage に設定
    localStorage.setItem('auth_token', 'old_token');
    localStorage.setItem('user_email', 'old@example.com');
    localStorage.setItem('some_cache_key', 'old_cache_data');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'new_jwt_token',
        user: { id: 'new-user-id', email: 'new@example.com', role: 'user' },
      }),
    });

    render(<LoginTemplate />);

    fireEvent.change(screen.getByPlaceholderText('Wyze ID ,メールアドレス'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('new_jwt_token');
      // 前ユーザーのキャッシュが残っていないこと
      expect(localStorage.getItem('some_cache_key')).toBeNull();
    });
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
  test('未認証状態で保護ページにアクセスすると /login へリダイレクトされること', async () => {
    render(
      <AuthGuard pathname="/home">
        <div>ダッシュボード</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
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

  test('認証済みで /login にアクセスすると /home へリダイレクトされること', async () => {
    localStorage.setItem('auth_token', 'mock_token');

    render(
      <AuthGuard pathname="/login">
        <div>ログイン</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/home');
    });
  });

  test('認証済みで / にアクセスするとコンテンツが表示されること', async () => {
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
  test('ログアウト後に localStorage が完全クリアされること', () => {
    localStorage.setItem('auth_token', 'mock_token');
    localStorage.setItem('user_email', 'test@example.com');
    localStorage.setItem('some_cache', 'cached_data');

    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('user_email')).toBeNull();
    expect(localStorage.getItem('some_cache')).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  test('ログアウト後に /login へ遷移すること', () => {
    localStorage.setItem('auth_token', 'mock_token');

    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
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
