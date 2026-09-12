const express = require('express');

const { SCENES, STORIES, getStory } = require('../data/stories');
const { getPresignedUrls, isS3Configured } = require('../lib/s3');

const router = express.Router();

function buildProgress(req) {
  const { child, progress } = req.app.locals.store;
  return { ...child, ...progress };
}

router.get('/', (req, res, next) => {
  try {
    res.render('index', {
      title: 'WonderKids \u2014 Learn, Play & Imagine! | Safe Child-Friendly Learning',
      activeNav: 'home',
      progress: buildProgress(req),
      parent: req.app.locals.store.parent
    });
  } catch (err) {
    next(err);
  }
});

router.get('/games', (req, res, next) => {
  try {
    res.render('games', {
      title: 'Games Arcade \u2014 WonderKids | Brain-Boosting Puzzles & Math Quests',
      activeNav: 'games',
      progress: buildProgress(req),
      parent: req.app.locals.store.parent
    });
  } catch (err) {
    next(err);
  }
});

router.get('/coloring', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const store = req.app.locals.store;
    let sheets = await db.getAllColoringSheets();

    if (isS3Configured()) {
      sheets = await getPresignedUrls(sheets);
    }

    res.render('coloring', {
      title: 'Coloring Studio \u2014 WonderKids | Free Coloring Pages & Draw',
      activeNav: 'coloring',
      progress: buildProgress(req),
      parent: store.parent,
      coloringSheets: sheets
    });
  } catch (err) {
    next(err);
  }
});

router.get('/stories', (req, res, next) => {
  try {
    res.render('stories', {
      title: 'Story Island \u2014 WonderKids | Interactive Kids Stories & Books',
      activeNav: 'stories',
      progress: buildProgress(req),
      parent: req.app.locals.store.parent,
      stories: STORIES
    });
  } catch (err) {
    next(err);
  }
});

router.get('/stories/:id', (req, res, next) => {
  try {
    const story = getStory(req.params.id);
    if (!story) {
      return res.status(404).render('error', {
        title: 'Story not found - WonderKids',
        activeNav: 'stories',
        progress: buildProgress(req),
        status: 404,
        message: 'That story wandered off into the Whispering Forest. Let\u2019s find another one!'
      });
    }
    res.render('story-reader', {
      title: `${story.title} \u2014 WonderKids Story Reader`,
      activeNav: 'stories',
      progress: buildProgress(req),
      parent: req.app.locals.store.parent,
      story,
      SCENES
    });
  } catch (err) {
    next(err);
  }
});

router.get('/videos', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const store = req.app.locals.store;
    const videos = await db.getAllVideos();

    res.render('videos', {
      title: 'Play & Learn Videos \u2014 WonderKids | Malik\'s Wonderland',
      activeNav: 'videos',
      progress: buildProgress(req),
      parent: store.parent,
      videos
    });
  } catch (err) {
    next(err);
  }
});

router.get('/parent-zone', (req, res, next) => {
  try {
    res.render('parent-dashboard', {
      title: 'Parent Zone \u2014 WonderKids',
      activeNav: 'parent',
      progress: buildProgress(req),
      parent: req.app.locals.store.parent
    });
  } catch (err) {
    next(err);
  }
});

router.get('/my-artwork', async (req, res, next) => {
  if (!req.session.user) return res.redirect('/auth/login');
  try {
    const db = req.app.locals.db;
    const store = req.app.locals.store;
    const { getPresignedUrl, isS3Configured } = require('../lib/s3');
    let artworks = await db.getUserArtworks(req.session.user.id);

    if (isS3Configured()) {
      for (let i = 0; i < artworks.length; i++) {
        if (artworks[i].s3Key) {
          try { artworks[i].imageUrl = await getPresignedUrl(artworks[i].s3Key, 86400); } catch (e) { artworks[i].imageUrl = null; }
        }
      }
    }

    res.render('my-artwork', {
      title: 'My Artwork - WonderKids',
      activeNav: '',
      progress: buildProgress(req),
      parent: store.parent,
      artworks
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
