const fs = require('fs');
const path = require('path');
const express = require('express');
const { uploadToS3, isS3Configured, getPresignedUrls } = require('../lib/s3');
const router = express.Router();

const COLORING_DIR = path.join(__dirname, '..', 'public', 'uploads', 'coloring');
fs.mkdirSync(COLORING_DIR, { recursive: true });

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Access Denied - WonderKids',
      activeNav: '',
      progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress },
      status: 403,
      message: 'You need admin access to view this page.'
    });
  }
  next();
}

router.use(requireAdmin);

router.get('/', async (req, res) => {
  const store = req.app.locals.store;
  const db = req.app.locals.db;
  let sheets = await db.getAllColoringSheets();
  const videos = await db.getAllVideos();
  const users = await db.getAllUsers();

  if (isS3Configured()) {
    sheets = await getPresignedUrls(sheets);
  }

  res.render('admin', {
    title: 'Admin Dashboard - WonderKids',
    activeNav: '',
    progress: { ...store.child, ...store.progress },
    videos,
    coloringSheets: sheets,
    users,
    success: req.query.success || null,
    error: req.query.error || null
  });
});

function extractYouTubeId(input) {
  if (!input) return null;
  const s = input.trim();
  var m = s.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  return null;
}

router.post('/video/add', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { youtubeId, title } = req.body;

    if (!youtubeId || !title) return res.redirect('/admin?error=YouTube+ID+and+title+are+required');

    const cleanId = extractYouTubeId(youtubeId);
    if (!cleanId) return res.redirect('/admin?error=Invalid+YouTube+URL+or+ID');

    const videos = await db.getAllVideos();
    if (videos.find(v => v.youtubeId === cleanId)) return res.redirect('/admin?error=This+video+already+exists');

    await db.createVideo('vid_' + Date.now(), cleanId, title.trim(), req.session.user.name);
    res.redirect('/admin?success=Video+added+successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/admin?error=Failed+to+add+video');
  }
});

router.post('/video/delete', async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.deleteVideo(req.body.videoId);
    res.redirect('/admin?success=Video+deleted');
  } catch (err) {
    res.redirect('/admin?error=Failed+to+delete+video');
  }
});

router.post('/coloring/add', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { title, imageData } = req.body;

    if (!title || !imageData) return res.redirect('/admin?error=Title+and+image+are+required');

    const match = typeof imageData === 'string'
      ? imageData.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/) : null;
    if (!match) return res.redirect('/admin?error=Invalid+image+format');

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 10 * 1024 * 1024) return res.redirect('/admin?error=Image+too+large');

    const id = 'cs_' + Date.now();
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const filename = id + '.' + ext;

    if (isS3Configured()) {
      const key = 'coloring-sheets/' + filename;
      await uploadToS3(buffer, key, 'image/' + match[1]);
      await db.createColoringSheet(id, title.trim(), null, key, req.session.user.name);
    } else {
      const filePath = path.join(COLORING_DIR, filename);
      await fs.promises.writeFile(filePath, buffer);
      await db.createColoringSheet(id, title.trim(), '/uploads/coloring/' + filename, null, req.session.user.name);
    }

    res.redirect('/admin?success=Coloring+sheet+added+successfully');
  } catch (err) {
    console.error('Upload error:', err);
    res.redirect('/admin?error=Failed+to+upload+image');
  }
});

router.post('/coloring/delete', async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.deleteColoringSheet(req.body.sheetId);
    res.redirect('/admin?success=Coloring+sheet+deleted');
  } catch (err) {
    res.redirect('/admin?error=Failed+to+delete+sheet');
  }
});

module.exports = router;
