const db = require('../firebase-db');
const config = require('../config');
const updateHandlers = require('./update-handlers');

module.exports = {
  initialiseListeners: function(){

    const ref = db.lib.ref(config.dbRef);
    const orders = ref.child('orders').limitToLast(1);

    // TODO customers should be users?
   // const customers = ref.child('customers');
   // const products = ref.child('products');

    orders.on('child_added', updateHandlers.order);

  }
};
