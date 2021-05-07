'use strict'
// Get dependencies
var moment = require("moment");
var bcrypt = require('bcryptjs');
var generator = require('generate-password');

// Common Functions File
var common = require('../config/common')

// Queires Instance
var dbQueries = require('../database/query');
var query = new dbQueries.DB();

// API Health Checker
exports.health = (req, res) => {
    res.status(200).json({ message: "Its Working", datetime: Date.now() });
}

// Login Admin Helper
exports.loginAdmin = (req, res) => {
    const { email, password } = req.body
    let query_str = `select * from users where email = '${email}' and password = '${password}'`

    query.executeQuery(query_str)
        .then(queryResult => {
            if (queryResult.length == 1)
                common.resOnSuccess(res, true, "User Profile has been fetched successfully", queryResult[0])
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
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

// Analytics Helper
exports.analytics = (req, res) => {
    const { date } = req.body
    let query_str = `SELECT * FROM schedules WHERE schedule_date = '${date}'`

    query.executeQuery(query_str)
        .then(scheduleData => {
            if (scheduleData.length > 0) {
                let data_schedule = scheduleData[0];
                bookingSlots(date, data_schedule.start_time, data_schedule.end_time)
                    .then(result => {
                        let analyticsObj = {
                            booked_slots: 0,
                            full_slots: 0,
                            empty_slots: 0,
                            blocked_slots: 0,
                            all_slots: result.length * 4
                        };

                        result.map((slotData, index) => {
                            if (slotData.is_booked > 0 && slotData.is_booked <= 4)
                                analyticsObj.booked_slots = analyticsObj.booked_slots + slotData.is_booked

                            if (slotData.is_booked < 4)
                                analyticsObj.empty_slots = analyticsObj.empty_slots + (4 - slotData.is_booked)

                            if (slotData.is_blocked != 0)
                                analyticsObj.blocked_slots = analyticsObj.blocked_slots + slotData.is_blocked


                            if (result.length == (index + 1)) {
                                analyticsObj.full_slots = (analyticsObj.booked_slots / 4)
                                common.resOnSuccess(res, true, "Booking List has been fetched successfully", analyticsObj)
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

// Analytics Helper
exports.listAllMembers = (req, res) => {
    const { date } = req.body;

    let query_str = `
    SELECT users.id AS user_id, membership.id AS member_id, users.first_name, users.last_name, users.full_name, membership.membership_type, membership.membership_status, membership.membership_start_date, membership.membership_end_date,
    IFNULL(pause_history.id,0) AS is_pause
    FROM users 
    INNER JOIN membership ON membership.user_id = users.id
    LEFT JOIN pause_history ON users.id = pause_history.user_id AND pause_history.pause_start <= '${date}' AND pause_history.pause_end >='${date}' 
    WHERE users.user_type = 'user'`

    query.executeQuery(query_str)
        .then(membersData => {
            if (membersData.length > 0)
                common.resOnSuccess(res, true, "List of members have been fetched successfully", membersData)
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// Member Profile Detail Helper
exports.memberProfileDetails = (req, res) => {
    const { member_id, date } = req.body;
    let query_str = `
    SELECT users.id AS user_id, membership.id AS member_id, users.first_name, users.last_name, users.full_name, users.age, users.phone, users.email, users.address, users.dob,users.gender, users.emergency_num,
    membership.membership_status, membership.membership_type, membership.membership_start_date, membership.membership_end_date,
    IFNULL(pause_history.id,0) AS is_pause, users.profile_picture
    FROM users 
    INNER JOIN membership ON membership.user_id = users.id
    LEFT JOIN pause_history ON users.id = pause_history.user_id AND pause_history.pause_start <= '${date}' AND pause_history.pause_end >='${date}' 
    WHERE users.id= '${member_id}'`

    query.executeQuery(query_str)
        .then(membersData => {
            if (membersData.length > 0)
                common.resOnSuccess(res, true, "Member Profile Detail have been fetched successfully", membersData)
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// Pause Membership Helper
exports.pauseMembership = (req, res) => {
    const { membership_id, user_id, pause_start, pause_end } = req.body;

    let query_str = `INSERT INTO pause_history(membership_id,user_id,pause_start,pause_end) VALUES ('${membership_id}','${user_id}','${pause_start}','${pause_end}')`

    query.executeQuery(query_str)
        .then(membersData => {
            common.resOnSuccess(res, true, "Pause Membership has been added successfully", membersData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// Delete User Helper
exports.deleteUser = (req, res) => {
    const { user_id } = req.body;

    let query_str_1 = `DELETE FROM users WHERE id = '${user_id}'`;
    let query_str_2 = `DELETE FROM pause_history WHERE user_id = '${user_id}'`;
    let query_str_3 = `DELETE FROM membership WHERE user_id = '${user_id}'`;
    let query_str_4 = `DELETE FROM about_user WHERE user_id = '${user_id}'`;
    let query_str_5 = `DELETE FROM question_answer WHERE user_id = '${user_id}'`;

    query.executeQuery(query_str_1)
    query.executeQuery(query_str_2)
    query.executeQuery(query_str_3)
    query.executeQuery(query_str_4)
    query.executeQuery(query_str_5)

    common.resOnSuccess(res, true, "Delete successfully")
}

// Update User Helper
exports.updateUser = (req, res) => {
    const { user_id, first_name, last_name, age, phone, email, address, dob, gender, emergency_num, membership_type, membership_start_date, membership_end_date } = req.body;

    let update_query_str = `UPDATE users SET
        users.first_name = '${first_name}',
        users.last_name = '${last_name}',
        users.age = '${age}',
        users.phone = '${phone}',
        users.email = '${email}',
        users.address = '${address}',
        users.dob = '${dob}',
        users.gender = '${gender}',
        users.emergency_num = '${emergency_num}'
        WHERE id = '${user_id}'`

    let update_query_str_member = `UPDATE membership SET 
        membership.membership_type = '${membership_type}',
        membership.membership_start_date = '${membership_start_date}',
        membership.membership_end_date = '${membership_end_date}'
        WHERE user_id = '${user_id}'`

    query.executeQuery(update_query_str)
        .then(userUpdated => {
            query.executeQuery(update_query_str_member)
                .then(memberUpdated => {
                    let data = []
                    data.push(userUpdated)
                    data.push(memberUpdated)
                    common.resOnSuccess(res, true, "Profile has been updated successfully", data)
                })
                .catch(err => common.resOnError(res, false, err))
        })
        .catch(err => common.resOnError(res, false, err))

}

// Add User Helper
exports.addUser = (req, res) => {
    const { first_name, last_name, age, dob, phone, emergency_num, email, address, membership_type, membership_start_date, gender, profile_picture, answers_list } = req.body;

    let start_date = moment(membership_start_date).format('YYYY-MM-DD')
    let end_date = '';
    switch (membership_type) {
        case "Monthly":
            end_date = moment(start_date).add(30, 'd').format('YYYY-MM-DD');
            break;

        case "6 Weeks":
            end_date = moment(start_date).add(42, 'd').format('YYYY-MM-DD');
            break;

        case "3 Months":
            end_date = moment(start_date).add(90, 'd').format('YYYY-MM-DD');
            break;

        case "8 Weeks":
            end_date = moment(start_date).add(56, 'd').format('YYYY-MM-DD');
            break;

        case "1 Year":
            end_date = moment(start_date).add(365, 'd').format('YYYY-MM-DD');
            break;

        case "12 Days":
            end_date = moment(start_date).add(12, 'd').format('YYYY-MM-DD');
            break;

        default:
            end_date = moment(start_date).add(3, 'd').format('YYYY-MM-DD');
            break;
    }


    query.executeQuery(`select * from users where email = '${email}'`)
        .then(resUserData => {
            if (resUserData.length > 0) {
                common.resOnError(res, false, "Email has already been taken")
            } else {
                var password = generator.generate({ length: 10, numbers: true });
                common.sendPasswordInEmail(email, password)
                bcrypt.hash(password, 10)
                    .then(hashedPassword => {
                        let query_insert_users = `INSERT INTO users(first_name, last_name, age, dob, phone, emergency_num, email, address, gender, full_name,password,profile_picture) values 
                    ('${first_name}','${last_name}','${age}','${dob}','${phone}','${emergency_num}','${email}','${address}','${gender}','${first_name} ${last_name}','${hashedPassword}','${profile_picture}')`

                        query.executeQuery(query_insert_users)
                            .then(userData => {
                                let user_id = userData.insertId
                                let query_insert_membership = `INSERT INTO membership(membership_type,user_id,membership_start_date,membership_end_date) values ('${membership_type}','${user_id}','${start_date}','${end_date}')`;
                                query.executeQuery(query_insert_membership)
                                    .then(membershipData => {
                                        if (membershipData.affectedRows == 1) {
                                            let str_query = `INSERT INTO question_answer (question_id,answer,user_id) VALUES `
                                            answers_list.map((quesData, index) => {
                                                str_query = str_query.concat(',', `('${quesData.question_id}', "${quesData.answer}", '${user_id}')`)
                                                if (answers_list.length == (index + 1)) {
                                                    var resQuery = str_query.replace("VALUES ,(", "VALUES (");
                                                    query.executeQuery(resQuery)
                                                        .then(ansData => {
                                                            if (ansData.affectedRows >= 1)
                                                                common.resOnSuccess(res, true, "Trainee has been added successfully", {})
                                                        })
                                                }
                                            })
                                        }
                                    })
                                    .catch(err => common.resOnError(res, false, err))
                            })
                            .catch(err => common.resOnError(res, false, err))
                    })
                    .catch(err => common.resOnError(res, false, err))
            }
        })
        .catch(err => common.resOnError(res, false, err))
}

// Exercise Plan Helper
exports.exercisePlan = (req, res) => {
    const { date } = req.body;
    let userArray = [];

    let query_str = `SELECT wp.id,wpe.id AS exercise_id,wpe.exercise_name,wpe.exercise_duration,wpe.exercise_details
    FROM week_plan wp
    INNER JOIN week_plan_exercise wpe ON wp.id = wpe.plan_id
    WHERE plan_start <='${date}' AND plan_end >='${date}'`

    query.executeQuery(query_str)
        .then(planData => {
            if (planData.length > 0) {
                planData.map((plan, index) => {
                    let count_query = `SELECT COUNT(*) AS user_count FROM week_plan_users WHERE exercise_id = '${plan.exercise_id}'`
                    query.executeQuery(count_query)
                        .then(countData => {
                            plan.user_count = countData[0].user_count
                            userArray.push(plan)

                            if (planData.length == (index + 1))
                                common.resOnSuccess(res, true, "Trainee has been added successfully", userArray)
                        })
                })
            }
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// List All Booking Helper
exports.listAllBooking = (req, res) => {
    const { date } = req.body;
    let available_slots = [], full_slots = [], blocked_slots = [];
    let query_str = `SELECT * FROM schedules WHERE schedule_date = '${date}'`

    let query_total = `SELECT COUNT(*) AS total FROM booking WHERE booking_date = '${date}'`

    query.executeQuery(query_str)
        .then(scheduleData => {
            if (scheduleData.length > 0) {
                let data_schedule = scheduleData[0];
                bookingSlots(date, data_schedule.start_time, data_schedule.end_time)
                    .then(result => {
                        result.map((slotData, index) => {
                            if (slotData.is_blocked == 1)
                                blocked_slots.push(slotData)

                            if (slotData.booked_slots == 5)
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
                                common.resOnSuccess(res, true, "Booking List has been fetched successfully", objJson)
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

// List All Booking Helper
exports.listAllSchedules = (req, res) => {
    let query_str = `SELECT * FROM schedules`

    query.executeQuery(query_str)
        .then(scheduleData => {
            if (scheduleData.length > 0) {
                common.resOnSuccess(res, true, "Schedules List has been fetched successfully", scheduleData)
            }
            else
                common.resOnError(res, false, "No Record Found")
        })
        .catch(err => common.resOnError(res, false, err))
}

// Delete All Schedules Helper
exports.deleteAllSchedules = (req, res) => {
    let query_str = `TRUNCATE TABLE schedules`

    query.executeQuery(query_str)
        .then(scheduleData => {
            common.resOnSuccess(res, true, "Deleted successfully", scheduleData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// Delete Schedules Helper
exports.deleteSchedules = (req, res) => {
    const { id } = req.body;
    let query_str = `delete FROM schedules where id = '${id}'`

    query.executeQuery(query_str)
        .then(scheduleData => {
            common.resOnSuccess(res, true, "Deleted successfully", scheduleData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// Add Schedules Helper
exports.addSchedules = (req, res) => {
    const { schedule_date, end_schedule_date } = req.body;

    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var a = moment(schedule_date);
    var b = moment(end_schedule_date).add(1, 'days');

    for (var m = moment(a); m.isBefore(b); m.add(1, 'days')) {
        var d = new Date(m.format('YYYY-MM-DD'));

        let sc_day = days[d.getDay()];
        let sc_date = m.format('YYYY-MM-DD');
        let query_str = ``

        if (sc_day == "Monday" || sc_day == "Tuesday" || sc_day == "Wednesday" || sc_day == "Thursday") {
            query_str = `INSERT INTO schedules (day,start_time,end_time,schedule_date,trainer_id,is_off,break_start_time, break_end_time) 
            VALUES ('${sc_day}','06:00','20:00','${sc_date}','1','0','14:00', '16:00')`
        }
        else if (sc_day == "Friday") {
            query_str = `INSERT INTO schedules (day,start_time,end_time,schedule_date,trainer_id,is_off,break_start_time, break_end_time) 
            VALUES ('${sc_day}','06:00','19:00','${sc_date}','1','0','14:00', '16:00')`
        }
        else if (sc_day == "Saturday") {
            query_str = `INSERT INTO schedules (day,start_time,end_time,schedule_date,trainer_id,is_off,break_start_time, break_end_time) 
            VALUES ('${sc_day}','10:00','12:00','${sc_date}','1','0','', '')`
        }

        let query_date_str = `select * from schedules where schedule_date = '${sc_date}'`

        if (query_str != ``) {
            query.executeQuery(query_date_str)
                .then(resSchedules => {
                    if (resSchedules.length > 0)
                        common.resOnError(res, false, `Schedule has already been set for this date ${sc_date}`)
                    else {
                        query.executeQuery(query_str)
                            .then(scheduleData => {
                                if (sc_date == end_schedule_date)
                                    common.resOnSuccess(res, true, "Schedules has been added successfully", scheduleData)
                            })
                            .catch(err => common.resOnError(res, false, err))
                    }
                })
        }
    }


}

// Edit Schedules Helper
exports.editSchedules = (req, res) => {
    const { id, day, start_time, end_time, schedule_date, break_start_time, break_end_time } = req.body;
    let query_str = `update schedules set day='${day}',start_time='${start_time}', end_time='${end_time}',schedule_date='${schedule_date}',
    break_start_time = '${break_start_time}', break_end_time = '${break_end_time}' where id = '${id}'`

    query.executeQuery(query_str)
        .then(scheduleData => {
            common.resOnSuccess(res, true, "Schedules has been updated successfully", scheduleData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// Block Slots Helper
exports.blockSlots = (req, res) => {
    const { booking_date, booking_start_time, booking_end_time } = req.body;
    let query_str = `insert into booking(booking_date,booking_start_time,booking_end_time,is_blocked) values ('${booking_date}','${booking_start_time}','${booking_end_time}','1')`
    let query_delete = `delete from booking where booking_date = '${booking_date}' and booking_start_time = '${booking_start_time}' and booking_end_time = '${booking_end_time}'`

    query.executeQuery(query_delete)
        .then(resDelete => {
            query.executeQuery(query_str)
                .then(bookingData => {
                    common.resOnSuccess(res, true, "Booking has been Blocked successfully", bookingData)
                })
                .catch(err => common.resOnError(res, false, err))
        })
}

// List All Customer Helper
exports.listAllCustomer = (req, res) => {
    let query_str = `select id,first_name,last_name from users where user_type = 'user'`

    query.executeQuery(query_str)
        .then(customerData => {
            if (customerData.length > 0)
                common.resOnSuccess(res, true, "Customer data has been fetched successfully", customerData)
            else
                common.resOnError(res, false, err)
        })
        .catch(err => common.resOnError(res, false, err))
}

// Make Booking for User Helper
exports.makeBookingForUser = (req, res) => {
    const { booking_date, booking_start_time, booking_end_time, customer_id } = req.body;
    let query_str = `insert into booking(booking_date,booking_start_time,booking_end_time,customer_id) 
    values ('${booking_date}','${booking_start_time}','${booking_end_time}','${customer_id}')`

    let query_slot_available = `select * from booking where booking_date = '${booking_date}' and booking_start_time= '${booking_start_time}' and booking_end_time= '${booking_end_time}' and customer_id = '${customer_id}'`

    query.executeQuery(query_slot_available)
        .then(resBooking => {
            if (resBooking.length > 0) {
                common.resOnSuccess(res, false, "Booking has already been made", resBooking)
            } else {
                query.executeQuery(query_str)
                    .then(bookingData => {
                        common.resOnSuccess(res, true, "Booking has been added successfully", bookingData)
                    })
                    .catch(err => common.resOnError(res, false, err))
            }
        })
}

// Un Block Slots Helper
exports.unBlockSlots = (req, res) => {
    const { booking_date, booking_start_time, booking_end_time } = req.body;
    let query_str = `delete from booking where booking_date =  '${booking_date}' and booking_start_time = '${booking_start_time}' and booking_end_time = '${booking_end_time}'`

    query.executeQuery(query_str)
        .then(bookingData => {
            common.resOnSuccess(res, true, "Slots has been un blocked successfully", bookingData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// Upload Picture Helper
exports.uploadPicture = (req, res) => {
    let profileImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

    if (req.file) {
        profileImage = req.file.original.Location
    }

    common.resOnSuccess(res, true, "Picture has been uploaded", profileImage)
}

// Pending Pause List Helper
exports.pendingPauseList = (req, res) => {
    let query_str = `
        select users.full_name,pause_history.pause_start,pause_history.pause_end,pause_history.reason,pause_history.id as pause_id
        from pause_history
        inner join users on users.id = pause_history.user_id
        where pause_history.is_approved = '0' and pause_history.is_cancel = '0'`

    query.executeQuery(query_str)
        .then(pauseData => {
            if (pauseData.length > 0)
                common.resOnSuccess(res, true, "Pending Pause List has been fetched successfully", pauseData)
            else
                common.resOnSuccess(res, false, "No Record Found", pauseData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// Accept Pending Pause Request Helper
exports.acceptPendingRequest = (req, res) => {
    const { pause_id } = req.body;
    let query_str = `update pause_history set is_approved= '1' where id = '${pause_id}'`

    query.executeQuery(query_str)
        .then(pauseData => {
            common.resOnSuccess(res, true, "Pause request has been approved successfully", pauseData)
        })
        .catch(err => common.resOnError(res, false, err))
}

// Cancel Pending Pause Request Helper
exports.cancelPendingRequest = (req, res) => {
    const { pause_id } = req.body;
    let query_str = `update pause_history set is_cancel= '1' where id = '${pause_id}'`

    query.executeQuery(query_str)
        .then(pauseData => {
            common.resOnSuccess(res, true, "Pause request has been approved successfully", pauseData)
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
            `SELECT COUNT(*) AS booked_slots,
            (
                SELECT COUNT(*) AS is_booked 
                FROM booking WHERE 
                booking_start_time = '${bookingSlots.booking_start_time}' AND 
                booking_end_time = '${bookingSlots.booking_end_time}' 
                AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0
            ) AS is_booked, IFNULL(is_blocked, 0) AS is_blocked
            FROM booking WHERE 
            booking_start_time = '${bookingSlots.booking_start_time}' AND 
            booking_end_time = '${bookingSlots.booking_end_time}' 
            AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0`

        query.executeQuery(booking_slots_query)
            .then(slotsData => {
                bookingSlots.booked_slots = slotsData[0].booked_slots
                bookingSlots.is_booked = slotsData[0].is_booked
                bookingSlots.is_blocked = slotsData[0].is_blocked
                let query_booking_user = `
                SELECT users.id AS user_id,CONCAT(users.first_name,' ',users.last_name) AS full_name
                FROM users
                INNER JOIN booking ON booking.customer_id = users.id
                WHERE booking.booking_date = '${moment(date).format('yyyy-MM-DD')}' AND booking.booking_start_time = '${bookingSlots.booking_start_time}' AND booking_end_time='${bookingSlots.booking_end_time}'`
                query.executeQuery(query_booking_user)
                    .then(dbUsers => {
                        bookingSlots.userAdded = dbUsers
                    })
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
                            AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0
                        ) AS is_booked,IFNULL(is_blocked, 0) AS is_blocked
                        FROM booking WHERE 
                        booking_start_time = '${bookingSlots.booking_start_time}' AND 
                        booking_end_time = '${bookingSlots.booking_end_time}' 
                        AND booking_date = '${moment(date).format('yyyy-MM-DD')}' and is_cancel = 0`

                    query.executeQuery(booking_slots_query)
                        .then(slotsData2 => {
                            bookingSlots.booked_slots = slotsData2[0].booked_slots
                            bookingSlots.is_booked = slotsData2[0].is_booked
                            bookingSlots.is_blocked = slotsData2[0].is_blocked

                            let query_booking_user = `
                                        SELECT users.id AS user_id,CONCAT(users.first_name,' ',users.last_name) AS full_name
                                        FROM users
                                        INNER JOIN booking ON booking.customer_id = users.id
                                        WHERE booking.booking_date = '${moment(date).format('yyyy-MM-DD')}' AND booking.booking_start_time = '${bookingSlots.booking_start_time}' AND booking_end_time='${bookingSlots.booking_end_time}'`
                            query.executeQuery(query_booking_user)
                                .then(dbUsers => {
                                    bookingSlots.userAdded = dbUsers

                                    timeSlots.push(bookingSlots);

                                    if (bookingSlots.booking_end_time == end_time)
                                        resolve(timeSlots)
                                })
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