const config = require('../config');
const db = require('../firebase-db');
const stripe = require('stripe')(config.stripeKey);

const lib = require('./payment-lib')(config, stripe);
module.exports = {
  lib: lib,
  helpers: require('./payment-helpers')(config, lib, db),
};
