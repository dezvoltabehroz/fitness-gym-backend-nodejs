'use strict'

// Get dependencies
const http = require('http');
const app = require('./server/app');
const server = http.createServer(app);
server.listen(process.env.PORT, () => console.log(`API running on ${process.env.NODE_ENV} Server:${process.env.PORT}`));