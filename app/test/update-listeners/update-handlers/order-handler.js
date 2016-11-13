const sinon = require('sinon');
require('chai').should();
const when = require('when');


describe('order-handler', function(){
  var handler, snapshot;
  beforeEach(function(){
    snapshot = {
      val: sinon.stub(),
      key: 'abc-def'
    };

    handler = require('../../../update-listeners/update-handlers/order-handler');
  });
  it('should export a function', function(){
    handler.should.be.a('function');
  });
  it('should return a promise', function(){
    console.log(typeof handler(snapshot));
    handler(snapshot).should.be.a('promise');
  });
  it('should ignore the first update', function(){
    //return handler({})
  });
});


