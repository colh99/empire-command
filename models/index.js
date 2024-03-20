const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

db.galaxy = require('./galaxy.js')(mongoose);
db.mission = require('./mission.js')(mongoose);
db.planet = require('./planet.js')(mongoose);
db.user = require('./user.js')(mongoose);

module.exports = db;
