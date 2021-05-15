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

// API Get All Booking By Date And Time
exports.getBookings = (req, res) => {
    const { id, date, start_time, end_time } = req.body;

    let query_str = `SELECT * FROM schedules WHERE schedule_date = '${date}'`
    let query_str_membership = `SELECT * FROM membership WHERE membership_start_date <= '${date}' AND  '${date}' <=  membership_end_date AND user_id = '${id}'`

    query.executeQuery(query_str_membership)
        .then(resMembership => {
            if (resMembership.length > 0) {
                if (start_time && end_time) {
                    query.executeQuery(query_str)
                        .then(scheduleData => {
                            if (scheduleData.length > 0) {
                                let data_schedule = scheduleData[0];
                                bookingSlots(id, date, start_time, end_time)
                                    .then(result => {
                                        let newArraySlots = [];
                                        result.forEach((slotData, index) => {
                                            if (data_schedule.break_start_time <= slotData.booking_start_time && data_schedule.break_end_time >= slotData.booking_end_time) {
                                                slotData.isBreak = true;
                                                newArraySlots.push(slotData)
                                                if (result.length == (index + 1)) {
                                                    filteringArrays(newArraySlots)
                                                        .then(filterArray => {
                                                            let data = {
                                                                start_time: data_schedule.start_time,
                                                                end_time: data_schedule.end_time,
                                                                filterArray: filterArray
                                                            }
                                                            common.resOnSuccess(res, true, "Booking List has been fetched successfully", data)
                                                        })
                                                }
                                            }
                                            else {
                                                slotData.isBreak = false;
                                                newArraySlots.push(slotData)
                                                if (result.length == (index + 1)) {
                                                    filteringArrays(newArraySlots)
                                                        .then(filterArray => {
                                                            let data = {
                                                                start_time: data_schedule.start_time,
                                                                end_time: data_schedule.end_time,
                                                                filterArray: filterArray
                                                            }
                                                            common.resOnSuccess(res, true, "Booking List has been fetched successfully", data)
                                                        })
                                                }
                                            }
                                        })
                                    })
                                    .catch(err => common.resOnError(res, false, err))
                            }
                            else
                                common.resOnError(res, false, "No Record Found")
                        })
                        .catch(err => common.resOnError(res, false, err))
                }
                else {
                    query.executeQuery(query_str)
                        .then(scheduleData => {
                            if (scheduleData.length > 0) {
                                let data_schedule = scheduleData[0];
                                bookingSlots(id, date, data_schedule.start_time, data_schedule.end_time)
                                    .then(result => {
                                        let newArraySlots = [];

                                        result.forEach((slotData, index) => {
                                            if (data_schedule.break_start_time <= slotData.booking_start_time && data_schedule.break_end_time >= slotData.booking_end_time) {
                                                slotData.isBreak = true;
                                                newArraySlots.push(slotData)
                                                if (result.length == (index + 1)) {
                                                    filteringArrays(newArraySlots)
                                                        .then(filterArray => {
                                                            let data = {
                                                                start_time: data_schedule.start_time,
                                                                end_time: data_schedule.end_time,
                                                                filterArray: filterArray
                                                            }
                                                            common.resOnSuccess(res, true, "Booking List has been fetched successfully", data)
                                                        })
                                                }
                                            }
                                            else {
                                                slotData.isBreak = false;
                                                newArraySlots.push(slotData)
                                                if (result.length == (index + 1)) {
                                                    filteringArrays(newArraySlots)
                                                        .then(filterArray => {
                                                            let data = {
                                                                start_time: data_schedule.start_time,
                                                                end_time: data_schedule.end_time,
                                                                filterArray: filterArray
                                                            }
                                                            common.resOnSuccess(res, true, "Booking List has been fetched successfully", data)
                                                        })
                                                }
                                            }
                                        })
                                    })
                                    .catch(err => common.resOnError(res, false, err))
                            }
                            else
                                common.resOnError(res, false, "No Record Found")
                        })
                        .catch(err => common.resOnError(res, false, err))
                }
            }
            else {
                query.executeQuery(query_str)
                    .then(scheduleData => {
                        if (scheduleData.length > 0) {
                            let data_schedule = scheduleData[0];

                            let data = {
                                start_time: data_schedule.start_time,
                                end_time: data_schedule.end_time,
                                filterArray: []
                            }
                            common.resOnSuccess(res, false, "You don't have active membership", data)
                        }
                        else
                            common.resOnError(res, false, "No Record Found")
                    })
            }
        })
}

// API Book Slot
exports.bookSlot = (req, res) => {
    const { id, booking_date, booking_start_time, booking_end_time } = req.body;
    let query_insert = `INSERT INTO booking (booking_date,booking_start_time,booking_end_time,customer_id) 
    VALUES('${booking_date}','${booking_start_time}','${booking_end_time}','${id}')`

    query.executeQuery(query_insert)
        .then(resData => {
            if (resData.affectedRows == 1)
                common.resOnSuccess(res, true, "Slot has been booked successfully", resData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Un Book Slot
exports.unBookSlot = (req, res) => {
    const { id, booking_date, booking_start_time, booking_end_time } = req.body;
    console.log(id, booking_date, booking_start_time, booking_end_time)
    let query_delete = `DELETE FROM booking WHERE booking_date='${booking_date}' AND booking_start_time='${booking_start_time}' AND booking_end_time='${booking_end_time}' AND customer_id = '${id}'`

    query.executeQuery(query_delete)
        .then(resData => {
            common.resOnSuccess(res, true, "Slot has been deleted successfully", resData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// ============================================================== Function ==============================================================
function bookingSlots(id, date, start_time, end_time) {
    return new Promise((resolve, reject) => {
        bookingSlotsArray(id, date, start_time, end_time)
            .then(resultArray => {
                resolve(resultArray)
            })
            .catch(err => reject(err))
    })
}

function bookingSlotsArray(id, date, start_time, end_time) {
    return new Promise((resolve, reject) => {
        let interval = "20";

        let bookingSlots = {};
        bookingSlots.booking_time_duration = "00:20:00";
        bookingSlots.booking_start_time = start_time;
        bookingSlots.booking_end_time = moment(start_time, 'HH:mm:ss').add(interval, 'minutes').format("HH:mm:ss");

        let booking_slots_query =
            `SELECT COUNT(*) AS booked_slots,
            (
                SELECT COUNT(*) AS is_booked 
                FROM booking WHERE 
                booking_start_time = '${bookingSlots.booking_start_time}' AND 
                booking_end_time = '${bookingSlots.booking_end_time}' 
                AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0 AND customer_id = '${id}'
            ) AS is_booked, is_blocked, is_unavailable
            FROM booking WHERE 
            booking_start_time = '${bookingSlots.booking_start_time}' AND 
            booking_end_time = '${bookingSlots.booking_end_time}' 
            AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0 group by is_blocked`

        query.executeQuery(booking_slots_query)
            .then(async slotsData => {
                bookingSlots.booked_slots = slotsData[0].booked_slots
                bookingSlots.is_booked = slotsData[0].is_booked
                bookingSlots.is_blocked = slotsData[0].is_blocked
                bookingSlots.is_unavailable = slotsData[0].is_unavailable
                let timeSlots = [bookingSlots];

                while (start_time != end_time) {
                    start_time = addMinutes(start_time, interval);
                    let bookingSlots = {};
                    bookingSlots.booking_time_duration = "00:20:00";
                    bookingSlots.booking_start_time = start_time;
                    bookingSlots.booking_end_time = moment(start_time, 'HH:mm:ss').add(interval, 'minutes').format("HH:mm:ss");

                    let booking_slots_query =
                        `SELECT COUNT(*) AS booked_slots,
                        (
                            SELECT COUNT(*) AS is_booked 
                            FROM booking WHERE 
                            booking_start_time = '${bookingSlots.booking_start_time}' AND 
                            booking_end_time = '${bookingSlots.booking_end_time}' 
                            AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0 AND customer_id = '${id}'
                        ) AS is_booked,is_blocked, is_unavailable
                        FROM booking WHERE 
                        booking_start_time = '${bookingSlots.booking_start_time}' AND 
                        booking_end_time = '${bookingSlots.booking_end_time}' 
                        AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0 group by is_blocked`

                    await query.executeQuery(booking_slots_query)
                        .then(slotsData2 => {
                            bookingSlots.booked_slots = slotsData2[0].booked_slots
                            bookingSlots.is_booked = slotsData2[0].is_booked
                            bookingSlots.is_blocked = slotsData2[0].is_blocked
                            bookingSlots.is_unavailable = slotsData2[0].is_unavailable
                            timeSlots.push(bookingSlots);

                            if (bookingSlots.booking_end_time == end_time)
                                resolve(timeSlots)
                        })
                        .catch(err => reject(err))
                }
            })
            .catch(err => reject(err))
    })
}

function addMinutes(time, minutes) {
    var date = new Date(new Date('01/01/2015 ' + time).getTime() + minutes * 60000);
    var tempTime = ((date.getHours().toString().length == 1) ? '0' + date.getHours() : date.getHours()) + ':' +
        ((date.getMinutes().toString().length == 1) ? '0' + date.getMinutes() : date.getMinutes()) + ':' +
        ((date.getSeconds().toString().length == 1) ? '0' + date.getSeconds() : date.getSeconds());
    return tempTime;
}

function filteringArrays(result) {
    return new Promise((resolve, reject) => {
        let available_slots = [], full_slots = [], blocked_slots = [];

        result.map((slotData, index) => {
            if (slotData.is_blocked == 1)
                blocked_slots.push(slotData)

            if (slotData.booked_slots >= 1)
                full_slots.push(slotData)

            if (slotData.booked_slots < 5)
                available_slots.push(slotData)

            if (result.length == (index + 1)) {
                let objJson = {
                    all_slots: result,
                    blocked_slots: blocked_slots,
                    full_slots: full_slots,
                    available_slots: available_slots
                }
                resolve(objJson)
            }
        })
    })
}