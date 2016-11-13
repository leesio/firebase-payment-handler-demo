(function(Vue, firebase){
  var db = firebase.database();
  var ref = db.ref('app/echo');
  var orders = ref.child('orders');
  var customers = ref.child('customers');
  var products = ref.child('products');
  var payments = ref.child('payments');


  new Vue({
    el: '#app',
    data: {
      customer: {
        email: 'james@lees.io',
        name: 'james'
      },
      payment: {
        details: {
          cvc: '123',
          expiry: '12/23',
          number: '4242424242424242'
        },
        amount: 3.99,
        currency: 'gbp',
        type: 'card'
      }
    },
    methods: {
      submit: function(){
        var orderId = orders.push().key;
        var customerId = customers.push().key;
        var paymentId = payments.push().key;
        var customer = this.customer;
        customer.payments = {};
        customer.orders = {};
        customer.orders[orderId] = true;
        customer.payments[paymentId] = true;
        customers.child(customerId).set(customer);

        var payment = this.payment;
        payment.customer = {};
        payment[customerId] = true;
        payments.child(paymentId).set(payment);
        var order = {
          customer: customerId,
          payment: paymentId
        };
        orders.child(orderId).set(order);
      }
    },
  });
})(Vue, firebase);
