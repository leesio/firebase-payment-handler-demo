const sinon = require('sinon');
const chai = require('chai');
const when = require('when');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('payment-helpers', function(){
  var helpersProvider, helpers, db, config, lib, stripeCustomer, stripeCharge,
    stripeSource;

  beforeEach(function(){
    stripeCustomer = {id: 'stripe-customer-id'};
    stripeSource = {id: 'stripe-source-id'};
    stripeCharge = {id: 'stripe-charge-id'};
    db = {
      helpers: {
        updateResource: sinon.stub()
      },
      lib: {
        ref: sinon.stub().returnsThis(),
        child: sinon.stub().returnsThis(),
        push: sinon.stub().returnsThis(),
        set: sinon.stub().returnsThis(),
        remove: sinon.stub().returnsThis()
      }
    };
    config = {};
    lib = {
      getCustomer: sinon.stub().returns(when.resolve(stripeCustomer)),
      createSource: sinon.stub().returns(when.resolve(stripeSource)),
      createCharge: sinon.stub().returns(when.resolve(stripeCharge)),
    };
    helpersProvider = require('../../payments/payment-helpers');
    helpers = helpersProvider(config, lib, db);
  });
  it('should use the dbRef from config', function(){
    config.dbRef = 'test-reference';
    return helpers.createCharge({},{}).then(function(){
      db.lib.ref.calledWith('test-reference').should.be.eql(true);
    });
  });
  it('should retrieve references to relevant resources', function(){
    config.dbRef = 'test-reference';
    return helpers.createCharge({},{}).then(function(){
      db.lib.child.should.have.been.calledWith('payments');
      db.lib.child.should.have.been.calledWith('card-tokens');
    });
  });
  it('should retrieve customer', function(){
    var customer = {};
    return helpers.createCharge(customer, {}).then(function(){
      lib.getCustomer.callCount.should.be.eql(1);
      var args = lib.getCustomer.getCall(0).args;
      args[0].should.be.eql(customer);
    });
  });
  it('should update stripe id to customer', function(){
    var customer = {id: 'customerId'};
    var payment = {id: 'paymentId'};
    return helpers.createCharge(customer, payment).then(function(){
      db.helpers.updateResource.should.have.been
        .calledWith('customers', 'customerId/stripeId', stripeCustomer.id);
    });
  });
  it('should create a new source', function(){
    var customer = {};
    var payment = {details: {}};
    return helpers.createCharge(customer, payment).then(function(){
      lib.createSource.callCount.should.be.eql(1);
      var args = lib.createSource.getCall(0).args;
      args[0].should.be.eql(customer);
      args[1].should.be.eql(stripeCustomer);
      args[2].should.be.eql(payment.details);
    });
  });
  it('should add card to customer obj', function(){
    var customer = {id: 'customerId'};
    var payment = {id: 'paymentId'};
    return helpers.createCharge(customer, payment).then(function(){
      db.helpers.updateResource.should.have.been
        .calledWith('customers', 'customerId/cards/stripe-source-id', true);
    });
  });
  it('should create a new charge', function(){
    var customer = {};
    var payment = {details: {}};
    return helpers.createCharge(customer, payment).then(function(){
      lib.createCharge.callCount.should.be.eql(1);
      var args = lib.createCharge.getCall(0).args;
      args[0].should.be.eql(stripeSource);
      args[1].should.be.eql(payment);
    });
  });
  it('should add charge id to payment', function(){
    var customer = {id: 'customerId'};
    var payment = {id: 'paymentId'};
    return helpers.createCharge(customer, payment).then(function(){
      db.helpers.updateResource.should.have.been
        .calledWith('payments', 'paymentId/stripeCharge', stripeCharge.id);
    });
  });
  it('should remove card details from payment after', function(){
    var customer = {id: 'customerId'};
    var payment = {id: 'paymentId'};
    var paymentStub = {remove: sinon.stub()};
    db.lib.child.withArgs('paymentId/details').returns(paymentStub);
    return helpers.createCharge(customer, payment).then(function(){
      paymentStub.remove.callCount.should.be.eql(1);
    });
  });
  it('should catch errors and create error obj', function(){
    lib.getCustomer.returns(when.reject(new Error('some error')));
    var customer = {id: 'customerId'};
    var payment = {id: 'paymentId'};
    return helpers.createCharge(customer, payment).then(function(){
      db.lib.child.should.be.calledWith('errors');
      db.lib.push.callCount.should.be.eql(1);
      db.lib.set.callCount.should.be.eql(1);
      var errorObj = db.lib.set.getCall(0).args[0];
      errorObj.should.be.an('object').with.keys(['timestamp', 'description', 'error']);
      errorObj.error.should.be.an('object').with.keys(['message', 'stack']);
      errorObj.error.message.should.be.eql('some error');
    });
  });
});

