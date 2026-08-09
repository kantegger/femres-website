// Database utility functions for Supabase Postgres
import { randomUUID } from 'node:crypto';
import postgres from 'postgres';
import { getDatabaseSslOptions } from './dbSsl';

// Initialize postgres client with connection string from environment
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: getDatabaseSslOptions(),
  prepare: false  // Disable prepared statements to simplify template literal usage
});

// Export sql instance for health checks
export { sql };

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  content_id: string;
  content_type: string;
  user_id: string;
  parent_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  username?: string;
  is_liked?: boolean;
  replies?: Comment[];
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface UserInteraction {
  id: string;
  user_id: string;
  content_id: string;
  content_type: string;
  interaction_type: string;
  created_at: string;
}

type QueryResult = readonly unknown[];

function requiredRow<T>(result: QueryResult): T {
  const row = result[0];
  if (!row) {
    throw new Error('Expected database query to return a row');
  }
  return row as T;
}

function optionalRow<T>(result: QueryResult): T | null {
  return (result[0] as T | undefined) ?? null;
}

function rows<T>(result: QueryResult): T[] {
  return result as T[];
}

// Generate collision-resistant IDs for user and interaction rows.
export function generateId(): string {
  return randomUUID();
}

// User operations
export async function createUser(userData: {
  username: string;
  email: string;
  password_hash: string;
}): Promise<User> {
  const id = generateId();
  const now = new Date().toISOString();

  const result = await sql`
    INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
    VALUES (${id}, ${userData.username}, ${userData.email}, ${userData.password_hash}, ${now}, ${now})
    RETURNING *
  `;

  return requiredRow<User>(result);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;

  return optionalRow<User>(result);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `;

  return optionalRow<User>(result);
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${userId} LIMIT 1
  `;

  return optionalRow<User>(result);
}

export async function updateUsername(userId: string, newUsername: string): Promise<User | null> {
  const now = new Date().toISOString();

  const result = await sql`
    UPDATE users
    SET username = ${newUsername}, updated_at = ${now}
    WHERE id = ${userId}
    RETURNING *
  `;

  return optionalRow<User>(result);
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM users
    WHERE id = ${userId}
    RETURNING id
  `;

  return result.length > 0;
}

// Comment operations
export async function createComment(commentData: {
  content: string;
  content_id: string;
  content_type: string;
  user_id: string;
  parent_id?: string;
}): Promise<Comment> {
  const id = generateId();
  const now = new Date().toISOString();

  const result = await sql`
    INSERT INTO comments (id, content, content_id, content_type, user_id, parent_id, created_at, updated_at)
    VALUES (${id}, ${commentData.content}, ${commentData.content_id}, ${commentData.content_type}, ${commentData.user_id}, ${commentData.parent_id || null}, ${now}, ${now})
    RETURNING *
  `;

  return requiredRow<Comment>(result);
}

export async function getComments(contentId: string, contentType: string, userId?: string): Promise<Comment[]> {
  if (userId) {
    const result = await sql`
      SELECT
        c.*,
        u.username,
        CASE WHEN cl.id IS NOT NULL THEN true ELSE false END as is_liked
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id AND cl.user_id = ${userId}
      WHERE c.content_id = ${contentId} AND c.content_type = ${contentType}
      ORDER BY c.created_at DESC
    `;
    return rows<Comment>(result);
  } else {
    const result = await sql`
      SELECT c.*, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.content_id = ${contentId} AND c.content_type = ${contentType}
      ORDER BY c.created_at DESC
    `;
    return rows<Comment>(result);
  }
}

export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM comments
    WHERE id = ${commentId} AND user_id = ${userId}
    RETURNING id
  `;

  return result.length > 0;
}

export type CommentReportReason = 'spam' | 'harassment' | 'hate' | 'privacy' | 'other';

export async function createCommentReport(reportData: {
  comment_id: string;
  reporter_id: string;
  reason: CommentReportReason;
  details?: string;
}): Promise<void> {
  const id = generateId();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO comment_reports (id, comment_id, reporter_id, reason, details, status, created_at, updated_at)
    SELECT ${id}, c.id, ${reportData.reporter_id}, ${reportData.reason}, ${reportData.details || null}, 'pending', ${now}, ${now}
    FROM comments c
    WHERE c.id = ${reportData.comment_id}
      AND c.user_id <> ${reportData.reporter_id}
    ON CONFLICT (comment_id, reporter_id) DO UPDATE
    SET reason = EXCLUDED.reason,
        details = EXCLUDED.details,
        status = 'pending',
        updated_at = EXCLUDED.updated_at
  `;
}

// Comment like operations
export async function likeComment(commentId: string, userId: string): Promise<void> {
  const id = generateId();
  const now = new Date().toISOString();

  await sql`
    WITH inserted AS (
      INSERT INTO comment_likes (id, comment_id, user_id, created_at)
      VALUES (${id}, ${commentId}, ${userId}, ${now})
      ON CONFLICT (comment_id, user_id) DO NOTHING
      RETURNING 1
    )
    UPDATE comments
    SET likes_count = likes_count + 1
    WHERE id = ${commentId}
      AND EXISTS (SELECT 1 FROM inserted)
  `;
}

export async function unlikeComment(commentId: string, userId: string): Promise<void> {
  const result = await sql`
    DELETE FROM comment_likes
    WHERE comment_id = ${commentId} AND user_id = ${userId}
  `;

  if (result.length > 0) {
    await sql`
      UPDATE comments
      SET likes_count = GREATEST(0, likes_count - 1)
      WHERE id = ${commentId}
    `;
  }
}

export async function isCommentLiked(commentId: string, userId: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM comment_likes
    WHERE comment_id = ${commentId} AND user_id = ${userId}
    LIMIT 1
  `;

  return result.length > 0;
}

// User interaction operations
export async function createInteraction(
  userId: string,
  contentId: string,
  contentType: string,
  interactionType: string
): Promise<void> {
  const id = generateId();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO user_interactions (id, user_id, content_id, content_type, interaction_type, created_at)
    VALUES (${id}, ${userId}, ${contentId}, ${contentType}, ${interactionType}, ${now})
    ON CONFLICT (user_id, content_id, interaction_type) DO NOTHING
  `;
}

export async function deleteInteraction(
  userId: string,
  contentId: string,
  interactionType: string
): Promise<void> {
  await sql`
    DELETE FROM user_interactions
    WHERE user_id = ${userId}
      AND content_id = ${contentId}
      AND interaction_type = ${interactionType}
  `;
}

export async function getUserInteractions(
  userId: string,
  interactionType?: string
): Promise<UserInteraction[]> {
  if (interactionType) {
    const result = await sql`
      SELECT * FROM user_interactions
      WHERE user_id = ${userId} AND interaction_type = ${interactionType}
      ORDER BY created_at DESC
    `;
    return rows<UserInteraction>(result);
  } else {
    const result = await sql`
      SELECT * FROM user_interactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return rows<UserInteraction>(result);
  }
}

// Legacy function signatures for compatibility
export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<boolean> {
  const existing = await isCommentLiked(commentId, userId);

  if (existing) {
    await unlikeComment(commentId, userId);
    return false; // Unliked
  } else {
    await likeComment(commentId, userId);
    return true; // Liked
  }
}

export async function getCommentsByContent(
  contentId: string,
  userId?: string
): Promise<Comment[]> {
  // Get top-level comments
  const topComments = await getComments(contentId, 'content', userId);

  // Filter to only parent comments and get their replies
  const parentComments = topComments.filter(c => !c.parent_id);

  for (const comment of parentComments) {
    const replies = topComments.filter(c => c.parent_id === comment.id);
    comment.replies = replies;
  }

  return parentComments;
}

export async function toggleUserInteraction(
  userId: string,
  contentId: string,
  contentType: string,
  interactionType: 'like' | 'bookmark'
): Promise<boolean> {
  const result = await sql`
    SELECT id FROM user_interactions
    WHERE user_id = ${userId}
      AND content_id = ${contentId}
      AND interaction_type = ${interactionType}
    LIMIT 1
  `;

  if (result.length > 0) {
    // Remove interaction
    await deleteInteraction(userId, contentId, interactionType);
    return false;
  } else {
    // Add interaction
    await createInteraction(userId, contentId, contentType, interactionType);
    return true;
  }
}

export async function getInteractionStatus(
  userId: string,
  contentId: string
): Promise<{ liked: boolean; bookmarked: boolean }> {
  const result = await sql`
    SELECT interaction_type FROM user_interactions
    WHERE user_id = ${userId} AND content_id = ${contentId}
  `;

  const interactions = rows<UserInteraction>(result);

  return {
    liked: interactions.some(i => i.interaction_type === 'like'),
    bookmarked: interactions.some(i => i.interaction_type === 'bookmark')
  };
}

export async function getLikeCount(contentId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM user_interactions
    WHERE content_id = ${contentId} AND interaction_type = 'like'
  `;

  const row = optionalRow<{ count: string | number }>(result);
  const count = typeof row?.count === 'number' ? row.count : parseInt(row?.count ?? '0', 10);
  return Number.isNaN(count) ? 0 : count;
}

export async function getLikeCounts(contentIds: string[]): Promise<Record<string, number>> {
  const counts = Object.fromEntries(contentIds.map((contentId) => [contentId, 0]));
  if (contentIds.length === 0) return counts;

  const result = await sql`
    SELECT content_id, COUNT(*) as count
    FROM user_interactions
    WHERE content_id IN ${sql(contentIds)} AND interaction_type = 'like'
    GROUP BY content_id
  `;

  for (const row of rows<{ content_id: string; count: string | number }>(result)) {
    const count = typeof row.count === 'number' ? row.count : parseInt(row.count, 10);
    counts[row.content_id] = Number.isNaN(count) ? 0 : count;
  }

  return counts;
}
export async function subscribeToNewsletter(email: string, source: string = 'website'): Promise<boolean> {
  const id = generateId();
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO newsletter_subscribers (id, email, source, created_at)
      VALUES (${id}, ${email}, ${source}, ${now})
      ON CONFLICT (email) DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error('Failed to subscribe:', error);
    return false;
  }
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  await sql`
    DELETE FROM newsletter_subscribers
    WHERE LOWER(email) = LOWER(${email})
  `;
}
