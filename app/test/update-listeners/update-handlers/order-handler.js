const sinon = require('sinon');
const chai = require('chai');
const when = require('when');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('order-handler', function(){
  var handlerProvider, handler, config, payments, db, order, customer,
    payment;
  beforeEach(function(){
    config = {};
    payments = {
      helpers: {createCharge: sinon.stub().returns(when.resolve())}
    };
    db = {
      lib: {
        ref: sinon.stub().returnsThis(),
        child: sinon.stub().returnsThis(),
        create: sinon.stub().returnsThis(),
        once: sinon.stub()
      }
    };
    order = {
      val: sinon.stub().returns({payment: 'P1', customer: 'C1'}),
      key: 'O1'
    };
    customer = {
      val: sinon.stub().returns({type: 'customer'}),
      key: 'C1'
    };
    payment = {
      val: sinon.stub().returns({type: 'payment'}),
      key: 'P1'
    };
    db.lib.once.onCall(0).returns(when.resolve(customer));
    db.lib.once.onCall(1).returns(when.resolve(payment));
    handlerProvider = require('../../../update-listeners/update-handlers/order-handler');
    handler = handlerProvider(config, payments, db);
  });
  it('should not create charge on the first update', function(){
    // firebase lib sends update event on init
    return handler(order).then(function(){
      db.lib.create.callCount.should.be.eql(0);
    });
  });
  it('should use the dbRef from config', function(){
    config.dbRef = 'test-reference';
    return handler(order).then(function(){
      db.lib.ref.callCount.should.be.eql(2);
      db.lib.ref.getCall(0).args[0].should.be.eql('test-reference');
    });
  });
  it('should retrieve customers and payments refs', function(){
    return handler(order).then(function(){
      db.lib.child.should.have.been.calledWith('customers');
      db.lib.child.should.have.been.calledWith('payments');
    });
  });
  it('should retrieve customer linked to order', function(){
    return handler(order).then(function(){
      var childArgs = [
        db.lib.child.getCall(2).args,
        db.lib.child.getCall(3).args,
      ];
      var onceArgs = [
        db.lib.once.getCall(0).args,
        db.lib.once.getCall(1).args,
      ];
      childArgs[0][0].should.be.eql('C1');
      childArgs[1][0].should.be.eql('P1');
      onceArgs[0][0].should.be.eql('value');
    });
  });
  it('should create a charge using the payment helpers', function(){
    return handler(order).then(function(){
      payments.helpers.createCharge.callCount.should.be.eql(1);
      var args = payments.helpers.createCharge.getCall(0).args;
      args[0].should.be.an('object').and.contain.key('type');
      args[0].type.should.be.eql('customer');
      args[1].should.be.an('object').and.contain.key('type');
      args[1].type.should.be.eql('payment');
    });
  });
  it('should extend the customer and payment with their keys', function(){
    return handler(order).then(function(){
      payments.helpers.createCharge.callCount.should.be.eql(1);
      var args = payments.helpers.createCharge.getCall(0).args;
      args[0].should.contain.key('id');
      args[0].id.should.be.eql('C1');
      args[1].should.contain.key('id');
      args[1].id.should.be.eql('P1');
    });
  });
});

