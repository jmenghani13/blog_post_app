const mongoose = require('mongoose');

//Artcile Schema
const articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  author_name: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  comments:[{
    user_id:{ type: Object, ref: 'User' },
    comment_text:{ type: String},
    date: { type: Date}
  }],
  likes: [{ type: Object, ref: 'User' } ]
});




module.exports = mongoose.model('Article',articleSchema);
