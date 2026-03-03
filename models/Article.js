const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String },
  content: { type: String }, // markdown
  coverImage: { type: String },
  gallery: [{ type: String }],
  tags: [{ type: String }],
  publishedAt: { type: Date },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);
