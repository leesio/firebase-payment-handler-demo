const sinon = require('sinon');
require('chai').should();
const when = require('when');

describe('payment-lib', function(){
  var mockStripe, libProvider, config, lib;
  beforeEach(function(){
    mockStripe = {
      customers: {
        create: sinon.stub().returns(when.resolve()),
        createSource: sinon.stub().returns(when.resolve()),
        retrieve: sinon.stub().returns(when.resolve())
      },
      charges: {
        create: sinon.stub().returns(when.resolve())
      }
    };
    libProvider = require('../../payments/payment-lib');
    lib = libProvider(config, mockStripe);
  });
  describe('createCharge', function(){
    it('should create a charge using stripe lib', function(){
      var source = {customer: 'customer-id'};
      var payment = {currency: 'usd', amount: 1.99};
      return lib.createCharge(source, payment).then(function(){
        mockStripe.charges.create.callCount.should.be.eql(1);
        mockStripe.charges.create.getCall(0).args[0].should.be.eql({
          customer: source.customer,
          currency: payment.currency,
          amount: 199 // multiply decimal for stripe api
        });
      });
    });
  });
  describe('createCustomer', function(){
    it('should create a customer using stripe lib', function(){
      var customer = {email: 'something@somewhere.io'};
      return lib.createCustomer(customer).then(function(){
        mockStripe.customers.create.callCount.should.be.eql(1);
        mockStripe.customers.create.getCall(0).args[0].should.be.eql(customer);
      });
    });
  });
  describe('createSource', function(){
    it('should create a source using stripe lib', function(){
      var customer = {email: 'something@somewhere.io'};
      var stripeCustomer = {id: 'abc'};
      var paymentDetails = {
        expiry: '12/23',
        number: 123456,
        cvc: 100
      };
      return lib.createSource(customer, stripeCustomer, paymentDetails)
        .then(function(){
          mockStripe.customers.createSource.callCount.should.be.eql(1);
          var args = mockStripe.customers.createSource.getCall(0).args;
          args[0].should.be.eql(stripeCustomer.id);
          args[1].should.be.eql({
            source: {
              cvc: paymentDetails.cvc,
              exp_month: '12',
              exp_year: '23',
              number: paymentDetails.number,
              object: 'card'
            }
          });
        });
    });
  });
  describe('getCustomer', function(){
    it('should retrieve stripe customer if customer has stripeId', function(){
      var customer = {stripeId: 100};
      return lib.getCustomer(customer).then(function(){
        mockStripe.customers.retrieve.callCount.should.be.eql(1);
        mockStripe.customers.retrieve.getCall(0).args[0].should.be.eql(customer.stripeId);
      });
    });
    it('should create stripe customer if customer has no stripeId', function(){
      var customer = {email: 'something@somewhere.io'};
      return lib.getCustomer(customer).then(function(){
        mockStripe.customers.create.callCount.should.be.eql(1);
        mockStripe.customers.create.getCall(0).args[0].should.be.eql(customer);
      });
    });
  });
});
