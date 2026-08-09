const isAmazonHostname = (hostname: string): boolean =>
  hostname === "amazon.com" || hostname.startsWith("amazon.") || hostname.includes(".amazon.");

export const isPublicSourceUrl = (value: string | undefined): value is string => {
  if (!value) return false;

  try {
    const url = new URL(value);
    return !(isAmazonHostname(url.hostname.toLowerCase()) && url.searchParams.has("tag"));
  } catch {
    return false;
  }
};
