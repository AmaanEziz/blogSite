const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  markdown: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  author:{
    type:String,
    default:"Anonymous"
  },
  slug: {
    type:Date,
    default:Date.now
  }
})


module.exports = mongoose.model('Articles',articleSchema)