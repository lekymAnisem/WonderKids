const fs = require('fs');
const path = require('path');
const express = require('express');
const { uploadToS3, isS3Configured } = require('../lib/s3');

const router = express.Router();

const QUIZ_ANSWER = 8;
const QUIZ_REWARD = 25;
const MAX_ARTWORKS = 50;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ARTWORK_DIR = path.join(__dirname, '..', 'data', 'artworks');

fs.mkdirSync(ARTWORK_DIR, { recursive: true });

function trimArtworks(store) {
  while (store.savedArtworks.length > MAX_ARTWORKS) {
    const oldest = store.savedArtworks.shift();
    if (oldest && oldest.file) {
      fs.promises.unlink(oldest.file).catch(() => {});
    }
  }
}

router.get('/progress', (req, res) => {
  const { child, progress } = req.app.locals.store;
  res.json({
    success: true,
    data: { name: child.name, avatar: child.avatar, ...progress }
  });
});

router.post('/quiz/submit', (req, res) => {
  const store = req.app.locals.store;
  const answer = Number(req.body && req.body.answer);

  if (!Number.isFinite(answer)) {
    return res.status(400).json({
      success: false,
      error: 'A numeric "answer" field is required.'
    });
  }

  const correct = answer === QUIZ_ANSWER;
  const alreadySolved = store.progress.quizSolved === true;
  const awarded = correct && !alreadySolved;

  if (awarded) {
    store.progress.quizSolved = true;
    store.progress.stars += QUIZ_REWARD;
    store.progress.questsCompleted = Math.min(
      store.progress.totalQuests,
      store.progress.questsCompleted + 1
    );
  }

  return res.json({
    success: true,
    correct,
    alreadySolved,
    expected: QUIZ_ANSWER,
    reward: awarded ? QUIZ_REWARD : 0,
    stars: store.progress.stars,
    message: correct
      ? awarded
        ? `Awesome job! 5 + 3 = 8! +${QUIZ_REWARD} Stars added to ${store.child.name}'s backpack!`
        : 'Already solved! Great memory, explorer.'
      : 'Almost there, explorer! Count the crystals one more time.'
  });
});

router.post('/canvas/save', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const { imageData, compositeData } = req.body || {};

    const rawData = compositeData || imageData;
    const match = typeof rawData === 'string'
      ? rawData.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/)
      : null;

    if (!match) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing imageData (expected a png/jpeg/webp base64 data URL).'
      });
    }

    const buffer = Buffer.from(match[2], 'base64');

    if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({
        success: false,
        error: `Artwork must be between 1 byte and ${MAX_IMAGE_BYTES} bytes.`
      });
    }

    const id = `art_${Date.now()}`;
    const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
    const filename = `${id}.${extension}`;
    let s3Key = null;

    if (isS3Configured()) {
      s3Key = 'artworks/' + filename;
      await uploadToS3(buffer, s3Key, 'image/' + match[1]);
    }

    const userId = req.session.user ? req.session.user.id : null;
    if (userId) {
      await db.saveArtwork(id, userId, s3Key, s3Key ? null : rawData, 'My Artwork');
    }

    return res.status(201).json({
      success: true,
      id,
      s3Key,
      bytes: buffer.length,
      message: 'Saved to Backpack! \u2b50'
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

// Artwork delete endpoint
const artworkRouter = express.Router();

artworkRouter.post('/delete', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  try {
    const db = req.app.locals.db;
    await db.deleteArtwork(req.body.artworkId);
    res.redirect('/my-artwork');
  } catch (err) {
    res.redirect('/my-artwork');
  }
});

module.exports.artworkRouter = artworkRouter;
