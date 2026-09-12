const express = require('express');
const { getPresignedUrl, isS3Configured, uploadToS3 } = require('../lib/s3');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

async function resolvePostImages(posts) {
  if (!isS3Configured()) return posts;
  const resolved = [];
  for (const post of posts) {
    const p = { ...post };
    if (p.s3Key && !p.image) {
      try { p.image = await getPresignedUrl(p.s3Key, 86400); } catch (e) { /* skip */ }
    }
    resolved.push(p);
  }
  return resolved;
}

router.get('/', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const store = req.app.locals.store;
    const users = await db.getAllUsers();
    let posts = await db.getAllPosts();

    const currentUserId = req.session.user ? req.session.user.id : null;
    let friendIds = [];
    let pendingRequesterIds = [];
    let sentIds = [];
    if (currentUserId) {
      friendIds = await db.getFriends(currentUserId);
      const pending = await db.getPendingRequests(currentUserId);
      pendingRequesterIds = pending.map(r => r.requesterId);
      sentIds = await db.getSentRequests(currentUserId);
    }

    // People suggestions (exclude self, friends, and pending)
    const people = currentUserId ? users.filter(u =>
      u.id !== currentUserId && !friendIds.includes(u.id) && !pendingRequesterIds.includes(u.id) && !sentIds.includes(u.id)
    ).slice(0, 8) : [];

    const pendingCount = pendingRequesterIds.length;

    posts = posts.map(p => {
      const author = users.find(u => u.id === p.userId);
      let friendship = 'none';
      if (currentUserId && p.userId !== currentUserId) {
        if (friendIds.includes(p.userId)) friendship = 'friends';
        else if (sentIds.includes(p.userId)) friendship = 'sent';
        else if (pendingRequesterIds.includes(p.userId)) friendship = 'received';
      }
      return {
        ...p,
        authorName: author ? author.name : 'Unknown',
        authorAvatar: author ? author.avatar : '👤',
        authorRole: author ? author.role : 'user',
        timeAgo: timeAgo(p.createdAt),
        reactionCount: (p.reactions || []).length,
        commentCount: (p.comments || []).length,
        userHasReacted: currentUserId ? (p.reactions || []).some(r => r.userId === currentUserId) : false,
        friendship
      };
    });

    posts = await resolvePostImages(posts);

    res.render('wall', {
      title: 'WonderKids Wall — Share & Celebrate',
      activeNav: 'wall',
      progress: { ...store.child, ...store.progress },
      parent: store.parent,
      posts,
      people,
      pendingCount,
      shareScore: req.query.share_score || null,
      shareGame: req.query.game || null
    });
  } catch (err) {
    next(err);
  }
});

router.post('/post', requireAuth, async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { content, imageData, imageUrl, artS3Key } = req.body;
    const user = req.session.user;

    if (!content && !imageData && !imageUrl && !artS3Key) return res.redirect('/wall');

    const post = {
      id: 'post_' + Date.now(),
      userId: user.id,
      content: content || '',
      image: null,
      s3Key: null,
      type: 'message',
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    // Priority 1: Use s3Key directly from artwork (no re-upload needed)
    if (artS3Key && typeof artS3Key === 'string' && artS3Key.trim()) {
      post.s3Key = artS3Key.trim();
      post.type = 'artwork';
      // Generate a presigned URL for display
      if (isS3Configured()) {
        try { post.image = await getPresignedUrl(post.s3Key, 86400); } catch (e) { /* ok */ }
      }
    }
    // Priority 2: Use a direct image URL (e.g., presigned S3 URL from artwork page)
    else if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      post.image = imageUrl;
      post.type = 'artwork';
    }
    // Priority 3: Upload base64 image data to S3
    else if (imageData && typeof imageData === 'string') {
      const match = imageData.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
      if (match) {
        const buffer = Buffer.from(match[2], 'base64');
        if (buffer.length <= 10 * 1024 * 1024 && isS3Configured()) {
          const key = 'wall-images/' + post.id + '.' + (match[1] === 'jpeg' ? 'jpg' : match[1]);
          await uploadToS3(buffer, key, 'image/' + match[1]);
          post.s3Key = key;
          post.type = 'artwork';
          try { post.image = await getPresignedUrl(key, 86400); } catch (e) { /* ok */ }
        }
      }
    }

    if (req.body.artworkId) {
      try { await db.markArtworkShared(req.body.artworkId); } catch (e) { /* ok */ }
    }

    await db.createPost(post);
    res.redirect('/wall');
  } catch (err) {
    console.error('Post error:', err);
    res.redirect('/wall');
  }
});

router.post('/score', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { game, score, detail } = req.body;
    const user = req.session.user;

    if (!game || score === undefined) {
      return res.status(400).json({ success: false, error: 'game and score required' });
    }

    const post = {
      id: 'post_' + Date.now(),
      userId: user.id,
      content: `Scored ${score} points in ${game}! ${detail || ''}`,
      image: null, s3Key: null,
      type: 'score', game, score: Number(score),
      reactions: [], comments: [],
      createdAt: new Date().toISOString()
    };

    await db.createPost(post);
    return res.json({ success: true, post });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/react', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { postId, emoji } = req.body;
    const user = req.session.user;
    const post = await db.findPostById(postId);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const existing = post.reactions.findIndex(r => r.userId === user.id);
    if (existing !== -1) {
      post.reactions.splice(existing, 1);
      await db.updatePostReactions(postId, post.reactions);
      return res.json({ success: true, action: 'removed', count: post.reactions.length });
    }

    post.reactions.push({ userId: user.id, emoji: emoji || '❤️', createdAt: new Date().toISOString() });
    await db.updatePostReactions(postId, post.reactions);
    return res.json({ success: true, action: 'added', count: post.reactions.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/comment', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { postId, text } = req.body;
    const user = req.session.user;

    if (!text || !text.trim()) return res.status(400).json({ success: false, error: 'Comment text required' });

    const post = await db.findPostById(postId);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const comment = {
      id: 'cmt_' + Date.now(),
      userId: user.id, userName: user.name, userAvatar: user.avatar,
      text: text.trim(), createdAt: new Date().toISOString()
    };

    post.comments.push(comment);
    await db.updatePostComments(postId, post.comments);
    return res.json({ success: true, comment, count: post.comments.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/comments/:postId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const post = await db.findPostById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const comments = (post.comments || []).map(c => ({ ...c, timeAgo: timeAgo(c.createdAt) }));
    return res.json({ success: true, comments });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Friend request
router.post('/friend/add', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req.body;
    const user = req.session.user;
    if (!userId || userId === user.id) return res.status(400).json({ success: false, error: 'Invalid user' });

    const target = await db.findUserById(userId);
    if (!target) return res.status(404).json({ success: false, error: 'User not found' });

    const existing = await db.getFriendshipStatus(user.id, userId);
    if (existing !== 'none') return res.json({ success: true, status: existing, message: 'Already connected' });

    await db.sendFriendRequest(user.id, userId);
    return res.json({ success: true, status: 'sent' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Accept friend request
router.post('/friend/accept', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req.body;
    const user = req.session.user;
    await db.acceptFriendRequest(userId, user.id);
    return res.json({ success: true, status: 'friends' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Remove friend / cancel request / decline request
router.post('/friend/remove', requireAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req.body;
    const user = req.session.user;
    await db.removeFriend(user.id, userId);
    return res.json({ success: true, status: 'none' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get friends list
router.get('/friends', requireAuth, async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const store = req.app.locals.store;
    const user = req.session.user;
    const users = await db.getAllUsers();
    const friendIds = await db.getFriends(user.id);
    const pendingRequests = await db.getPendingRequests(user.id);
    const sentIds = await db.getSentRequests(user.id);

    const friends = friendIds.map(id => users.find(u => u.id === id)).filter(Boolean);
    const pending = pendingRequests.map(r => {
      const u = users.find(u => u.id === r.requesterId);
      return u ? { ...u, requestedAt: r.createdAt } : null;
    }).filter(Boolean);
    const suggestions = users.filter(u => u.id !== user.id && !friendIds.includes(u.id) && !sentIds.includes(u.id));

    res.render('friends', {
      title: 'Friends - WonderKids Wall',
      activeNav: 'wall',
      progress: { ...store.child, ...store.progress },
      parent: store.parent,
      friends,
      pendingRequests: pending,
      suggestions,
      sentIds
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
