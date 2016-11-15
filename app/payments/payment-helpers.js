module.exports = function(config, lib, db){
  return getHelpers(config, lib, db);
};

function getHelpers(config, lib, db){
  var helpers = {
    createCharge: createCharge
  };
  return helpers;

  function createCharge(customer, payment){
    const payments = db.lib.ref(config.dbRef).child('payments');
    const cardTokens = db.lib.ref(config.dbRef).child('card-tokens');

    return lib.getCustomer(customer).then(function(stripeCustomer){

      // resource updates are async but we don't need to wait for them
      db.helpers.updateResource('customers', `${customer.id}/stripeId`, stripeCustomer.id);
      return lib.createSource(customer, stripeCustomer, payment.details);
    }).then(function(source) {
      var cardId = cardTokens.push().key;
      cardTokens.child(cardId).set({
        token: source.id,
        customer: customer.id
      });
      var updatePath = `${customer.id}/cards/${cardId}`;
      db.helpers.updateResource('customers', updatePath, true);
      return lib.createCharge(source, payment);
    }).then(function(charge){
      db.helpers.updateResource('payments', `${payment.id}/stripeCharge`, charge.id);

      // remove card details from firebase, could maybe wait for charge id to be
      // added but shouldn't really keep hold of the card details I guess
      payments.child(payment.id + '/details').remove();
      return charge;
    }).catch(function(err){
      const errors = db.lib.ref(config.dbRef).child('errors');
      let key = errors.push().key;
      errors.child(key).set({
        timestamp: new Date().toISOString(),
        description: 'Unable to complete payment process',
        error: {
          message: err.message,
          stack: err.stack
        }
      });
    });
  }
}


