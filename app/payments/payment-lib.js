
module.exports = function(config, stripe){
  return getLib(config, stripe);
};

function getLib(config, stripe){
  return {
    createCustomer: createCustomer,
    createSource: createSource,
    createCharge: createCharge,
    getCustomer: getCustomer,
  };

  /**
   * Creates a customer object in stripe
   * @param {object} customer - customer object
   * @param {string} customer.email - customer email address
   * @returns {promise} resolves to customer created by the stripe lib
   */
  function createCustomer(customer){
    return stripe.customers.create({
      email: customer.email
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
  function createSource(customer, stripeCustomer, paymentDetails){
    var expiry = paymentDetails.expiry.split('/');
    return stripe.customers.createSource(stripeCustomer.id, {
      source: {
        object: 'card',
        exp_month: expiry[0],
        exp_year: expiry[1],
        number: paymentDetails.number,
        cvc: paymentDetails.cvc
      }
    });
  }

  /**
   * Creates a customer object in stripe
   * @param {object} source - stripe source
   * @param {object} payment - details relating to a payment
   * @param {number} payment.amount - amount of payment (decimal)
   * @param {string} payment.currency - three char currency code
   * @returns {promise} resolves to charge created by stripe lib
   */
  function createCharge(source, payment){
    return stripe.charges.create({
      amount: payment.amount * 100,
      currency: payment.currency,
      customer: source.customer
      //source: source.id
    });

  }

  /**
   * Retrieves stripe customer if available, otherwise creates one
   * @param {object} customer - customer object
   * @param {string} customer.stripeId - uuid of stripe customer
   * @returns {promise} resolves customer created by the stripe lib
   */
  function getCustomer(customer){
    if(customer.stripeId){
      return stripe.customers.retrieve(customer.stripeId);
    }
    return createCustomer(customer);
  }
}
