import type { AuthTranslations } from '../types/profile';
import type { Locale } from '../i18n';
import '../i18n/translations';
import { createT } from '../i18n';

export type DiscussionContentType = 'book' | 'article' | 'video' | 'podcast' | 'paper' | 'film';

export interface DiscussionCopy {
  title: string;
  description: string;
  eyebrow: string;
  responses: string;
  like: string;
  cancel: string;
  close: string;
  user: string;
  signedInAs: string;
  deleteComment: string;
  deleteConfirm: string;
  report: string;
  reported: string;
  reply: string;
  replyTo: string;
  shareYourThoughts: string;
  postComment: string;
  posting: string;
  joinDiscussion: string;
  loginToDiscuss: string;
  loadingComments: string;
  noCommentsYet: string;
  loginRequired: string;
  loadError: string;
  retry: string;
  auth: AuthTranslations;
}

const editorialCopy: Record<Locale, Pick<DiscussionCopy,
  'eyebrow' | 'responses' | 'like' | 'cancel' | 'close' | 'user' | 'signedInAs' |
  'deleteComment' | 'deleteConfirm' | 'report' | 'reported' | 'loadError' | 'retry'
>> = {
  'zh-CN': { eyebrow: '读者回应', responses: '回应', like: '赞同', cancel: '取消', close: '关闭', user: '读者', signedInAs: '发言者', deleteComment: '删除', deleteConfirm: '确定永久删除这条回应吗？', report: '举报', reported: '已举报', loadError: '回应暂时无法载入，请稍后再试。', retry: '重新载入' },
  'zh-TW': { eyebrow: '讀者回應', responses: '回應', like: '贊同', cancel: '取消', close: '關閉', user: '讀者', signedInAs: '發言者', deleteComment: '刪除', deleteConfirm: '確定永久刪除這則回應嗎？', report: '檢舉', reported: '已檢舉', loadError: '回應暫時無法載入，請稍後再試。', retry: '重新載入' },
  en: { eyebrow: 'Reader responses', responses: 'Responses', like: 'Appreciate', cancel: 'Cancel', close: 'Close', user: 'Reader', signedInAs: 'Writing as', deleteComment: 'Delete', deleteConfirm: 'Permanently delete this response?', report: 'Report', reported: 'Reported', loadError: 'Responses are temporarily unavailable. Please try again.', retry: 'Retry' },
  ja: { eyebrow: '読者の声', responses: 'コメント', like: '共感', cancel: 'キャンセル', close: '閉じる', user: '読者', signedInAs: '投稿者', deleteComment: '削除', deleteConfirm: 'このコメントを完全に削除しますか？', report: '報告', reported: '報告済み', loadError: 'コメントを読み込めませんでした。もう一度お試しください。', retry: '再読み込み' },
  fr: { eyebrow: 'Réponses des lecteurs', responses: 'Réponses', like: 'Apprécier', cancel: 'Annuler', close: 'Fermer', user: 'Lecteur', signedInAs: 'Écrire en tant que', deleteComment: 'Supprimer', deleteConfirm: 'Supprimer définitivement cette réponse ?', report: 'Signaler', reported: 'Signalé', loadError: 'Les réponses sont momentanément indisponibles. Veuillez réessayer.', retry: 'Réessayer' },
};

export function getDiscussionCopy(
  locale: Locale,
  contentType: DiscussionContentType,
  title?: string,
  description?: string,
): DiscussionCopy {
  const t = createT(locale);
  const translatedType = contentType === 'film' ? 'video' : contentType;
  const typeTitle = t(`discussion.contentType.${translatedType}.title`).replace(/^\p{Extended_Pictographic}\s*/u, '');
  const typeDescription = t(`discussion.contentType.${translatedType}.description`);
  const editorial = editorialCopy[locale];

  return {
    ...editorial,
    title: title || (typeTitle.startsWith('discussion.') ? t('discussion.title') : typeTitle),
    description: description || (typeDescription.startsWith('discussion.') ? t('discussion.description') : typeDescription),
    reply: t('discussion.reply'),
    replyTo: t('discussion.replyTo'),
    shareYourThoughts: t('discussion.shareYourThoughts'),
    postComment: t('discussion.postComment'),
    posting: t('discussion.posting'),
    joinDiscussion: t('discussion.joinDiscussion'),
    loginToDiscuss: t('discussion.loginToDiscuss'),
    loadingComments: t('discussion.loadingComments'),
    noCommentsYet: t('discussion.noCommentsYet'),
    loginRequired: t('discussion.loginRequired'),
    auth: {
      login: t('auth.login'), register: t('auth.register'), username: t('auth.username'), email: t('auth.email'),
      password: t('auth.password'), confirmPassword: t('auth.confirmPassword'), usernamePlaceholder: t('auth.usernamePlaceholder'),
      emailPlaceholder: t('auth.emailPlaceholder'), passwordPlaceholder: t('auth.passwordPlaceholder'),
      confirmPasswordPlaceholder: t('auth.confirmPasswordPlaceholder'), loginPrompt: t('auth.loginPrompt'),
      registerPrompt: t('auth.registerPrompt'), haveAccount: t('auth.haveAccount'), noAccount: t('auth.noAccount'),
      loginInProgress: t('auth.loginInProgress'), registerInProgress: t('auth.registerInProgress'), fillAllFields: t('auth.fillAllFields'),
      fillEmailPassword: t('auth.fillEmailPassword'), passwordMismatch: t('auth.passwordMismatch'), invalidEmail: t('auth.invalidEmail'),
      loginFailed: t('auth.loginFailed'), registerFailed: t('auth.registerFailed'), networkError: t('auth.networkError'),
    },
  };
}
