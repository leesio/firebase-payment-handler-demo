const config = require('./config');
const express = require('express');
const app = express();


app.use(express.static('public'));
const port = config.port || 3456;
app.listen(port, () => console.log('Listening', port));
