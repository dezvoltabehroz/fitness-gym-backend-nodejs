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
    SELECT users.profile_picture,users.full_name,users.email,users.phone,membership.membership_type,membership.id AS member_id,membership.membership_start_date,membership.membership_end_date,DATEDIFF(membership.membership_end_date,membership.membership_start_date) AS days
    FROM users
    INNER JOIN membership ON membership.user_id = users.id
    WHERE users.id = '${id}'`;

    query.executeQuery(select_query)
        .then(memberData => {
            if (memberData.length > 0) {
                query.executeQuery(`SELECT COUNT(*) AS pause_count FROM pause_history WHERE membership_id = '${memberData[0].member_id}' AND user_id = '${id}' and is_approved = '1'`)
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
    SELECT pause_history.reason, pause_history.id, pause_history.is_approved,pause_history.pause_start, pause_history.pause_end, membership.membership_type, DATEDIFF(pause_history.pause_end,pause_history.pause_start) AS days
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

    if (start_date > end_date) {
        common.resOnError(res, false, "Start date should be less than end date")
    }
    else {
        let select_query = `
        INSERT INTO pause_history(membership_id,user_id,pause_start,pause_end,reason) 
        VALUES ('${member_id}','${id}','${start_date}','${end_date}','${reason}')`;

        let query_str_pause = `select * from pause_history where membership_id = '${member_id}' and user_id = '${id}' and pause_start<= '${start_date}' and '${start_date}'<=pause_end`
        let query_membership_check = `select * from membership where id = '${member_id}' and user_id = '${id}' and (membership_start_date <= '${start_date}' and '${start_date}' <= membership_end_date) and (membership_start_date <= '${end_date}' and '${end_date}' <= membership_end_date)`

        query.executeQuery(query_membership_check)
            .then(resMembership => {
                if (resMembership.length > 0) {
                    query.executeQuery(query_str_pause)
                        .then(resPauseData => {
                            if (resPauseData.length > 0) {
                                common.resOnError(res, false, "Unable to process request with same dates")
                            }
                            else {
                                query.executeQuery(select_query)
                                    .then(pauseData => {
                                        if (pauseData.affectedRows == 1)
                                            common.resOnSuccess(res, true, "Pause Request has been added successfully", pauseData)
                                        else
                                            common.resOnError(res, false, "No Record Found")
                                    })
                                    .catch(err => common.resOnError(res, false, err))
                            }
                        })
                } else {
                    common.resOnError(res, false, "Please select dates during your membership period")
                }
            })
    }
}

// API Cancel Request Pause Membership
exports.cancelRequestPauseMembership = (req, res) => {
    const { pause_request_id } = req.body;

    let update_query = `delete from pause_history WHERE id = '${pause_request_id}'`;

    query.executeQuery(update_query)
        .then(pauseData => {
            if (pauseData.affectedRows == 1)
                common.resOnSuccess(res, true, "Request has been Cancel successfully", pauseData)
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// API List All Booking
exports.listAllBookings = (req, res) => {
    const { id } = req.body;

    let select_query = `SELECT * FROM booking WHERE customer_id = '${id}' and is_cancel = 0 order by booking_date desc`;

    query.executeQuery(select_query)
        .then(async (bookingData) => {
            if (bookingData.length > 0) {
                let list_booking = [];
                let interation = 0;
                bookingData.map(async (dataBooking) => {
                    let booking_date = moment(dataBooking.booking_date).format('yyyy-MM-DD');
                    let booking_slots_query = `SELECT COUNT(*) AS booked_slots FROM booking WHERE booking_start_time = '${dataBooking.booking_start_time}' AND booking_end_time = '${dataBooking.booking_end_time}' AND booking_date = '${booking_date}' and is_cancel = 0`
                    await query.executeQuery(booking_slots_query)
                        .then(slotsData => {
                            dataBooking.booked_slots = slotsData[0].booked_slots
                            list_booking.push(dataBooking)
                            interation++;
                            if (bookingData.length == interation) {
                                list_booking = list_booking.sort(function(a, b) {
                                    var dateA = new Date(a.booking_date), dateB = new Date(b.booking_date);
                                    return dateB - dateA;
                                });
                                common.resOnSuccess(res, true, "Request has been Cancel successfully", list_booking)
                            }
                        })
                        .catch(err => common.resOnError(res, false, err))
                })
            }
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Cancel Bookings
exports.cancelBookings = (req, res) => {
    const { id, booking_id } = req.body;

    let update_query = `UPDATE booking SET is_cancel = '1' WHERE id = '${booking_id}' and customer_id = '${id}'`;

    query.executeQuery(update_query)
        .then(cancelData => {
            if (cancelData.affectedRows == 1)
                common.resOnSuccess(res, true, "Booking has been Cancel successfully", cancelData)
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}