const Log = require("../models/logs");
const {Employee} = require("../models/employees");

async function logAction(userId, action, details, username) {

  const log = new Log({
action,
userId,
username,
details,
  })
  await log.save()
}


module.exports = logAction;
