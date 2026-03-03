require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const connectDB = require('../config/db');

(async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find all articles
    const articles = await Article.find({}).sort({ createdAt: -1 });
    console.log(`Found ${articles.length} articles`);

    // Check for duplicate slugs
    const slugMap = new Map();
    const duplicates = [];

    for (const article of articles) {
      if (slugMap.has(article.slug)) {
        duplicates.push(article);
        console.log(`Duplicate slug found: "${article.slug}" - ID: ${article._id} - Title: "${article.title}"`);
      } else {
        slugMap.set(article.slug, article._id);
      }
    }

    if (duplicates.length === 0) {
      console.log('No duplicate slugs found');
    } else {
      console.log(`Found ${duplicates.length} articles with duplicate slugs`);

      // Fix duplicates by appending timestamp
      for (const article of duplicates) {
        const newSlug = `${article.slug}-${Date.now()}`;
        await Article.findByIdAndUpdate(article._id, { slug: newSlug });
        console.log(`Updated article "${article.title}" slug from "${article.slug}" to "${newSlug}"`);
      }
    }

    // Check for articles with problematic slugs
    const problematicArticles = articles.filter(article =>
      article.slug === 'slug' ||
      article.slug === '' ||
      !article.slug
    );

    if (problematicArticles.length > 0) {
      console.log('Found articles with problematic slugs:');
      for (const article of problematicArticles) {
        const newSlug = `article-${article._id}`;
        await Article.findByIdAndUpdate(article._id, { slug: newSlug });
        console.log(`Fixed article "${article.title}" slug to "${newSlug}"`);
      }
    }

    console.log('Database cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();