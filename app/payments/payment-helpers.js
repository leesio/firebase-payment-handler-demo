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
    const customers = db.lib.ref(config.dbRef).child('customers');
    const cardTokens = db.lib.ref(config.dbRef).child('card-tokens');

    return lib.getCustomer(customer).then(function(stripeCustomer){
      var update = {};
      update[customer.id + '/stripeId'] = stripeCustomer.id;
      customers.update(update);

      db.helpers.updateResource('customers', `${customer.id}/stripeId`, stripeCustomer.id);
      return lib.createSource(customer, stripeCustomer, payment.details);
    }).then(function(source) {
      var cardId = cardTokens.push().key;
      cardTokens.child(cardId).set({
        token: source.id,
        customer: customer.id
      });
      var updatePath = `${customer.id}/cards/${source.id}`;
      db.helpers.updateResource('customers', updatePath, true);
      return lib.createCharge(source, payment);
    }).then(function(charge){
      db.helpers.updateResource('payments', `${payment.id}/stripeCharge`, charge.id);

      // remove card details from firebase, should maybe wait for charge id to be
      // added
      payments.child(payment.id + '/details').remove();
      return charge;
    }).catch(function(err){
      console.log(err);
    });
  }
}


