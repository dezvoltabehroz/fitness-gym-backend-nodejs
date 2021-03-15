'use strict'

// Get dependencies
const http = require('http');
const app = require('./server/app');
const server = http.createServer(app);
server.listen(3000, () => console.log(`API running on ${process.env.NODE_ENV} Server:3000`));