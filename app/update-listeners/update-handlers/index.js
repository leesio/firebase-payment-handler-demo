const config = require('../../config');
const payments = require('../../payments');
const db = require('../../firebase-db');

module.exports = {
  order: require('./order-handler')(config, payments, db)
};
