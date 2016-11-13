/*eslint no-process-env: "ignore"*/
require('dotenv').config();

const config = {};
config.port = process.env.PORT;
config.firebaseUrl = process.env.FIREBASE_URL;
config.stripeKey = process.env.STRIPE_KEY;
config.dbRef = process.env.DB_REF;
config.firebaseConfig = {
  url: process.env.FIREBASE_URL,
  config: {},
}
module.exports = config;

 // type: process.env.TYPE,
 // project_id: process.env.PROJECT_ID,
 // private_key_id: process.env.PRIVATE_KEY_ID,
 // private_key: process.env.PRIVATE_KEY,
 // client_email: process.env.CLIENT_EMAIL,
 // client_id: process.env.CLIENT_ID,
 // auth_uri: process.env. AUTH_URO
 // token_uri: process.env.
 // auth_provider_x509_cert_url:
 // client_x509_cert_url:
