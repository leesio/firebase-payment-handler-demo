const config = require('../../config');
const payments = require('../../payments');
const db = require('../../firebase-db');
const when = require('when');
var initialUpdate = true;

module.exports = function(snapshot){
  const order = snapshot.val();
  if(initialUpdate || !order.payment || !order.customer ){
    // hacky way to ignore the first update
    initialUpdate = false;
    return when.resolve();
  }
  const customersRef = db.ref(config.dbRef).child('customers');
  const paymentsRef = db.ref(config.dbRef).child('payments');

  return when.all([
    customersRef.child(order.customer).once('value'),
    paymentsRef.child(order.payment).once('value')
  ]).then(function(results){
    var customer = results[0].val();
    customer.id = results[0].key;
    var payment = results[1].val();
    payment.id = results[1].key;
    return payments.helpers.createCharge(customer, payment);
  }).catch(function(err){
    console.error(err);
  });
};
