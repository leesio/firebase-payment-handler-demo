const sinon = require('sinon');
require('chai').should();
const when = require('when');
const config = require('../../config');
const db = require('../../firebase-db');

describe('payment-helpers', function(){
  describe('createCharge', function(){
    var dbRef, dbStub, helpers, stripeCustomer, stripeSource, stripeCharge,
      newKey, paymentsLib, paymentStub;

    beforeEach(function(){
      newKey = {key: 'new-id'};
      dbRef = {
        child: sinon.stub().returnsThis(),
        once: sinon.stub().returns(when.resolve()),
        update: sinon.stub(),
        push: sinon.stub().returns(newKey),
        set: sinon.stub(),
        remove: sinon.stub()
      };

      dbStub = sinon.stub(db, 'ref').returns(dbRef);
      paymentsLib = require('../../payments/payment-lib');
      stripeCustomer = {id: 'stripe-customer-id'};
      stripeSource = {id: 'stripe-source-id'};
      stripeCharge = {id: 'stripe-charge-id'};
      sinon.stub(paymentsLib, 'createCustomer').returns(when.resolve(stripeCustomer));
      sinon.stub(paymentsLib, 'createSource').returns(when.resolve(stripeSource));
      sinon.stub(paymentsLib, 'createCharge').returns(when.resolve(stripeCharge));
      sinon.stub(paymentsLib, 'getCustomer').returns(when.resolve(stripeCustomer));

      helpers = require('../../payments/payment-helpers');
    });
    afterEach(function(){
      dbStub.restore();
      paymentsLib.createCustomer.restore();
      paymentsLib.createSource.restore();
      paymentsLib.createCharge.restore();
      paymentsLib.getCustomer.restore();
    });
    it('should use the dbRef from config', function(){
      config.dbRef = 'test-reference';
      return helpers.createCharge({},{}).then(function(){
        dbStub.getCall(0).args[0].should.be.eql('test-reference');
      });
    });
    it('should retrieve references to relevant resources', function(){
      config.dbRef = 'test-reference';
      return helpers.createCharge({},{}).then(function(){
        dbStub.callCount.should.be.eql(3);
        dbRef.child.getCall(0).args[0].should.be.eql('payments');
        dbRef.child.getCall(1).args[0].should.be.eql('customers');
        dbRef.child.getCall(2).args[0].should.be.eql('card-tokens');
      });
    });
    it('should retrieve customer', function(){
      var customer = {};
      return helpers.createCharge(customer, {}).then(function(){
        paymentsLib.getCustomer.callCount.should.be.eql(1);
        var args = paymentsLib.getCustomer.getCall(0).args;
        args[0].should.be.eql(customer);
      });
    });
    it('should update stripe id to customer', function(){
      var customer = {id: 'customerId'};
      var payment = {id: 'paymentId'};
      return helpers.createCharge(customer, payment).then(function(){
        var expUpdate = {'customerId/stripeId': stripeCustomer.id};
        dbRef.update.calledWith(expUpdate).should.be.eql(true);
      });
    });
    it('should create a new source', function(){
      var customer = {};
      var payment = {details: {}};
      return helpers.createCharge(customer, payment).then(function(){
        paymentsLib.createSource.callCount.should.be.eql(1);
        var args = paymentsLib.createSource.getCall(0).args;
        args[0].should.be.eql(customer);
        args[1].should.be.eql(stripeCustomer);
        args[2].should.be.eql(payment.details);
      });
    });
    it('should add card to customer obj', function(){
      var customer = {id: 'customerId'};
      var payment = {id: 'paymentId'};
      return helpers.createCharge(customer, payment).then(function(){
        var expUpdate = {'customerId/cards/stripe-source-id': true};
        dbRef.update.calledWith(expUpdate).should.be.eql(true);
      });
    });
    it('should create a new charge', function(){
      var customer = {};
      var payment = {details: {}};
      return helpers.createCharge(customer, payment).then(function(){
        paymentsLib.createCharge.callCount.should.be.eql(1);
        var args = paymentsLib.createCharge.getCall(0).args;
        args[0].should.be.eql(stripeSource);
        args[1].should.be.eql(payment);
      });
    });
    it('should add charge id to payment', function(){
      var customer = {id: 'customerId'};
      var payment = {id: 'paymentId'};
      return helpers.createCharge(customer, payment).then(function(){
        var expUpdate = {'paymentId/stripeCharge': stripeCharge.id};
        dbRef.update.calledWith(expUpdate).should.be.eql(true);
      });
    });
    it('should remove card details from payment after', function(){
      var customer = {id: 'customerId'};
      var payment = {id: 'paymentId'};
      paymentStub = {remove: sinon.stub()};
      dbRef.child.onCall(4).returns(paymentStub);
      return helpers.createCharge(customer, payment).then(function(){
        paymentStub.remove.callCount.should.be.eql(1);
        // want to ensure that the removal has been called on the appropriate
        // child
        var removalArgs = dbRef.child.getCall(4).args;
        removalArgs[0].should.be.eql(payment.id + '/details');
      });
    });
  });
});

