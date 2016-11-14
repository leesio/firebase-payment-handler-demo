require('./config');
const updateListeners = require('./update-listeners');

module.exports = function(){
  updateListeners.initialiseListeners();
}();
