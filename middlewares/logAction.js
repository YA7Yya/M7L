// middlewares/logAction.js

const Log = require('../models/logs');

const logAction = async (action, userId, username, details,update) => {
  console.log('Logging action:', action, userId, username, details,update); 
  try {
    await Log.create({
      action,
      userId,
      username,
      details,
      update
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

module.exports = logAction;
