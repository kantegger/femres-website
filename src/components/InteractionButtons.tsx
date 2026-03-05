import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface InteractionButtonsProps {
  contentId: string;
  contentType: string;
  initialLikes?: number;
  className?: string;
  t?: {
    like: string;
    unlike: string;
    bookmark: string;
    unbookmark: string;
    loginToInteract: string;
  };
}

export default function InteractionButtons({
  contentId,
  contentType,
  initialLikes = 0,
  className = '',
  t = {
    like: '点赞',
    unlike: '取消点赞',
    bookmark: '收藏',
    unbookmark: '取消收藏',
    loginToInteract: '请先登录后再操作'
  }
}: InteractionButtonsProps) {
  const { isAuthenticated, toggleLike, toggleBookmark, isLiked, isBookmarked, interactions, login } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [totalLikes, setTotalLikes] = useState(initialLikes);
  const [loadingLikes, setLoadingLikes] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 获取总点赞数
  useEffect(() => {
    const fetchTotalLikes = async () => {
      try {
        const response = await fetch(`/api/likes/count?contentId=${encodeURIComponent(contentId)}`);
        if (response.ok) {
          const data = await response.json();
          setTotalLikes(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching total likes:', error);
        // 保持初始值
      } finally {
        setLoadingLikes(false);
      }
    };

    fetchTotalLikes();
  }, [contentId]);

  // 处理用户个人状态
  useEffect(() => {
    if (isAuthenticated) {
      const isCurrentlyLiked = isLiked(contentId);
      const isCurrentlyBookmarked = isBookmarked(contentId);
      setLiked(isCurrentlyLiked);
      setBookmarked(isCurrentlyBookmarked);
    } else {
      setLiked(false);
      setBookmarked(false);
    }
  }, [contentId, isAuthenticated, isLiked, isBookmarked, interactions]);

  // 计算显示的点赞数（总数 + 当前用户的增量）
  useEffect(() => {
    if (isAuthenticated) {
      const currentUserLiked = isLiked(contentId);
      const userIncrement = currentUserLiked ? 1 : 0;
      setLikeCount(totalLikes + userIncrement);
    } else {
      setLikeCount(totalLikes);
    }
  }, [totalLikes, isAuthenticated, isLiked, contentId, interactions]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const wasLiked = liked;

    // Optimistic update
    setLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      await toggleLike(contentId, contentType);
    } catch (error) {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const wasBookmarked = bookmarked;

    // Optimistic update
    setBookmarked(!wasBookmarked);

    try {
      await toggleBookmark(contentId, contentType);
    } catch (error) {
      // Revert on error
      setBookmarked(wasBookmarked);
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative flex items-center space-x-4 ${className}`}>
      <button
        onClick={handleLike}
        className={`group flex items-center space-x-1 transition-all duration-200 ${liked
            ? 'text-red-500'
            : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
          }`}
        title={liked ? t.unlike : t.like}
      >
        <svg
          className="w-5 h-5 transition-transform group-hover:scale-110"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={liked ? 0 : 1.5}
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          />
        </svg>
        {loadingLikes ? (
          <span className="text-sm font-medium animate-pulse w-6 h-4 bg-gray-300 dark:bg-gray-600 rounded"></span>
        ) : (
          <span className="text-sm font-medium">{likeCount}</span>
        )}
      </button>

      <button
        onClick={handleBookmark}
        className={`group transition-all duration-200 ${bookmarked
            ? 'text-yellow-500'
            : 'text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400'
          }`}
        title={bookmarked ? t.unbookmark : t.bookmark}
      >
        <svg
          className="w-5 h-5 transition-transform group-hover:scale-110"
          fill={bookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={bookmarked ? 0 : 1.5}
            d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
          />
        </svg>
      </button>

      {showLoginPrompt && (
        <div className="absolute -top-12 left-0 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-fade-in z-50">
          <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
          {t.loginToInteract}
        </div>
      )}
    </div>
  );
}