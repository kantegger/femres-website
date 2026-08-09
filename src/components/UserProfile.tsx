import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import UserAvatar from './UserAvatar';
import type { ProfileUiStrings } from '../types/profile';
import '../styles/editorial-account.css';

interface UserProfileProps {
  locale?: string;
  uiStrings?: ProfileUiStrings;
}

const translations = {
  'zh-CN': {
    usernameEmpty: '用户名不能为空',
    updateFailed: '更新失败',
    loginRequired: '请先登录',
    loginDesc: '登录后即可查看您的个人资料和内容',
    home: '返回首页',
    editUsername: '编辑用户名',
    likes: '点赞',
    bookmarks: '收藏',
    joinDate: '加入日期',
    logout: '退出登录',
    myLikes: '我的点赞',
    myBookmarks: '我的收藏',
    contentCount: '个内容',
    quickActions: '快速操作',
    browseBooks: '浏览书籍',
    readArticles: '阅读文章',
    exploreTopics: '探索主题'
  },
  'ja': {
    usernameEmpty: 'ユーザー名は必須です',
    updateFailed: '更新に失敗しました',
    loginRequired: 'ログインしてください',
    loginDesc: 'ログインしてプロフィールとコンテンツを表示',
    home: 'ホームに戻る',
    editUsername: 'ユーザー名を編集',
    likes: 'いいね',
    bookmarks: 'ブックマーク',
    joinDate: '参加日',
    logout: 'ログアウト',
    myLikes: 'いいねしたコンテンツ',
    myBookmarks: 'ブックマーク',
    contentCount: '件のコンテンツ',
    quickActions: 'クイックアクション',
    browseBooks: '書籍を閲覧',
    readArticles: '記事を読む',
    exploreTopics: 'トピックを探索'
  },
  'en': {
    usernameEmpty: 'Username cannot be empty',
    updateFailed: 'Update failed',
    loginRequired: 'Please Login',
    loginDesc: 'Login to view your profile and content',
    home: 'Back to Home',
    editUsername: 'Edit Username',
    likes: 'Likes',
    bookmarks: 'Bookmarks',
    joinDate: 'Joined',
    logout: 'Logout',
    myLikes: 'My Likes',
    myBookmarks: 'My Bookmarks',
    contentCount: 'items',
    quickActions: 'Quick Actions',
    browseBooks: 'Browse Books',
    readArticles: 'Read Articles',
    exploreTopics: 'Explore Topics'
  },
  'fr': {
    usernameEmpty: "Le nom d'utilisateur ne peut pas être vide",
    updateFailed: "Échec de la mise à jour",
    loginRequired: "Veuillez vous connecter",
    loginDesc: "Connectez-vous pour voir votre profil et votre contenu",
    home: "Retour à l'accueil",
    editUsername: "Modifier le nom d'utilisateur",
    likes: "Favoris",
    bookmarks: "Marque-pages",
    joinDate: "Inscrit le",
    logout: "Déconnexion",
    myLikes: "Mes favoris",
    myBookmarks: "Mes marque-pages",
    contentCount: "éléments",
    quickActions: "Actions rapides",
    browseBooks: "Parcourir les livres",
    readArticles: "Lire les articles",
    exploreTopics: "Explorer les thèmes"
  }
};

export default function UserProfile({ locale = 'zh-CN', uiStrings }: UserProfileProps) {
  const { user, isAuthenticated, interactions, logout, updateUsername, deleteAccount, isLoading } = useAuthStore();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [error, setError] = useState('');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Use passed uiStrings or fallback to internal translations
  const t = uiStrings || translations[locale as keyof typeof translations] || translations['zh-CN'];
  const prefix = locale === 'zh-CN' ? '' : `/${locale}`;
  const actionCopy = ({
    'zh-CN': { save: '保存', cancel: '取消', account: '读者档案', note: '你的阅读线索、收藏与回应都保存在这里。', privacy: '账号与隐私', delete: '删除账号', deleteDesc: '永久删除账号、收藏、点赞和评论。此操作无法撤销。', password: '输入密码确认', confirmDelete: '永久删除', deleteFailed: '账号删除失败' },
    'zh-TW': { save: '儲存', cancel: '取消', account: '讀者檔案', note: '你的閱讀線索、收藏與回應都保存在這裡。', privacy: '帳號與隱私', delete: '刪除帳號', deleteDesc: '永久刪除帳號、收藏、按讚和留言。此操作無法復原。', password: '輸入密碼確認', confirmDelete: '永久刪除', deleteFailed: '帳號刪除失敗' },
    en: { save: 'Save', cancel: 'Cancel', account: 'Reader archive', note: 'Your reading trail, saved works, and responses live here.', privacy: 'Account and privacy', delete: 'Delete account', deleteDesc: 'Permanently delete your account, saved works, likes, and comments. This cannot be undone.', password: 'Enter password to confirm', confirmDelete: 'Delete permanently', deleteFailed: 'Account deletion failed' },
    ja: { save: '保存', cancel: 'キャンセル', account: '読者アーカイブ', note: '読書の記録、保存した作品、反応をここにまとめます。', privacy: 'アカウントとプライバシー', delete: 'アカウントを削除', deleteDesc: 'アカウント、保存、いいね、コメントを完全に削除します。この操作は元に戻せません。', password: '確認のためパスワードを入力', confirmDelete: '完全に削除', deleteFailed: 'アカウントを削除できませんでした' },
    fr: { save: 'Enregistrer', cancel: 'Annuler', account: 'Archives de lecture', note: 'Votre parcours de lecture, vos sélections et vos réactions sont réunis ici.', privacy: 'Compte et confidentialité', delete: 'Supprimer le compte', deleteDesc: 'Supprimez définitivement votre compte, vos sélections, mentions et commentaires. Cette action est irréversible.', password: 'Saisissez le mot de passe', confirmDelete: 'Supprimer définitivement', deleteFailed: 'Échec de la suppression du compte' },
  } as const)[locale as 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'fr'] || {
    save: 'Save', cancel: 'Cancel', account: 'Reader archive', note: 'Your reading trail, saved works, and responses live here.', privacy: 'Account and privacy', delete: 'Delete account', deleteDesc: 'Permanently delete your account and activity. This cannot be undone.', password: 'Enter password to confirm', confirmDelete: 'Delete permanently', deleteFailed: 'Account deletion failed'
  };
  const sectionCopy = ({
    'zh-CN': { account: '账号', archive: '档案', index: '索引', privacy: '隐私' },
    'zh-TW': { account: '帳號', archive: '檔案', index: '索引', privacy: '隱私' },
    en: { account: 'Account', archive: 'Archive', index: 'Index', privacy: 'Privacy' },
    ja: { account: 'アカウント', archive: 'アーカイブ', index: '索引', privacy: 'プライバシー' },
    fr: { account: 'Compte', archive: 'Archives', index: 'Index', privacy: 'Confidentialité' },
  } as Record<string, { account: string; archive: string; index: string; privacy: string }>)[locale] || {
    account: 'Account', archive: 'Archive', index: 'Index', privacy: 'Privacy'
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleteError('');
    const result = await deleteAccount(deletePassword);
    if (result.success) {
      window.location.href = `${prefix}/`;
      return;
    }
    setDeleteError(result.error || actionCopy.deleteFailed);
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setNewUsername(user?.username || '');
    setError('');
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername(user?.username || '');
    setError('');
  };

  const handleUsernameSave = async () => {
    if (!newUsername.trim()) {
      setError(t.usernameEmpty);
      return;
    }

    if (newUsername.trim() === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    const result = await updateUsername(newUsername.trim());

    if (result.success) {
      setIsEditingUsername(false);
      setError('');
    } else {
      setError(result.error || t.updateFailed);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUsernameSave();
    } else if (e.key === 'Escape') {
      handleUsernameCancel();
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="reader-profile">
        <section className="reader-empty">
          <div>
            <span className="reader-empty__label">{sectionCopy.account}</span>
            <h1>{t.loginRequired}</h1>
            <p>{t.loginDesc}</p>
            <a href={`${prefix}/`} className="reader-text-link">{t.home}</a>
          </div>
          <p className="reader-empty__aside">{actionCopy.note}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="reader-profile">
      <header className="reader-profile__header">
        <div className="reader-profile__identity">
          <div>
            <UserAvatar name={user?.username || ''} size="lg" />
          </div>
          <div>
            <span className="reader-section-label">{actionCopy.account}</span>
              {isEditingUsername ? (
                <div className="reader-profile__editor">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{ width: `${Math.max(newUsername.length, 8)}ch` }}
                    autoFocus
                    aria-label={t.editUsername}
                  />
                  <button
                    onClick={handleUsernameSave}
                    disabled={isLoading}
                  >
                    {actionCopy.save}
                  </button>
                  <button
                    onClick={handleUsernameCancel}
                  >
                    {actionCopy.cancel}
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="reader-profile__name">{user?.username}</h1>
                  <button
                    onClick={handleUsernameEdit}
                    className="reader-profile__edit"
                    title={t.editUsername}
                  >
                    {t.editUsername}
                  </button>
                </>
              )}
            {error && (
              <p className="reader-profile__error">{error}</p>
            )}
            <p className="reader-profile__email">{user?.email}</p>
          </div>
        </div>
        <div>
          <div className="reader-profile__stats">
            <div className="reader-stat"><strong>{String(interactions.likes.length).padStart(2, '0')}</strong><span>{t.likes}</span></div>
            <div className="reader-stat"><strong>{String(interactions.bookmarks.length).padStart(2, '0')}</strong><span>{t.bookmarks}</span></div>
            <div className="reader-stat reader-stat--wide"><strong>{new Date(user?.created_at || '').toLocaleDateString(locale)}</strong><span>{t.joinDate}</span></div>
          </div>
          <button onClick={logout} className="reader-profile__logout">{t.logout}</button>
        </div>
      </header>

      <div className="reader-profile__sections">
        <a
          href={`${prefix}/profile/likes`}
          className="reader-profile__section"
        >
          <span className="reader-section-label">{sectionCopy.archive} / 01</span>
          <h2>{t.myLikes}<span>01</span></h2>
          <p>{interactions.likes.length} {t.contentCount}</p>
        </a>

        <a
          href={`${prefix}/profile/bookmarks`}
          className="reader-profile__section"
        >
          <span className="reader-section-label">{sectionCopy.archive} / 02</span>
          <h2>{t.myBookmarks}<span>02</span></h2>
          <p>{interactions.bookmarks.length} {t.contentCount}</p>
        </a>

        <section className="reader-profile__browse">
          <div>
            <span className="reader-section-label">{sectionCopy.index} / 03</span>
            <h2>{t.quickActions}</h2>
          </div>
          <nav>
            <a href={`${prefix}/books`}><span>{t.browseBooks}</span><span>01</span></a>
            <a href={`${prefix}/articles`}><span>{t.readArticles}</span><span>02</span></a>
            <a href={`${prefix}/topics`}><span>{t.exploreTopics}</span><span>03</span></a>
          </nav>
        </section>

        <section className="reader-profile__privacy">
          <div>
            <span className="reader-section-label">{sectionCopy.privacy} / 04</span>
            <h2>{actionCopy.privacy}</h2>
            <p>{actionCopy.deleteDesc}</p>
          </div>
          {!showDeleteAccount ? (
            <button type="button" onClick={() => setShowDeleteAccount(true)}>{actionCopy.delete}</button>
          ) : (
            <div className="reader-profile__delete-confirmation">
              <label htmlFor="delete-account-password">{actionCopy.password}</label>
              <input id="delete-account-password" type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} autoComplete="current-password" />
              {deleteError && <p role="alert">{deleteError}</p>}
              <div>
                <button type="button" onClick={() => { setShowDeleteAccount(false); setDeletePassword(''); setDeleteError(''); }}>{actionCopy.cancel}</button>
                <button type="button" onClick={handleDeleteAccount} disabled={!deletePassword || isLoading}>{actionCopy.confirmDelete}</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
