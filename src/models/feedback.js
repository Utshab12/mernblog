const mongoose = require('mongoose')

const feedbackSchema = mongoose.Schema({
  
  comments: {
    type: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
  
})

const Feedback = mongoose.model('Feedback', feedbackSchema)
module.exports = Feedback
