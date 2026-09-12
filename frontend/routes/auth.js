const express = require('express');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

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

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', {
    title: 'Sign In - WonderKids',
    activeNav: '',
    progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress },
    error: null
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.db;
    const user = await db.findUserByEmail(email);

    if (!user || user.password !== password) {
      return res.render('login', {
        title: 'Sign In - WonderKids',
        activeNav: '',
        progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress },
        error: 'Invalid email or password. Please try again.'
      });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };

    if (user.role === 'admin') return res.redirect('/admin');
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', {
      title: 'Sign In - WonderKids', activeNav: '',
      progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress },
      error: 'Something went wrong. Please try again.'
    });
  }
});

router.get('/signup', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('signup', {
    title: 'Create Account - WonderKids',
    activeNav: '',
    progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress },
    error: null
  });
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const db = req.app.locals.db;

    if (!name || !email || !password) {
      return res.render('signup', { title: 'Create Account - WonderKids', activeNav: '',
        progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress }, error: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
      return res.render('signup', { title: 'Create Account - WonderKids', activeNav: '',
        progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress }, error: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.render('signup', { title: 'Create Account - WonderKids', activeNav: '',
        progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress }, error: 'Password must be at least 6 characters.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.render('signup', { title: 'Create Account - WonderKids', activeNav: '',
        progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress }, error: 'An account with this email already exists.' });
    }

    const id = 'user_' + Date.now();
    await db.createUser(id, name.trim(), email.trim(), password, 'user', '🦁');

    req.session.user = { id, name: name.trim(), email: email.trim().toLowerCase(), role: 'user', avatar: '🦁' };
    res.redirect('/');
  } catch (err) {
    console.error('Signup error:', err);
    res.render('signup', { title: 'Create Account - WonderKids', activeNav: '',
      progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress }, error: 'Something went wrong. Please try again.' });
  }
});

const AVATARS = [
  '🦁', '🐾', '🦄', '🐻', '🐰', '🐶', '🦊', '🐱', '🐵', '🐱', '🦉', '🐙',
  '🍕', '🎂', '⭐', '🚀', '🌈', '🌟', '🧑', '👧', '👦', '👽', '🎓', '🎮'
];

router.get('/profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const db = req.app.locals.db;
  const user = await db.findUserById(req.session.user.id);
  if (!user) return res.redirect('/auth/login');
  res.render('profile', {
    title: 'My Profile - WonderKids',
    activeNav: '',
    progress: { ...req.app.locals.store.child, ...req.app.locals.store.progress },
    profileUser: user,
    avatars: AVATARS,
    success: req.query.success || null
  });
});

router.post('/profile/avatar', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const { avatar } = req.body;
  const db = req.app.locals.db;
  if (avatar) {
    await db.updateUserAvatar(req.session.user.id, avatar);
    req.session.user.avatar = avatar;
  }
  res.redirect('/auth/profile?success=Avatar+updated!');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => { res.redirect('/'); });
});

module.exports = router;
module.exports.requireAuth = requireAuth;
module.exports.requireAdmin = requireAdmin;
