import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import LoginModal from './LoginModal';
import { createT, type Locale } from '../i18n';
import zhCN from '../i18n/locales/zh-CN.json';
import en from '../i18n/locales/en.json';
import ja from '../i18n/locales/ja.json';
import fr from '../i18n/locales/fr.json';

interface Comment {
  id: string;
  content: string;
  content_id: string;
  content_type: string;
  user_id: string;
  parent_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  username?: string;
  is_liked?: boolean;
  replies?: Comment[];
}

interface DiscussionProps {
  contentId: string;
  contentType: 'book' | 'article' | 'video' | 'podcast' | 'paper' | 'film';
  title?: string;
  description?: string;
  className?: string;
  locale?: Locale;
}

export default function Discussion({
  contentId,
  contentType,
  title,
  description,
  className = '',
  locale = 'zh-CN'
}: DiscussionProps) {
  const { isAuthenticated, user, getAuthHeaders } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Get translations
  const translations = locale === 'en' ? en : (locale === 'ja' ? ja : (locale === 'fr' ? fr : zhCN));
  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }

    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return value || key;
  };

  // Get content type specific translations with fallback
  const getContentTypeTranslations = () => {
    const contentTypeKey = contentType === 'film' ? 'video' : contentType;
    const contentTypeTranslations = t(`discussion.contentType.${contentTypeKey}`);

    if (contentTypeTranslations && typeof contentTypeTranslations === 'object') {
      return contentTypeTranslations;
    }

    // Fallback to default
    return {
      title: t('discussion.contentType.default.title') || t('discussion.title') || 'Discussion',
      description: t('discussion.contentType.default.description') || t('discussion.description') || 'Share your thoughts'
    };
  };

  const contentTypeTranslations = getContentTypeTranslations();
  const displayTitle = title || contentTypeTranslations.title;
  const displayDescription = description || contentTypeTranslations.description;

  // Load comments for this content
  useEffect(() => {
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    setIsCommentsLoading(true);
    try {
      const headers = isAuthenticated ? getAuthHeaders() : {};
      const response = await fetch(`/api/comments/${contentId}`, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        console.error('Failed to load comments');
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (locale === 'en') {
      if (diffInMinutes < 1) return 'just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-US');
    } else if (locale === 'ja') {
      if (diffInMinutes < 1) return 'たった今';
      if (diffInMinutes < 60) return `${diffInMinutes}分前`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}日前`;
      return date.toLocaleDateString('ja-JP');
    } else if (locale === 'fr') {
      if (diffInMinutes < 1) return "À l'instant";
      if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
      if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} heure${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''}`;
      if (diffInMinutes < 10080) return `Il y a ${Math.floor(diffInMinutes / 1440)} jour${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`;
      return date.toLocaleDateString('fr-FR');
    } else {
      if (diffInMinutes < 1) return '刚刚';
      if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}天前`;
      return date.toLocaleDateString('zh-CN');
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!newComment.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/comments/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          content: newComment.trim(),
          content_type: contentType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      } else {
        const error = await response.json();
        console.error('Failed to create comment:', error);
        setShowLoginPrompt(true);
        setTimeout(() => setShowLoginPrompt(false), 3000);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!isAuthenticated || !replyText.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/comments/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          content: replyText.trim(),
          content_type: contentType,
          parent_id: parentId
        })
      });

      if (response.ok) {
        const data = await response.json();

        setComments(prev => prev.map(comment =>
          comment.id === parentId
            ? { ...comment, replies: [data.comment, ...(comment.replies || [])] }
            : comment
        ));

        setReplyText('');
        setReplyingTo(null);
      } else {
        console.error('Failed to create reply');
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/comments/like/${commentId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();

        setComments(prev => prev.map(comment => {
          if (isReply && parentId === comment.id) {
            return {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === commentId
                  ? {
                    ...reply,
                    is_liked: data.liked,
                    likes_count: data.liked ? reply.likes_count + 1 : reply.likes_count - 1
                  }
                  : reply
              )
            };
          } else if (comment.id === commentId) {
            return {
              ...comment,
              is_liked: data.liked,
              likes_count: data.liked ? comment.likes_count + 1 : comment.likes_count - 1
            };
          }
          return comment;
        }));
      } else {
        console.error('Failed to toggle comment like');
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const getAuthorColor = (authorName: string) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    let hash = 0;
    for (let i = 0; i < authorName.length; i++) {
      hash = authorName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getAuthorInitial = (authorName: string) => {
    return authorName.charAt(0).toUpperCase();
  };

  const renderComment = (comment: Comment, isReply: boolean = false, parentId?: string) => (
    <div key={comment.id} className={`${isReply ? 'ml-12 border-l-2 border-gray-200 dark:border-gray-600 pl-4' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full ${getAuthorColor(comment.username || 'User')} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
            {getAuthorInitial(comment.username || 'U')}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {comment.username || (locale === 'en' ? 'User' : (locale === 'fr' ? 'Utilisateur' : (locale === 'ja' ? 'ユーザー' : '用户')))}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
              {comment.content}
            </p>

            <div className="flex items-center space-x-4 text-xs">
              <button
                onClick={() => handleLikeComment(comment.id, isReply, parentId)}
                className={`flex items-center space-x-1 transition-colors ${comment.is_liked
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                  }`}
              >
                <svg className="w-4 h-4" fill={comment.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={comment.is_liked ? 0 : 1.5} d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                <span>{comment.likes_count}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setIsLoginModalOpen(true);
                      return;
                    }
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyText('');
                  }}
                  className="text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  {t('discussion.reply')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply form */}
      {!isReply && replyingTo === comment.id && (
        <div className="mt-3 ml-11">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t('discussion.replyTo', { name: comment.username || (locale === 'en' ? 'User' : (locale === 'fr' ? 'Utilisateur' : (locale === 'ja' ? 'ユーザー' : '用户'))) }) + '...'}
              className="w-full bg-transparent text-gray-700 dark:text-gray-300 text-sm placeholder-gray-500 dark:placeholder-gray-400 resize-none border-none focus:outline-none"
              rows={2}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {replyText.length}/500
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  {locale === 'en' ? 'Cancel' : (locale === 'fr' ? 'Annuler' : (locale === 'ja' ? 'キャンセル' : '取消'))}
                </button>
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText.trim() || isLoading}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-xs rounded transition-colors"
                >
                  {isLoading ? t('discussion.posting') : t('discussion.reply')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map(reply => renderComment(reply, true, comment.id))}
        </div>
      )}
    </div>
  );

  const totalCommentsCount = comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0);

  return (
    <section className={`border-t border-gray-200 dark:border-gray-700 pt-12 mt-16 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {displayDescription}
      </p>

      {/* Comment Form */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {isAuthenticated ? (
            <div>
              <div className="flex items-start space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-full ${getAuthorColor(user?.username || (locale === 'en' ? 'User' : (locale === 'fr' ? 'Utilisateur' : (locale === 'ja' ? 'ユーザー' : '用户'))))} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                  {getAuthorInitial(user?.username || (locale === 'en' ? 'User' : (locale === 'fr' ? 'Utilisateur' : (locale === 'ja' ? 'ユーザー' : '用户'))))}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('discussion.shareYourThoughts')}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    maxLength={1000}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {newComment.length}/1000
                </span>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? t('discussion.posting') : t('discussion.postComment')}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('discussion.joinDiscussion')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {displayDescription}
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                {t('discussion.loginToDiscuss')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      {isCommentsLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">⏳</div>
          <p className="text-gray-500 dark:text-gray-400">
            {t('discussion.loadingComments')}
          </p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('discussion.totalComments', { count: totalCommentsCount })}
            </span>
          </div>

          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">💭</div>
          <p className="text-gray-500 dark:text-gray-400">
            {t('discussion.noCommentsYet')}
          </p>
        </div>
      )}

      {/* Login Prompt Tooltip */}
      {showLoginPrompt && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{t('discussion.loginRequired')}</span>
          </div>
        </div>
      )}
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  );
}