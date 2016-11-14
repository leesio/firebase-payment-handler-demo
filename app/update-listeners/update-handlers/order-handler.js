const when = require('when');
var initialUpdate = true;

module.exports = function(config, payments, db){
  return function(snapshot){
    const order = snapshot.val();
    if(initialUpdate || !order.payment || !order.customer ){
      // hacky way to ignore the first update
      initialUpdate = false;
      return when.resolve();
    }
    const customersRef = db.lib.ref(config.dbRef).child('customers');
    const paymentsRef = db.lib.ref(config.dbRef).child('payments');

    return when.all([
      customersRef.child(order.customer).once('value'),
      paymentsRef.child(order.payment).once('value')
    ]).then((results)=>{
      var customer = results[0].val();
      customer.id = results[0].key;
      var payment = results[1].val();
      payment.id = results[1].key;
      return payments.helpers.createCharge(customer, payment);
    }).catch((err)=>{
      console.error(err);
    });
  };
};
