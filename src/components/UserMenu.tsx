import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import UserAvatar from './UserAvatar';
import LoginModal from './LoginModal';

interface UserMenuProps {
  locale?: string;
  translations?: {
    login: string;
    profile: string;
    myLikes: string;
    myBookmarks: string;
    logout: string;
  };
  authTranslations?: any;
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

  const { user, isAuthenticated, logout, interactions } = useAuthStore();

  // Generate localized profile link
  const getLocalizedPath = (path: string) => {
    if (locale === 'zh-CN') {
      return path;
    }
    return `/${locale}${path}`;
  };

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
          className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg transition-all duration-200"
          title={translations.login}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          translations={authTranslations}
        />
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <UserAvatar name={user?.username || ''} size="md" />
        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <UserAvatar name={user?.username || ''} size="lg" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <a
              href={getLocalizedPath('/profile')}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {translations.profile}
            </a>

            <a
              href={getLocalizedPath('/profile/likes')}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {translations.myLikes}
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                {interactions.likes.length}
              </span>
            </a>

            <a
              href={getLocalizedPath('/profile/bookmarks')}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              {translations.myBookmarks}
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                {interactions.bookmarks.length}
              </span>
            </a>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {translations.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}