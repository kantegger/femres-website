// Database utility functions for Supabase Postgres
import postgres from 'postgres';

// Initialize postgres client with connection string from environment
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: {
    rejectUnauthorized: false  // Supabase pooler uses self-signed certificate
  },
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

// Generate UUID-like ID
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
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

  return result[0] as unknown as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;

  return (result[0] as unknown as User) || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `;

  return (result[0] as unknown as User) || null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${userId} LIMIT 1
  `;

  return (result[0] as unknown as User) || null;
}

export async function updateUsername(userId: string, newUsername: string): Promise<User | null> {
  const now = new Date().toISOString();

  const result = await sql`
    UPDATE users
    SET username = ${newUsername}, updated_at = ${now}
    WHERE id = ${userId}
    RETURNING *
  `;

  return (result[0] as unknown as User) || null;
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

  return result[0] as unknown as Comment;
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
    return result as unknown as Comment[];
  } else {
    const result = await sql`
      SELECT c.*, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.content_id = ${contentId} AND c.content_type = ${contentType}
      ORDER BY c.created_at DESC
    `;
    return result as unknown as Comment[];
  }
}

export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM comments
    WHERE id = ${commentId} AND user_id = ${userId}
  `;

  return result.length > 0;
}

// Comment like operations
export async function likeComment(commentId: string, userId: string): Promise<void> {
  const id = generateId();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO comment_likes (id, comment_id, user_id, created_at)
    VALUES (${id}, ${commentId}, ${userId}, ${now})
    ON CONFLICT (comment_id, user_id) DO NOTHING
  `;

  await sql`
    UPDATE comments
    SET likes_count = likes_count + 1
    WHERE id = ${commentId}
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
    return result as unknown as UserInteraction[];
  } else {
    const result = await sql`
      SELECT * FROM user_interactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result as unknown as UserInteraction[];
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

  const interactions = result as unknown as UserInteraction[];

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

  return parseInt((result[0] as any).count) || 0;
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
