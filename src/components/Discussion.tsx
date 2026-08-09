import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import LoginModal from './LoginModal';
import { type Locale } from '../i18n';
import type { DiscussionContentType, DiscussionCopy } from '../lib/discussionCopy';
import '../styles/editorial-discussion.css';

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
  contentType: DiscussionContentType;
  copy: DiscussionCopy;
  className?: string;
  locale?: Locale;
  variant?: 'default' | 'editorial';
}

export default function Discussion({
  contentId,
  contentType,
  copy,
  className = '',
  locale = 'zh-CN',
  variant = 'default'
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
  const [pendingModerationId, setPendingModerationId] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [commentsError, setCommentsError] = useState(false);
  const anonymousName = copy.user;

  const loadComments = async () => {
    setIsCommentsLoading(true);
    setCommentsError(false);
    try {
      const response = await fetch(`/api/comments/${contentId}`, {
        method: 'GET',
        headers: isAuthenticated ? getAuthHeaders() : {}
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        setCommentsError(true);
        console.error('Failed to load comments');
      }
    } catch (error) {
      setCommentsError(true);
      console.error('Error loading comments:', error);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  useEffect(() => { loadComments(); }, [contentId]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (locale === 'en') {
      if (minutes < 1) return 'just now';
      if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      if (minutes < 1440) { const hours = Math.floor(minutes / 60); return `${hours} hour${hours === 1 ? '' : 's'} ago`; }
      if (minutes < 10080) { const days = Math.floor(minutes / 1440); return `${days} day${days === 1 ? '' : 's'} ago`; }
      return date.toLocaleDateString('en-US');
    }
    if (locale === 'ja') {
      if (minutes < 1) return 'たった今';
      if (minutes < 60) return `${minutes}分前`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}時間前`;
      if (minutes < 10080) return `${Math.floor(minutes / 1440)}日前`;
      return date.toLocaleDateString('ja-JP');
    }
    if (locale === 'fr') {
      if (minutes < 1) return "À l'instant";
      if (minutes < 60) return `Il y a ${minutes} minute${minutes === 1 ? '' : 's'}`;
      if (minutes < 1440) { const hours = Math.floor(minutes / 60); return `Il y a ${hours} heure${hours === 1 ? '' : 's'}`; }
      if (minutes < 10080) { const days = Math.floor(minutes / 1440); return `Il y a ${days} jour${days === 1 ? '' : 's'}`; }
      return date.toLocaleDateString('fr-FR');
    }
    const traditional = locale === 'zh-TW';
    if (minutes < 1) return traditional ? '剛剛' : '刚刚';
    if (minutes < 60) return `${minutes}${traditional ? '分鐘前' : '分钟前'}`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}${traditional ? '小時前' : '小时前'}`;
    if (minutes < 10080) return `${Math.floor(minutes / 1440)}${traditional ? '天前' : '天前'}`;
    return date.toLocaleDateString(traditional ? 'zh-TW' : 'zh-CN');
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) { setIsLoginModalOpen(true); return; }
    if (!newComment.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ content: newComment.trim(), content_type: contentType })
      });
      if (response.ok) {
        const data = await response.json();
        setComments(previous => [data.comment, ...previous]);
        setNewComment('');
      } else {
        console.error('Failed to create comment:', await response.json());
        setShowLoginPrompt(true);
        setTimeout(() => setShowLoginPrompt(false), 3000);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally { setIsLoading(false); }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!isAuthenticated || !replyText.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ content: replyText.trim(), content_type: contentType, parent_id: parentId })
      });
      if (response.ok) {
        const data = await response.json();
        setComments(previous => previous.map(comment => comment.id === parentId
          ? { ...comment, replies: [data.comment, ...(comment.replies || [])] }
          : comment));
        setReplyText('');
        setReplyingTo(null);
      } else console.error('Failed to create reply');
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally { setIsLoading(false); }
  };

  const handleLikeComment = async (commentId: string, isReply = false, parentId?: string) => {
    if (!isAuthenticated) { setIsLoginModalOpen(true); return; }
    try {
      const response = await fetch(`/api/comments/like/${commentId}`, { method: 'POST', headers: getAuthHeaders() });
      if (!response.ok) { console.error('Failed to toggle comment like'); return; }
      const data = await response.json();
      setComments(previous => previous.map(comment => {
        if (isReply && parentId === comment.id) {
          return { ...comment, replies: comment.replies?.map(reply => reply.id === commentId
            ? { ...reply, is_liked: data.liked, likes_count: data.liked ? reply.likes_count + 1 : reply.likes_count - 1 }
            : reply) };
        }
        return comment.id === commentId
          ? { ...comment, is_liked: data.liked, likes_count: data.liked ? comment.likes_count + 1 : comment.likes_count - 1 }
          : comment;
      }));
    } catch (error) { console.error('Error toggling comment like:', error); }
  };

  const handleDeleteComment = async (commentId: string, isReply = false, parentId?: string) => {
    if (!window.confirm(copy.deleteConfirm)) return;
    setPendingModerationId(commentId);
    try {
      const response = await fetch(`/api/comments/manage/${commentId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) return;
      setComments(previous => isReply && parentId
        ? previous.map(comment => comment.id === parentId
          ? { ...comment, replies: comment.replies?.filter(reply => reply.id !== commentId) }
          : comment)
        : previous.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setPendingModerationId(null);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!isAuthenticated) { setIsLoginModalOpen(true); return; }
    if (reportedIds.includes(commentId)) return;
    setPendingModerationId(commentId);
    try {
      const response = await fetch(`/api/comments/report/${commentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ reason: 'other' })
      });
      if (response.ok) setReportedIds(previous => [...previous, commentId]);
    } catch (error) {
      console.error('Error reporting comment:', error);
    } finally {
      setPendingModerationId(null);
    }
  };

  const renderComment = (comment: Comment, index: number, isReply = false, parentId?: string) => {
    const author = comment.username || anonymousName;
    return (
      <article key={comment.id} className={`editorial-thread__entry${isReply ? ' editorial-thread__entry--reply' : ''}`}>
        <div className="editorial-thread__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
        <div className="editorial-thread__entry-body">
          <header className="editorial-thread__byline">
            <strong>{author}</strong><time dateTime={comment.created_at}>{formatTimeAgo(comment.created_at)}</time>
          </header>
          <p className="editorial-thread__comment">{comment.content}</p>
          <div className="editorial-thread__actions">
            <button type="button" onClick={() => handleLikeComment(comment.id, isReply, parentId)} aria-pressed={comment.is_liked}>
              {copy.like} <span>{String(comment.likes_count).padStart(2, '0')}</span>
            </button>
            {!isReply && (
              <button type="button" onClick={() => {
                if (!isAuthenticated) { setIsLoginModalOpen(true); return; }
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyText('');
              }}>{copy.reply}</button>
            )}
            {isAuthenticated && user?.id === comment.user_id ? (
              <button type="button" className="editorial-thread__destructive" onClick={() => handleDeleteComment(comment.id, isReply, parentId)} disabled={pendingModerationId === comment.id}>
                {copy.deleteComment}
              </button>
            ) : (
              <button type="button" onClick={() => handleReportComment(comment.id)} disabled={pendingModerationId === comment.id || reportedIds.includes(comment.id)}>
                {reportedIds.includes(comment.id) ? copy.reported : copy.report}
              </button>
            )}
          </div>
          {!isReply && replyingTo === comment.id && (
            <div className="editorial-thread__reply-form">
              <textarea value={replyText} onChange={event => setReplyText(event.target.value)}
                placeholder={`${copy.replyTo.replace('{name}', author)}…`} rows={3} maxLength={500} />
              <div className="editorial-thread__form-meta">
                <span>{replyText.length} / 500</span>
                <div>
                  <button type="button" className="editorial-thread__text-button" onClick={() => { setReplyingTo(null); setReplyText(''); }}>{copy.cancel}</button>
                  <button type="button" className="editorial-thread__submit" onClick={() => handleSubmitReply(comment.id)} disabled={!replyText.trim() || isLoading}>
                    {isLoading ? copy.posting : copy.reply}
                  </button>
                </div>
              </div>
            </div>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div className="editorial-thread__replies">
              {comment.replies.map((reply, replyIndex) => renderComment(reply, replyIndex, true, comment.id))}
            </div>
          )}
        </div>
      </article>
    );
  };

  const totalCommentsCount = comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0);

  return (
    <section id="discussion" className={`editorial-thread${variant === 'default' ? ' editorial-thread--compact' : ''} ${className}`}>
      <header className="editorial-thread__header">
        <p className="editorial-thread__eyebrow">{copy.eyebrow}</p>
        <div>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
      </header>

      <div className="editorial-thread__composer">
        {isAuthenticated ? (
          <>
            <p className="editorial-thread__identity">{copy.signedInAs} <strong>{user?.username || anonymousName}</strong></p>
            <textarea value={newComment} onChange={event => setNewComment(event.target.value)}
              placeholder={copy.shareYourThoughts} rows={4} maxLength={1000} />
            <div className="editorial-thread__form-meta">
              <span>{newComment.length} / 1000</span>
              <button type="button" className="editorial-thread__submit" onClick={handleSubmitComment} disabled={!newComment.trim() || isLoading}>
                {isLoading ? copy.posting : copy.postComment}
              </button>
            </div>
          </>
        ) : (
          <div className="editorial-thread__invitation">
            <p>{copy.joinDiscussion}</p>
            <button type="button" className="editorial-thread__submit" onClick={() => setIsLoginModalOpen(true)}>{copy.loginToDiscuss}</button>
          </div>
        )}
      </div>

      <div className="editorial-thread__ledger">
        <div className="editorial-thread__ledger-label">
          <span>{copy.responses}</span>
          {totalCommentsCount > 0 && <span>{totalCommentsCount}</span>}
        </div>
        {isCommentsLoading ? <p className="editorial-thread__state">{copy.loadingComments}</p>
          : commentsError ? <div className="editorial-thread__state editorial-thread__state--error" role="alert"><span>{copy.loadError}</span><button type="button" onClick={loadComments}>{copy.retry}</button></div>
          : comments.length > 0 ? comments.map((comment, index) => renderComment(comment, index))
          : <p className="editorial-thread__state">{copy.noCommentsYet}</p>}
      </div>

      {showLoginPrompt && <div className="editorial-thread__notice" role="status">{copy.loginRequired}</div>}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} translations={copy.auth} closeLabel={copy.close} />
    </section>
  );
}
