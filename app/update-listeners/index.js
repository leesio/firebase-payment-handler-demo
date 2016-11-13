const db = require('../firebase-db');
const updateHandlers = require('./update-handlers');

module.exports = {
  initialiseListeners: function(opts){
    opts = opts || {};

    const ref = db.ref('app/echo');
    const orders = ref.child('orders').limitToLast(1);

    // TODO customers should be users?
   // const customers = ref.child('customers');
   // const products = ref.child('products');

    orders.on('child_added', updateHandlers.order);

  }
};
