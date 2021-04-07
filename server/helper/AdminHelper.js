'use strict'
// Get dependencies
var moment = require("moment");

// Common Functions File
var common = require('../config/common')

// Queires Instance
var dbQueries = require('../database/query');
var query = new dbQueries.DB();

// API Health Checker
exports.health = (req, res) => {
    res.status(200).json({ message: "Its Working", datetime: Date.now() });
}

// User Profile Helper
exports.userProfile = (req, res) => {
    const { id } = req.body

    let query_str = `
    SELECT users.first_name,users.last_name,users.email,users.gender,users.age,about_user.about_text 
    FROM users INNER JOIN about_user ON users.id = about_user.user_id WHERE users.id = '${id}'`

    query.executeQuery(query_str)
        .then(queryResult => {
            if (queryResult.length == 1)
                common.resOnSuccess(res, true, "User Profile has been fetched successfully", queryResult[0])
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}