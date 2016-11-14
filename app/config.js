/*eslint no-process-env: "ignore"*/
require('dotenv').config({path: './app/.env'});

const config = {};
config.firebaseUrl = process.env.FIREBASE_URL;
config.stripeKey = process.env.STRIPE_KEY;
config.dbRef = process.env.DB_REF;
config.firebaseConfig = {
  url: process.env.FIREBASE_URL,
}
module.exports = config;
