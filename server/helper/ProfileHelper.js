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

// API Health
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

// API Get Profile Detail
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

// API Change Profile Detail
exports.changeProfileDetail = (req, res) => {
    const { id, phone, name } = req.body;
    query.executeQuery(`update users set full_name='${name}',phone='${phone}' where id = '${id}'`)
        .then(queryResult => {
            if (queryResult.affectedRows == 1)
                common.resOnSuccess(res, true, "Profile has been Updated successfully", queryResult[0])
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Get Membership Details
exports.getMembershipDetail = (req, res) => {
    const { id } = req.body;

    let select_query = `
    SELECT users.profile_picture,users.full_name,users.email,users.phone,membership.membership_type,membership.id AS member_id,membership.membership_start_date,membership.membership_end_date
    FROM users
    INNER JOIN membership ON membership.user_id = users.id
    WHERE users.id = '${id}'`;

    query.executeQuery(select_query)
        .then(memberData => {
            if (memberData.length > 0) {
                query.executeQuery(`SELECT COUNT(*) AS pause_count FROM pause_history WHERE membership_id = '${memberData[0].member_id}' AND user_id = '${id}'`)
                    .then(pauseData => {
                        memberData[0].pause_count = pauseData[0].pause_count
                        common.resOnSuccess(res, true, "Membership has been fetched successfully", memberData[0])
                    })
            }
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Get Pause List
exports.getPauseList = (req, res) => {
    const { id, member_id } = req.body;

    let select_query = `
    SELECT pause_history.pause_start, pause_history.pause_end, membership.membership_type, DATEDIFF(pause_history.pause_end,pause_history.pause_start) AS days
    FROM pause_history 
    INNER JOIN membership ON membership.id = pause_history.membership_id
    WHERE membership.id = '${member_id}' AND membership.user_id = '${id}' and pause_history.is_cancel='0'`;

    query.executeQuery(select_query)
        .then(memberData => {
            if (memberData.length > 0)
                common.resOnSuccess(res, true, "Pause List has been fetched successfully", memberData)
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Request Pause Membership
exports.requestPauseMembership = (req, res) => {
    const { id, member_id, start_date, end_date, reason } = req.body;

    let select_query = `
    INSERT INTO pause_history(membership_id,user_id,pause_start,pause_end,reason) 
    VALUES ('${member_id}','${id}','${start_date}','${end_date}','${reason}')`;

    query.executeQuery(select_query)
        .then(pauseData => {
            if (pauseData.affectedRows == 1)
                common.resOnSuccess(res, true, "Pause Request has been added successfully", pauseData)
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}