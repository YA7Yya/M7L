const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: String,
  userId: mongoose.Schema.Types.ObjectId,
  username: String,
  details: mongoose.Schema.Types.Mixed,
}, {timestamps: true});

module.exports = mongoose.model('Log', logSchema);