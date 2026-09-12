const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS wk_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT NOT NULL DEFAULT '🦁',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wk_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT DEFAULT '',
      image TEXT,
      s3_key TEXT,
      type TEXT NOT NULL DEFAULT 'message',
      game TEXT,
      score INTEGER,
      reactions JSONB NOT NULL DEFAULT '[]',
      comments JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wk_videos (
      id TEXT PRIMARY KEY,
      youtube_id TEXT NOT NULL,
      title TEXT NOT NULL,
      added_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wk_coloring_sheets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image TEXT,
      s3_key TEXT,
      added_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wk_artworks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      s3_key TEXT,
      image_data TEXT,
      title TEXT DEFAULT 'My Artwork',
      shared_to_wall BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wk_friendships (
      id SERIAL PRIMARY KEY,
      requester_id TEXT NOT NULL,
      addressee_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(requester_id, addressee_id)
    )
  `);

  console.log('Database tables initialized');
}

// User operations
async function findUserByEmail(email) {
  const res = await query('SELECT * FROM wk_users WHERE email = $1', [email.toLowerCase()]);
  return res.rows[0] ? mapUser(res.rows[0]) : null;
}

async function findUserById(id) {
  const res = await query('SELECT * FROM wk_users WHERE id = $1', [id]);
  return res.rows[0] ? mapUser(res.rows[0]) : null;
}

async function getAllUsers() {
  const res = await query('SELECT * FROM wk_users ORDER BY created_at ASC');
  return res.rows.map(mapUser);
}

async function createUser(id, name, email, password, role, avatar) {
  await query(
    'INSERT INTO wk_users (id, name, email, password, role, avatar) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, name, email.toLowerCase(), password, role || 'user', avatar || '🦁']
  );
}

async function updateUserAvatar(id, avatar) {
  await query('UPDATE wk_users SET avatar = $1 WHERE id = $2', [avatar, id]);
}

async function ensureAdmin(email, password, name) {
  const existing = await findUserByEmail(email);
  if (!existing) {
    await createUser('admin_1', name, email, password, 'admin', '👑');
    console.log('Admin user created in database');
  }
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    avatar: row.avatar,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

// Post operations
async function getAllPosts() {
  const res = await query('SELECT * FROM wk_posts ORDER BY created_at DESC');
  return res.rows.map(mapPost);
}

async function createPost(post) {
  await query(
    `INSERT INTO wk_posts (id, user_id, content, image, s3_key, type, game, score, reactions, comments, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [post.id, post.userId, post.content, post.image, post.s3Key, post.type,
     post.game || null, post.score || null, JSON.stringify(post.reactions),
     JSON.stringify(post.comments), post.createdAt]
  );
}

async function findPostById(id) {
  const res = await query('SELECT * FROM wk_posts WHERE id = $1', [id]);
  return res.rows[0] ? mapPost(res.rows[0]) : null;
}

async function updatePostReactions(id, reactions) {
  await query('UPDATE wk_posts SET reactions = $1 WHERE id = $2', [JSON.stringify(reactions), id]);
}

async function updatePostComments(id, comments) {
  await query('UPDATE wk_posts SET comments = $1 WHERE id = $2', [JSON.stringify(comments), id]);
}

function mapPost(row) {
  return {
    id: row.id,
    userId: row.user_id,
    content: row.content,
    image: row.image,
    s3Key: row.s3_key,
    type: row.type,
    game: row.game,
    score: row.score,
    reactions: typeof row.reactions === 'string' ? JSON.parse(row.reactions) : (row.reactions || []),
    comments: typeof row.comments === 'string' ? JSON.parse(row.comments) : (row.comments || []),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

// Video operations
async function getAllVideos() {
  const res = await query('SELECT * FROM wk_videos ORDER BY created_at ASC');
  return res.rows.map(row => ({
    id: row.id,
    youtubeId: row.youtube_id,
    title: row.title,
    addedBy: row.added_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  }));
}

async function createVideo(id, youtubeId, title, addedBy) {
  await query(
    'INSERT INTO wk_videos (id, youtube_id, title, added_by) VALUES ($1, $2, $3, $4)',
    [id, youtubeId, title, addedBy]
  );
}

async function deleteVideo(id) {
  await query('DELETE FROM wk_videos WHERE id = $1', [id]);
}

async function seedDefaultVideos() {
  const existing = await query('SELECT COUNT(*) FROM wk_videos');
  if (parseInt(existing.rows[0].count) === 0) {
    await createVideo('vid_1', 'qyFNWVTHjPM', 'Video 1', 'admin');
    await createVideo('vid_2', '2OBEylayzjw', 'Video 2', 'admin');
    await createVideo('vid_3', 'pK5hiR2M75s', 'Video 3', 'admin');
    console.log('Default videos seeded');
  }
}

// Coloring sheet operations
async function getAllColoringSheets() {
  const res = await query('SELECT * FROM wk_coloring_sheets ORDER BY created_at ASC');
  return res.rows.map(row => ({
    id: row.id,
    title: row.title,
    image: row.image,
    s3Key: row.s3_key,
    addedBy: row.added_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  }));
}

async function createColoringSheet(id, title, image, s3Key, addedBy) {
  await query(
    'INSERT INTO wk_coloring_sheets (id, title, image, s3_key, added_by) VALUES ($1, $2, $3, $4, $5)',
    [id, title, image, s3Key, addedBy]
  );
}

async function deleteColoringSheet(id) {
  await query('DELETE FROM wk_coloring_sheets WHERE id = $1', [id]);
}

// Artwork operations
async function saveArtwork(id, userId, s3Key, imageData, title) {
  await query(
    'INSERT INTO wk_artworks (id, user_id, s3_key, image_data, title) VALUES ($1, $2, $3, $4, $5)',
    [id, userId, s3Key, imageData || null, title || 'My Artwork']
  );
}

async function getUserArtworks(userId) {
  const res = await query('SELECT * FROM wk_artworks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return res.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    s3Key: row.s3_key,
    imageData: row.image_data,
    title: row.title,
    sharedToWall: row.shared_to_wall,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  }));
}

async function markArtworkShared(id) {
  await query('UPDATE wk_artworks SET shared_to_wall = TRUE WHERE id = $1', [id]);
}

async function deleteArtwork(id) {
  await query('DELETE FROM wk_artworks WHERE id = $1', [id]);
}

// Friendship operations
async function sendFriendRequest(requesterId, addresseeId) {
  const existing = await query(
    'SELECT * FROM wk_friendships WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)',
    [requesterId, addresseeId]
  );
  if (existing.rows.length > 0) return null;
  await query(
    'INSERT INTO wk_friendships (requester_id, addressee_id, status) VALUES ($1, $2, $3)',
    [requesterId, addresseeId, 'pending']
  );
  return true;
}

async function acceptFriendRequest(requesterId, addresseeId) {
  await query(
    "UPDATE wk_friendships SET status = 'accepted' WHERE requester_id = $1 AND addressee_id = $2 AND status = 'pending'",
    [requesterId, addresseeId]
  );
}

async function removeFriend(userId1, userId2) {
  await query(
    'DELETE FROM wk_friendships WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)',
    [userId1, userId2]
  );
}

async function getFriendshipStatus(userId, otherUserId) {
  const res = await query(
    'SELECT * FROM wk_friendships WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)',
    [userId, otherUserId]
  );
  if (res.rows.length === 0) return 'none';
  const row = res.rows[0];
  if (row.status === 'accepted') return 'friends';
  if (row.requester_id === userId) return 'sent';
  return 'received';
}

async function getFriends(userId) {
  const res = await query(
    "SELECT * FROM wk_friendships WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'accepted'",
    [userId]
  );
  return res.rows.map(row => row.requester_id === userId ? row.addressee_id : row.requester_id);
}

async function getPendingRequests(userId) {
  const res = await query(
    "SELECT * FROM wk_friendships WHERE addressee_id = $1 AND status = 'pending'",
    [userId]
  );
  return res.rows.map(row => ({ requesterId: row.requester_id, createdAt: row.created_at }));
}

async function getSentRequests(userId) {
  const res = await query(
    "SELECT * FROM wk_friendships WHERE requester_id = $1 AND status = 'pending'",
    [userId]
  );
  return res.rows.map(row => row.addressee_id);
}

module.exports = {
  pool, query, initDatabase,
  findUserByEmail, findUserById, getAllUsers, createUser, updateUserAvatar, ensureAdmin, mapUser,
  getAllPosts, createPost, findPostById, updatePostReactions, updatePostComments,
  getAllVideos, createVideo, deleteVideo, seedDefaultVideos,
  getAllColoringSheets, createColoringSheet, deleteColoringSheet,
  saveArtwork, getUserArtworks, markArtworkShared, deleteArtwork,
  sendFriendRequest, acceptFriendRequest, removeFriend, getFriendshipStatus,
  getFriends, getPendingRequests, getSentRequests
};
