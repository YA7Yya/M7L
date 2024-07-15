const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: String,
  userId: mongoose.Schema.Types.ObjectId,
  username: String,
  details: {
    before: mongoose.Schema.Types.Mixed, // Store "before" value
    after: mongoose.Schema.Types.Mixed,  // Store "after" value
},
}, {timestamps: true});

module.exports = mongoose.model('Log', logSchema);