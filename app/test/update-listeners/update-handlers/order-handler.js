const sinon = require('sinon');
require('chai').should();
const when = require('when');
const payments = require('../../../payments');
const db = require('../../../firebase-db');
const config = require('../../../config');

describe('order-handler', function(){
  var handler, snapshot, createChargeStub, dbStub, customer, payment, dbRef,
    order, paymentVal, customerVal;
  beforeEach(function(){
    order = {payment: 'P1', customer: 'C1'};
    snapshot = {
      val: sinon.stub().returns(order),
      key: 'abc-def'
    };
    // resolving promise breaks reference chain, using a type key to identify
    // args
    paymentVal = {type: 'payment'};
    customerVal = {type: 'customer'};
    payment = {
      val: sinon.stub().returns(paymentVal),
      key: 'P1'
    };
    customer = {
      val: sinon.stub().returns(customerVal),
      key: 'C1'
    };
    createChargeStub = sinon.stub(payments.helpers, 'createCharge');
    createChargeStub.returns(when.resolve());
    dbRef = {
      child: sinon.stub().returnsThis(),
      once: sinon.stub().returns(when.resolve(payment))
    };
    dbRef.once.onCall(0).returns(when.resolve(customer));
    dbRef.once.onCall(1).returns(when.resolve(payment));
    dbStub = sinon.stub(db, 'ref').returns(dbRef);
    handler = require('../../../update-listeners/update-handlers/order-handler');
  });
  afterEach(function(){
    createChargeStub.restore();
    dbStub.restore();
  });
  it('should not create charge on the first update', function(){
    // firebase lib sends update event on init
    return handler(snapshot).then(function(){
      createChargeStub.callCount.should.be.eql(0);
    });
  });
  it('should use the dbRef from config', function(){
    config.dbRef = 'test-reference';
    return handler(snapshot).then(function(){
      dbStub.callCount.should.be.eql(2);
      dbStub.getCall(0).args[0].should.be.eql('test-reference');
    });
  });
  it('should retrieve customers and payments refs', function(){
    return handler(snapshot).then(function(){
      dbRef.child.callCount.should.be.eql(4);
      var args = [
        dbRef.child.getCall(0).args,
        dbRef.child.getCall(1).args,
      ];
      args[0][0].should.be.eql('customers');
      args[1][0].should.be.eql('payments');
    });
  });
  it('should retrieve customer and payment linked to order', function(){
    return handler(snapshot).then(function(){
      dbRef.child.callCount.should.be.eql(4);
      dbRef.once.callCount.should.be.eql(2);
      var childArgs = [
        dbRef.child.getCall(2).args,
        dbRef.child.getCall(3).args,
      ];
      var onceArgs = [
        dbRef.once.getCall(0).args,
        dbRef.once.getCall(1).args,
      ];
      childArgs[0][0].should.be.eql('C1');
      childArgs[1][0].should.be.eql('P1');
      onceArgs[0][0].should.be.eql('value');
    });
  });
  it('should create a charge using the payment helpers', function(){
    return handler(snapshot).then(function(){
      createChargeStub.callCount.should.be.eql(1);
      var args = createChargeStub.getCall(0).args;
      args[0].should.be.an('object').and.contain.key('type');
      args[0].type.should.be.eql('customer');
      args[1].should.be.an('object').and.contain.key('type');
      args[1].type.should.be.eql('payment');
    });
  });
  it('should extend the customer and payment with their keys', function(){
    return handler(snapshot).then(function(){
      createChargeStub.callCount.should.be.eql(1);
      var args = createChargeStub.getCall(0).args;
      args[0].should.contain.key('id');
      args[0].id.should.be.eql('C1');
      args[1].should.contain.key('id');
      args[1].id.should.be.eql('P1');
    });
  });
});


