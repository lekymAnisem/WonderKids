require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const promClient = require('prom-client');
const db = require('./lib/db');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const { artworkRouter } = require('./routes/api');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const wallRouter = require('./routes/wall');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

promClient.collectDefaultMetrics({ prefix: 'wonderkids_' });

const httpRequestsTotal = new promClient.Counter({
  name: 'wonderkids_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['route', 'status']
});

const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'wonderkids_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'wonderkids_fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const store = {
  child: { name: 'Leo', avatar: '\u{1F981}', age: 6 },
  progress: {
    level: 4, levelTitle: 'Voyager', xp: 850, xpGoal: 1000, stars: 340,
    questsCompleted: 3, totalQuests: 4, quizSolved: false,
    completedSteps: ['Color a Dinosaur in Art Studio', 'Read Chapter 2 of The Little Explorer']
  },
  parent: {
    dailyScreenTime: 32, dailyScreenTimeLimit: 45, focusDomain: 'Reading & Logic',
    distribution: { reading: 40, math: 35, creativity: 25 }
  },
  savedArtworks: []
};

app.locals.store = store;
app.locals.db = db;

// Make session user available to all views + prevent caching
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  if (req.method === 'GET' && !req.path.startsWith('/css') && !req.path.startsWith('/js') && !req.path.startsWith('/images') && !req.path.startsWith('/uploads')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  }
  next();
});

// Metrics: count every request, expose /metrics, and proxy backend /api/metrics
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const route = (req.route && req.route.path) || req.path || '';
    const [seconds, nanoseconds] = process.hrtime(start);
    httpRequestDurationSeconds.labels(route).observe(seconds + nanoseconds / 1e9);
    httpRequestsTotal.labels(route, String(res.statusCode)).inc();
  });
  next();
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/api/metrics', async (_req, res) => {
  const backendHost = process.env.BACKEND_SERVICE || 'backend';
  const backendPort = process.env.BACKEND_PORT || 4000;
  try {
    const upstream = await fetch(`http://${backendHost}:${backendPort}/api/metrics`);
    res.set('Content-Type', promClient.register.contentType);
    res.status(upstream.status).end(await upstream.text());
  } catch (err) {
    res.status(502).send('# backend /api/metrics unreachable');
  }
});

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/api/artwork', artworkRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/wall', wallRouter);

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Not Found' });
  }
  return res.status(404).render('error', {
    title: 'Page not found - WonderKids',
    activeNav: '',
    progress: { ...store.child, ...store.progress },
    status: 404,
    message: 'We could not find that page in WonderLand.'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  if (req.path.startsWith('/api')) {
    return res.status(status).json({ success: false, error: status === 500 ? 'Internal Server Error' : err.message });
  }
  return res.status(status).render('error', {
    title: 'Something went wrong - WonderKids',
    activeNav: '', progress: { ...store.child, ...store.progress },
    status,
    message: status === 500 ? 'Our explorers hit a snag. Please try again.' : err.message
  });
});

async function start() {
  try {
    console.log('Connecting to database...');
    await db.initDatabase();
    console.log('Database connected. Tables: wk_users, wk_posts, wk_videos, wk_coloring_sheets');

    await db.ensureAdmin(
      process.env.ADMIN_EMAIL || 'admin@wonderkids.com',
      process.env.ADMIN_PASSWORD || 'WonderKids@Admin123',
      process.env.ADMIN_NAME || 'Admin'
    );
    await db.seedDefaultVideos();

    const userCount = await db.query('SELECT COUNT(*) FROM wk_users');
    const videoCount = await db.query('SELECT COUNT(*) FROM wk_videos');
    const postCount = await db.query('SELECT COUNT(*) FROM wk_posts');
    console.log(`Database contents: ${userCount.rows[0].count} users, ${videoCount.rows[0].count} videos, ${postCount.rows[0].count} posts`);

    app.listen(PORT, () => {
      console.log(`WonderKids is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
