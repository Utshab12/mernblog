const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({

  image: {
    type: String
  },
  content : {
    type: String
  },
  title: {
    type: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }


})

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog