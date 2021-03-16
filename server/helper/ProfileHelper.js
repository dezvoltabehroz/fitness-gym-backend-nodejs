'use strict'
// Get dependencies

// Common Functions File
var common = require('../config/common')

// Queires Instance
var dbQueries = require('../database/query');
var query = new dbQueries.DB();

// API Health Checker
exports.health = (req, res) => {
    res.status(200).json({ message: "Its Working", datetime: Date.now() });
}

// API Health Checker
exports.aboutUs = (req, res) => {
    query.executeQuery(`SELECT * FROM about_us`)
        .then(queryResult => {
            if (queryResult.length == 1)
                common.resOnSuccess(res, true, "About Us has been fetched successfully", queryResult[0])
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Get Profile Detail Checker
exports.getProfileDetail = (req, res) => {
    const { id } = req.body;
    query.executeQuery(`SELECT * FROM users where id = '${id}'`)
        .then(queryResult => {
            if (queryResult.length == 1)
                common.resOnSuccess(res, true, "Profile has been fetched successfully", queryResult[0])
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}