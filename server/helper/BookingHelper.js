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
    const { date } = req.body;

    let query_str = `SELECT * FROM schedules WHERE schedule_date = '${date}'`

    query.executeQuery(query_str)
        .then(scheduleData => {
            if (scheduleData.length > 0) {
                let data_schedule = scheduleData[0];
                bookingSlots(date, data_schedule.start_time, data_schedule.end_time)
                    .then(result => {
                        let newArraySlots = [];

                        result.forEach((slotData, index) => {
                            if (data_schedule.break_start_time <= slotData.booking_start_time && data_schedule.break_end_time >= slotData.booking_end_time) {
                                slotData.isBreak = true;
                                newArraySlots.push(slotData)
                                if (result.length == (index + 1)) {
                                    common.resOnSuccess(res, true, "Booking List has been fetched successfully", newArraySlots)
                                }
                            }
                            else {
                                slotData.isBreak = false;
                                newArraySlots.push(slotData)
                                if (result.length == (index + 1)) {
                                    common.resOnSuccess(res, true, "Booking List has been fetched successfully", newArraySlots)
                                }
                            }
                        })

                        // common.resOnSuccess(res, true, "Booking List has been fetched successfully", result)
                    })
                    .catch(err => common.resOnError(res, false, err))
            }
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}



// ============================================================== Function ==============================================================
function bookingSlots(date, start_time, end_time) {
    return new Promise((resolve, reject) => {
        bookingSlotsArray(date, start_time, end_time)
            .then(resultArray => {
                resolve(resultArray)
            })
            .catch(err => reject(err))
    })
}

function bookingSlotsArray(date, start_time, end_time) {
    return new Promise((resolve, reject) => {
        let interval = "20";

        let bookingSlots = {};
        bookingSlots.booking_time_duration = "00:20:00";
        bookingSlots.booking_start_time = start_time;
        bookingSlots.booking_end_time = moment(start_time, 'HH:mm:ss').add(interval, 'minutes').format("HH:mm:ss");

        let booking_slots_query =
            `SELECT COUNT(*) AS booked_slots 
            FROM booking WHERE 
            booking_start_time = '${bookingSlots.booking_start_time}' AND 
            booking_end_time = '${bookingSlots.booking_end_time}' 
            AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0`

        query.executeQuery(booking_slots_query)
            .then(slotsData => {
                bookingSlots.booked_slots = slotsData[0].booked_slots
                let timeSlots = [bookingSlots];

                while (start_time != end_time) {
                    start_time = addMinutes(start_time, interval);
                    let bookingSlots = {};
                    bookingSlots.booking_time_duration = "00:20:00";
                    bookingSlots.booking_start_time = start_time;
                    bookingSlots.booking_end_time = moment(start_time, 'HH:mm:ss').add(interval, 'minutes').format("HH:mm:ss");

                    let booking_slots_query =
                        `SELECT COUNT(*) AS booked_slots 
                        FROM booking WHERE 
                        booking_start_time = '${bookingSlots.booking_start_time}' AND 
                        booking_end_time = '${bookingSlots.booking_end_time}' 
                        AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0`

                    query.executeQuery(booking_slots_query)
                        .then(slotsData2 => {
                            bookingSlots.booked_slots = slotsData2[0].booked_slots
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