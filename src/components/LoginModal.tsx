import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../store/authStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  translations?: {
    login: string;
    register: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    usernamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    loginPrompt: string;
    registerPrompt: string;
    haveAccount: string;
    noAccount: string;
    loginInProgress: string;
    registerInProgress: string;
    fillAllFields: string;
    fillEmailPassword: string;
    passwordMismatch: string;
    invalidEmail: string;
    loginFailed: string;
    registerFailed: string;
    networkError: string;
  };
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

export default function LoginModal({ isOpen, onClose, translations = defaultTranslations }: LoginModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login: apiLogin, register: apiRegister } = useAuthStore();

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
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100]" onClick={onClose}></div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-[101]">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isLoginMode ? translations.login : translations.register}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {translations.username}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={translations.usernamePlaceholder}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {translations.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={translations.emailPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {translations.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={translations.passwordPlaceholder}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {translations.confirmPassword}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={translations.confirmPasswordPlaceholder}
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLoginMode ? translations.loginInProgress : translations.registerInProgress}
                </div>
              ) : (
                isLoginMode ? translations.login : translations.register
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLoginMode ? translations.noAccount : translations.haveAccount}
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  resetForm();
                }}
                className="ml-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                {isLoginMode ? translations.register : translations.login}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );

  // Use portal to render modal at body level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}