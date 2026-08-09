import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { requestLikeCount } from '../lib/likeCountClient';
import '../styles/editorial-interactions.css';

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
  const { isAuthenticated, toggleLike, toggleBookmark, isLiked, isBookmarked, interactions } = useAuthStore();
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
        setTotalLikes(await requestLikeCount(contentId));
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
    <div className={`editorial-interaction-buttons ${className}`}>
      <button
        onClick={handleLike}
        className={`editorial-interaction-buttons__action${liked ? ' is-active' : ''}`}
        title={liked ? t.unlike : t.like}
      >
        <svg
          className="editorial-interaction-buttons__icon"
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
          <span className="editorial-interaction-buttons__count is-loading" aria-label={t.like}></span>
        ) : (
          <span className="editorial-interaction-buttons__count">{likeCount}</span>
        )}
      </button>

      <button
        onClick={handleBookmark}
        className={`editorial-interaction-buttons__action${bookmarked ? ' is-active' : ''}`}
        title={bookmarked ? t.unbookmark : t.bookmark}
      >
        <svg
          className="editorial-interaction-buttons__icon"
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
        <div role="status" className="editorial-interaction-buttons__notice">{t.loginToInteract}</div>
      )}
    </div>
  );
}
