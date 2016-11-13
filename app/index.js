const config = require('./config');
const updateListeners = require('./update-listeners');
require('./server');

updateListeners.initialiseListeners();
