import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import UserAvatar from './UserAvatar';
import LoginModal from './LoginModal';
import type { AuthTranslations } from '../types/profile';
import '../styles/editorial-account.css';

interface UserMenuProps {
  locale?: string;
  translations?: {
    login: string;
    profile: string;
    myLikes: string;
    myBookmarks: string;
    logout: string;
  };
  authTranslations?: AuthTranslations;
}

const defaultTranslations = {
  login: '登录',
  profile: '个人中心',
  myLikes: '我的点赞',
  myBookmarks: '我的收藏',
  logout: '退出登录'
};

export default function UserMenu({ locale = 'zh-CN', translations = defaultTranslations, authTranslations }: UserMenuProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout, interactions, refreshUser } = useAuthStore();
  const interactionCount = interactions.likes.length + interactions.bookmarks.length;
  const closeLabel = ({
    'zh-CN': '关闭',
    'zh-TW': '關閉',
    en: 'Close',
    ja: '閉じる',
    fr: 'Fermer',
  } as Record<string, string>)[locale] || 'Close';

  // Generate localized profile link
  const getLocalizedPath = (path: string) => {
    if (locale === 'zh-CN') {
      return path;
    }
    return `/${locale}${path}`;
  };

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="auth-trigger"
          title={translations.login}
        >
          {translations.login}
        </button>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          translations={authTranslations}
          closeLabel={closeLabel}
          locale={locale}
        />
      </>
    );
  }

  return (
    <div className="account-menu" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="account-menu__button"
        aria-expanded={isDropdownOpen}
      >
        <UserAvatar name={user?.username || ''} size="md" />
      </button>

      {isDropdownOpen && (
        <div className="account-menu__panel">
          <div className="account-menu__identity">
            <UserAvatar name={user?.username || ''} size="lg" />
            <div>
              <p className="account-menu__name">{user?.username}</p>
              <p className="account-menu__email">{user?.email}</p>
            </div>
          </div>

          <div className="account-menu__links">
            <a
              href={getLocalizedPath('/profile')}
              className="account-menu__link"
            >
              {translations.profile}
              <span>{interactionCount}</span>
            </a>

            <a
              href={getLocalizedPath('/profile/likes')}
              className="account-menu__link"
            >
              {translations.myLikes}
              <span>{String(interactions.likes.length).padStart(2, '0')}</span>
            </a>

            <a
              href={getLocalizedPath('/profile/bookmarks')}
              className="account-menu__link"
            >
              {translations.myBookmarks}
              <span>{String(interactions.bookmarks.length).padStart(2, '0')}</span>
            </a>
          </div>
            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="account-menu__logout"
            >
              {translations.logout}
            </button>
        </div>
      )}
    </div>
  );
}
