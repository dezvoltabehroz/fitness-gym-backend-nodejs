'use strict'
// Get dependencies
var jwt = require('jsonwebtoken');
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

// API Add Trainee
exports.addTrainee = (req, res) => {
    const { first_name, last_name, age, dob, phone, emergency_num, email, address, user_type } = req.body;

    var password = generator.generate({ length: 10, numbers: true });
    bcrypt.hash(password, 10)
        .then(hashedPassword => {
            let add_trainee_query =
                `insert into users (first_name, last_name, age, dob, phone, emergency_num, email, address, user_type,password) 
                values ('${first_name}','${last_name}','${age}','${dob}','${phone}','${emergency_num}','${email}','${address}','${user_type}','${hashedPassword}')`;

            let check_email_query = `select id from users where email = '${email}'`;

            query.executeQuery(check_email_query)
                .then(emailData => {
                    if (emailData.length > 0)
                        common.resOnError(res, false, "Email has already exist")
                    else
                        query.executeQuery(add_trainee_query)
                            .then(userData => {
                                userData.userPass = password;
                                userData.affectedRows == 1 ?
                                    common.resOnSuccess(res, true, "Trainee has been added successfully", userData)
                                    :
                                    common.resOnError(res, false, "Unable to processes the add trainee request")
                            })
                            .catch(err => { common.resOnError(res, false, err) })
                })
                .catch(err => { common.resOnError(res, false, err) })
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Login Trainee
exports.loginTrainee = (req, res) => {
    const { email, password } = req.body;
    let login_query = `select * from users where email = '${email}'`;

    query.executeQuery(login_query)
        .then(userData => {
            if (userData.length > 0) {
                bcrypt.compare(password, userData[0].password)
                    .then((result) => {
                        if (result) {
                            var token = jwt.sign({ id: userData[0].id }, process.env.SECRET, {
                                expiresIn: 86400 // expires in 24 hours
                            });
                            userData[0].token = token;
                            common.resOnSuccess(res, true, "Logged in successfully", userData[0])
                        }
                        else {
                            common.resOnError(res, false, "Password is not correct")
                        }
                    });
            }
            else
                common.resOnError(res, false, "Email is not correct")
        })
        .catch(err => { common.resOnError(res, false, err) })
}

// API Forget Password Trainee
exports.forgetPassword = (req, res) => {
    let { email } = req.body;
    let code = common.generate_random_code();

    query.executeQuery(`UPDATE users SET verify_code = '${code}' WHERE email = '${email}'`)
        .then(queryResult => {
            if (queryResult.affectedRows == 1) {
                common.sendCodeInEmail(email, code)
                    .then(emailRes => {
                        res.status(200).json({ status: true, message: "Code has been send successfully", code });
                    })
                    .catch(err => common.resOnError(res, false, err))
            }
            else {
                res.status(200).json({ status: false, message: "Email is not correct" });
            }
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Update Password
exports.updatePassword = (req, res) => {
    const { id, new_password } = req.body;

    bcrypt.hash(new_password, 10)
        .then(hashedPassword => {
            let update_query = `update users set password = '${hashedPassword}', is_first_login = '1' where id= '${id}'`;

            query.executeQuery(update_query)
                .then(userData => {
                    userData.affectedRows == 1 ?
                        common.resOnSuccess(res, true, "Password has been updated successfully", userData)
                        :
                        common.resOnError(res, false, "Unable to update password")
                })
                .catch(err => { common.resOnError(res, false, err) })
        })
        .catch(err => common.resOnError(res, false, err))
}

// API Refresh Token
exports.refreshToken = (req, res) => {
    const { id } = req.body;
    let user_query = `select * from users where id = '${id}'`;

    query.executeQuery(user_query)
        .then(userData => {
            if (userData.length > 0) {
                var token = jwt.sign({ id: userData[0].id }, process.env.SECRET, { expiresIn: 86400 });
                userData[0].token = token;
                common.resOnSuccess(res, true, "Token refreshed successfully", userData[0])
            }
            else
                common.resOnError(res, false, "User not found id is not correct")
        })
        .catch(err => { common.resOnError(res, false, err) })
}

// API Validate Token
exports.validateToken = (req, res) => {
    common.resOnSuccess(res, true, "Token validate successfully")
}