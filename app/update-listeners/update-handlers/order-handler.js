const config = require('../../config');
const paymentHandler = require('../../payment-handler');
const db = require('../../firebase-db');
const when = require('when');
var first = true;

module.exports = function(snapshot){
  if(first){
    // hacky way to ignore the first update
    first = false;
    return when.resolve();
  }
  const customers = db.ref(config.dbRef).child('customers');
  const payments = db.ref(config.dbRef).child('payments');
  const order = snapshot.val();

  return when.all([
    customers.child(order.customer).once('value'),
    payments.child(order.payment).once('value')
  ]).then(function(results){
    var customer = results[0].val();
    customer.id = results[0].key;
    var payment = results[1].val();
    payment.id = results[1].key;
    return paymentHandler.createCharge(customer, payment);
  }).then(function(charge){
    var paymentUpdate = {};
    var paymentId = snapshot.val().payment;
    paymentUpdate[paymentId + '/stripeCharge'] = charge.id;
    payments.update(paymentUpdate);

    // remove card details from firebase
    payments.child(paymentId + '/details').remove();
    console.log('SUCCESS');

  });
};
