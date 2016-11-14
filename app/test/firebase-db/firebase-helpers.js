const sinon = require('sinon');
const chai = require('chai');
const when = require('when');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('firebase-helpers', function(){
  var helpersProvider, helpers, db, config;
  beforeEach(function(){
    db = {
      ref: sinon.stub().returnsThis(),
      update: sinon.stub().returns(when.resolve()),
      child: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis(),
      push: sinon.stub().returns('key'),
      set: sinon.stub()
    };
    config = {};
    helpersProvider = require('../../firebase-db/firebase-helpers');
    helpers = helpersProvider(db, config);
  });
  it('should use the dbRef from config', function(){
    config.dbRef = 'test-reference';
    return helpers.updateResource('', '', 0).then(function(){
      db.ref.should.be.calledWith('test-reference');
    });
  });
  it('should get the reference passed in as an arg', function(){
    return helpers.updateResource('example', '', 0).then(function(){
      db.child.should.be.calledWith('example');
    });
  });
  it('should build the update object and perform update', function(){
    return helpers.updateResource('', 'some/path', 'some-value').then(function(){
      db.update.should.be.calledWith({
        'some/path': 'some-value'
      });
    });
  });
  it('should catch errors and create error obj', function(){
    db.update.returns(when.reject(new Error('some error')));
    return helpers.updateResource('', '', '').then(function(){
      db.child.should.be.calledWith('errors');
      db.push.callCount.should.be.eql(1);
      db.set.callCount.should.be.eql(1);
      var errorObj = db.set.getCall(0).args[0];
      errorObj.should.be.an('object').with.keys(['timestamp', 'description', 'error']);
      errorObj.error.should.be.an('object').with.keys(['message', 'stack']);
      errorObj.error.message.should.be.eql('some error');
    });
  });
});
