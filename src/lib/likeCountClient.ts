const MAX_BATCH_SIZE = 50;

interface PendingLikeCount {
  resolve: (count: number) => void;
  reject: (error: unknown) => void;
}

const cache = new Map<string, Promise<number>>();
const pending = new Map<string, PendingLikeCount>();
let flushTimer: ReturnType<typeof setTimeout> | undefined;

async function fetchBatch(contentIds: string[]) {
  const search = new URLSearchParams();
  for (const contentId of contentIds) search.append('contentIds', contentId);

  const response = await fetch(`/api/likes/count?${search.toString()}`);
  if (!response.ok) throw new Error(`Like count request failed with ${response.status}`);

  const data = await response.json() as { counts?: Record<string, number> };
  for (const contentId of contentIds) {
    const entry = pending.get(contentId);
    if (!entry) continue;
    entry.resolve(data.counts?.[contentId] ?? 0);
    pending.delete(contentId);
  }
}

async function flushPending() {
  flushTimer = undefined;
  const contentIds = Array.from(pending.keys());

  for (let index = 0; index < contentIds.length; index += MAX_BATCH_SIZE) {
    const batch = contentIds.slice(index, index + MAX_BATCH_SIZE);
    try {
      await fetchBatch(batch);
    } catch (error) {
      for (const contentId of batch) {
        pending.get(contentId)?.reject(error);
        pending.delete(contentId);
        cache.delete(contentId);
      }
    }
  }
}

export function requestLikeCount(contentId: string): Promise<number> {
  const cached = cache.get(contentId);
  if (cached) return cached;

  const request = new Promise<number>((resolve, reject) => {
    pending.set(contentId, { resolve, reject });
    flushTimer ??= setTimeout(flushPending, 0);
  });
  cache.set(contentId, request);
  return request;
}
