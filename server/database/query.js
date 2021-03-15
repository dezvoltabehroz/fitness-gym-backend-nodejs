'use strict'
// Get dependencies
var db = require("../database");

module.exports.DB = class Query {
    executeQuery(query_str) {
        return new Promise((resolved, reject) => {
            db.connection.query(query_str, (error, results) => { error ? reject(error) : resolved(results) });
        })
    }
}