const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = data; next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
}

// Public: list articles
router.get('/', async (req, res) => {
  const articles = await Article.find({ isPublished: true }).sort({ publishedAt: -1 });
  res.json(articles);
});

// Public: get by slug
router.get('/:slug', async (req, res) => {
  const a = await Article.findOne({ slug: req.params.slug });
  if (!a) return res.status(404).json({});
  res.json(a);
});

// Admin: list all articles
router.get('/admin/all', authMiddleware, async (req, res) => {
  console.log('GET /api/articles/admin/all called');
  try {
    const arts = await Article.find({}).sort({ createdAt: -1 });
    console.log('Articles fetched:', arts.length);
    res.json(arts);
  } catch (err) { console.error('Error in GET /api/articles/admin/all:', err); res.status(500).json({ message: err.message }); }
});

// Admin: get by id
router.get('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const art = await Article.findById(req.params.id);
    if (!art) return res.status(404).json({});
    res.json(art);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin create
router.post('/', authMiddleware, async (req, res) => {
  console.log('POST /api/articles called');
  try {
    let { slug, ...articleData } = req.body;
    console.log('Article data:', articleData);

    // If no slug provided or it's problematic, generate one
    if (!slug || slug === 'slug' || slug.trim() === '') {
      const baseSlug = articleData.title
        ? articleData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        : 'untitled-article';
      slug = baseSlug || 'untitled-article';
    }

    // Ensure slug uniqueness by checking existing articles
    let originalSlug = slug;
    let counter = 1;
    while (await Article.findOne({ slug })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    const art = new Article({ ...articleData, slug });
    await art.save();
    console.log('Article created:', art._id);
    res.json(art);
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(400).json({ message: err.message });
  }
});

// Admin update
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const art = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(art);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
