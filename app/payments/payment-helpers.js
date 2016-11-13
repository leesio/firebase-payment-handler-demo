const config = require('../config');
const lib = require('./payment-lib');
const db = require('../firebase-db');

module.exports = {
  createCharge: createCharge
};

/**
 * Creates customer/source/payment objects
 * @param {object} customer - customer object
 * @param {object} payment - details relating to a payment
 * @param {number} payment.amount - amount of payment (decimal)
 * @param {string} payment.currency - three char currency code
 * @returns {promise} resolves to charge created by stripe lib
 */
function createCharge(customer, payment){
  const payments = db.ref(config.dbRef).child('payments');
  const customers = db.ref(config.dbRef).child('customers');
  const cardTokens = db.ref(config.dbRef).child('card-tokens');

  return lib.getCustomer(customer).then(function(stripeCustomer){
    var update = {};
    update[customer.id + '/stripeId'] = stripeCustomer.id;
    customers.update(update);
    return lib.createSource(customer, stripeCustomer, payment.details);
  }).then(function(source) {
    var cardId = cardTokens.push().key;
    var customerUpdate = {};
    cardTokens.child(cardId).set({
      token: source.id,
      customer: customer.id
    });
    customerUpdate[customer.id + '/cards/' + source.id] = true;
    customers.update(customerUpdate);
    return lib.createCharge(source, payment);
  }).then(function(charge){
    var paymentUpdate = {};
    paymentUpdate[payment.id + '/stripeCharge'] = charge.id;
    payments.update(paymentUpdate);

    // remove card details from firebase, should maybe wait for charge id to be
    // added
    payments.child(payment.id + '/details').remove();
    return charge;
  }).catch(function(err){
    console.log(err);
  });
}

