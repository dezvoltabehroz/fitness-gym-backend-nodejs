'use strict'
// Get dependencies
const mysql = require("mysql");
const config = require("../config/config.json")
const { json } = require("body-parser");

let connection;
if (process.env.NODE_ENV == "production")
    connection = mysql.createPool(config.production.poolDB);
else
    connection = mysql.createPool(config.dev.poolDB);

connection.getConnection(function (err, connection) {
    if (err) {
        console.log(`${'Database Connection Error '} - ${err}`)
        throw err
    }
    else {
        console.log(`${process.env.NODE_ENV} Database Connection Success - New Code Connection`);
    }
});

module.exports = {
    connection: connection
};