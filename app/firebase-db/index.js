const db = require('./firebase-wrapper');
const config = require('../config');

module.exports = {
  lib: db,
  helpers: require('./firebase-helpers')(db, config),
};
