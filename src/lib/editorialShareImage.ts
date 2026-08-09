export type TextFirstContentType = "article" | "paper";

const siteBase = "https://www.femres.org";

const shareImagePaths: Record<TextFirstContentType, string> = {
  article: "/og-article.jpg",
  paper: "/og-paper.jpg",
};

export function getEditorialShareImage(type: TextFirstContentType): string {
  return new URL(shareImagePaths[type], siteBase).href;
}
