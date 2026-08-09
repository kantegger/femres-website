import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../store/authStore';
import type { AuthTranslations } from '../types/profile';
import '../styles/editorial-account.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  translations?: AuthTranslations;
  closeLabel?: string;
  locale?: string;
}

const defaultTranslations = {
  login: '登录',
  register: '注册',
  username: '用户名',
  email: '邮箱',
  password: '密码',
  confirmPassword: '确认密码',
  usernamePlaceholder: '输入用户名',
  emailPlaceholder: '输入邮箱',
  passwordPlaceholder: '输入密码',
  confirmPasswordPlaceholder: '再次输入密码',
  loginPrompt: '登录',
  registerPrompt: '注册',
  haveAccount: '已有账号？',
  noAccount: '还没有账号？',
  loginInProgress: '登录中...',
  registerInProgress: '注册中...',
  fillAllFields: '请填写所有字段',
  fillEmailPassword: '请填写邮箱和密码',
  passwordMismatch: '密码不匹配',
  invalidEmail: '请输入有效的邮箱地址',
  loginFailed: '登录失败',
  registerFailed: '注册失败',
  networkError: '网络错误，请稍后重试'
};

export default function LoginModal({ isOpen, onClose, translations = defaultTranslations, closeLabel = '关闭', locale = 'zh-CN' }: LoginModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login: apiLogin, register: apiRegister } = useAuthStore();
  const editorialCopy = ({
    'zh-CN': { archive: 'FemRes / 读者档案', statement: '阅读。收藏。重访。', account: '账号 / 01' },
    'zh-TW': { archive: 'FemRes / 讀者檔案', statement: '閱讀。收藏。重訪。', account: '帳號 / 01' },
    en: { archive: 'FemRes / Reader archive', statement: 'Read. Keep. Return.', account: 'Account / 01' },
    ja: { archive: 'FemRes / 読者アーカイブ', statement: '読む。残す。戻る。', account: 'アカウント / 01' },
    fr: { archive: 'FemRes / Archives de lecture', statement: 'Lire. Garder. Revenir.', account: 'Compte / 01' },
  } as Record<string, { archive: string; statement: string; account: string }>)[locale] || {
    archive: 'FemRes / Reader archive', statement: 'Read. Keep. Return.', account: 'Account / 01'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Check required fields based on mode
    if (isLoginMode) {
      if (!email || !password) {
        setError(translations.fillEmailPassword);
        setIsLoading(false);
        return;
      }
    } else {
      if (!username || !email || !password) {
        setError(translations.fillAllFields);
        setIsLoading(false);
        return;
      }
    }

    if (!isLoginMode && password !== confirmPassword) {
      setError(translations.passwordMismatch);
      setIsLoading(false);
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(translations.invalidEmail);
      setIsLoading(false);
      return;
    }

    try {
      let result;
      if (isLoginMode) {
        // Login with email or username
        result = await apiLogin(email, password);
      } else {
        // Register new account
        result = await apiRegister(username, email, password);
      }

      if (result.success) {
        resetForm();
        onClose();
      } else {
        setError(result.error || (isLoginMode ? translations.loginFailed : translations.registerFailed));
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(translations.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="auth-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="auth-overlay__inner" onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
        <section className="auth-sheet" role="dialog" aria-modal="true" aria-labelledby="auth-sheet-title">
          <aside className="auth-sheet__folio" aria-hidden="true">
            <p className="auth-sheet__brand">{editorialCopy.archive}</p>
            <p className="auth-sheet__statement">{editorialCopy.statement}</p>
            <p className="auth-sheet__index">{editorialCopy.account}</p>
          </aside>
          <div className="auth-sheet__content">
            <header className="auth-sheet__header">
              <h2 id="auth-sheet-title">
                {isLoginMode ? translations.login : translations.register}
              </h2>
              <button type="button" onClick={onClose} className="auth-sheet__close">
                {closeLabel}
              </button>
            </header>

          <form onSubmit={handleSubmit} className="auth-sheet__form">
            {!isLoginMode && (
              <div className="auth-field">
                <label htmlFor="auth-username">
                  {translations.username}
                </label>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={translations.usernamePlaceholder}
                  autoComplete="username"
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">
                {translations.email}
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={translations.emailPlaceholder}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">
                {translations.password}
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={translations.passwordPlaceholder}
                autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              />
            </div>

            {!isLoginMode && (
              <div className="auth-field">
                <label htmlFor="auth-confirm-password">
                  {translations.confirmPassword}
                </label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={translations.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <p className="auth-sheet__error" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="auth-sheet__submit"
            >
              {isLoading
                ? (isLoginMode ? translations.loginInProgress : translations.registerInProgress)
                : (isLoginMode ? translations.login : translations.register)}
            </button>
          </form>

          <div className="auth-sheet__mode">
            <span>
              {isLoginMode ? translations.noAccount : translations.haveAccount}
            </span>
            <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  resetForm();
                }}
                className="auth-sheet__switch"
              >
                {isLoginMode ? translations.register : translations.login}
            </button>
          </div>
          </div>
        </section>
        </div>
      </div>
  );

  // Use portal to render modal at body level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
