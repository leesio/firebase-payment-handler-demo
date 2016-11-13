const config = require('../config');
const stripe = require('stripe')(config.stripeKey);
const db = require('../firebase-db');

module.exports = {
  createCharge: createCharge
};

/**
 * Creates a customer object in stripe
 * @param {object} customer - customer object
 * @param {string} customer.email - customer email address
 * @returns {promise} resolves to customer created by the stripe lib
 */
function createStripeCustomer(customer){
  return stripe.customers.create({
    email: customer.email
  })
  .then(function(stripeCustomer){
    const customers = db.ref(config.dbRef).child('customers');
    var update = {};
    update[customer.id + '/stripeId'] = stripeCustomer.id;
    customers.update(update);
    return stripeCustomer;
  });
}

/**
 * Retrieves stripe customer if available, otherwise creates one
 * @param {object} customer - customer object
 * @param {string} customer.id - firebase key of customer
 * @param {object} stripeCustomer - stripe customer object
 * @param {string} stripeCustomer.id - uuid of stripe customer
 * @param {object} paymentDetails - details of payment
 * @param {string} paymentDetails.expiry - slash separated expiry date
 * @param {string} paymentDetails.number - card number
 * @param {string} paymentDetails.cvc - cvc code of card
 * @returns {promise} resolves to source created by stripe lib
 */
function createStripeSource(customer, stripeCustomer, paymentDetails){
  var expiry = paymentDetails.expiry.split('/');
  return stripe.customers.createSource(stripeCustomer.id, {
    source: {
      object: 'card',
      exp_month: expiry[0],
      exp_year: expiry[1],
      number: paymentDetails.number,
      cvc: paymentDetails.cvc
    }
  }).then(function(source){
    const customers = db.ref(config.dbRef).child('customers');
    const cardTokens = db.ref(config.dbRef).child('card-tokens');
    var cardId = cardTokens.push().key;
    cardTokens.child(cardId).set({
      token: source.id,
      customer: customer.id
    });
    var customerUpdate = {};
    customerUpdate[customer.id + '/cards/' + source.id] = true;
    customers.update(customerUpdate);
    return source;
  });
}

/**
 * Retrieves stripe customer if available, otherwise creates one
 * @param {object} customer - customer object
 * @param {string} customer.stripeId - uuid of stripe customer
 * @returns {promise} resolves customer created by the stripe lib
 */
function getStripeCustomer(customer){
  if(customer.stripeId){
    return stripe.customers.retrieve(customer.stripeId);
  }
  return createStripeCustomer(customer);
}

/**
 * Creates a customer object in stripe
 * @param {object} customer - customer object
 * @param {object} payment - details relating to a payment
 * @param {number} payment.amount - amount of payment (decimal)
 * @param {string} payment.currency - three char currency code
 * @returns {promise} resolves to charge created by stripe lib
 */
function createCharge(customer, payment){
  return getStripeCustomer(customer)
  .then(function(stripeCustomer){
    return createStripeSource(customer, stripeCustomer, payment.details);
  })
  .then(function(source) {
    return stripe.charges.create({
      amount: payment.amount * 100,
      currency: payment.currency,
      customer: source.customer
    });
  })
  .catch(function(err) {
    console.error(err);
  });
}

