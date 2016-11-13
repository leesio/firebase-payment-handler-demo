const admin = require('firebase-admin');
const serviceAccount = require('./creds.json');
const config = require('../config');
const url = config.FIREBASE_URL || 'https://test-project-7e89e.firebaseio.com/';


/**
 * Simple wrapper to export the firebase database instance
 *
 */
module.exports = function(){
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: url
  });
  return admin.database();
}();
