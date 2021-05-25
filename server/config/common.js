'use strict'
// Get dependencies
const requestUrl = require('request');
const nodemailer = require("nodemailer");
var moment = require("moment");
var config = require("../config/config.json")

// Queires Instance
var dbQueries = require('../database/query');
var query = new dbQueries.DB();

module.exports = {
    resOnSuccess(res, status, msg, data) {
        res.status(200).json({ success: status, message: msg, data: data });
    },
    resOnError(res, status, err) {
        console.log(err)
        res.status(200).json({ success: status, message: err });
    },
    generate_random_code() {
        return Math.floor(100000 + Math.random() * 900000)
    },
    _request(req, options) {
        return new Promise((resolved, reject) => {
            requestUrl(options, function (error, body) {
                if (error)
                    reject(error);
                else
                    resolved(body);
            })
        })
    },
    sendPushNotification(req, to, title, message, notificationType = "notification", data, badge = 0) {
        return new Promise((resolve, reject) => {
            let key = config.firebase.key
            var options = {
                method: 'POST',
                url: "https://fcm.googleapis.com/fcm/send",
                headers: { Authorization: key, 'content-type': 'application/json' },
                body: JSON.stringify({
                    to: to,
                    notification: { title: title, body: message, sound: "default", badge: badge, image: 'https://fleek-dev.s3.amazonaws.com/icon/fleek_icon.png' },
                    data: { type: notificationType, ...data }
                })
            };

            this._request(req, options)
                .then(reqResult => {
                    reqResult ? resolve(true) : reject(false);
                })
                .catch(err => console.log(err))
        })
    },
    getFcmToken(userId) {
        return new Promise((resolve, reject) => {
            let query_fcmToken = `SELECT fcmToken FROM users WHERE id = '${userId}'`;
            query.executeQuery(query_fcmToken)
                .then(resultToken => {
                    resolve(resultToken[0].fcmToken)
                })
                .catch(err => reject(err))
        })
    },
    sendCodeInEmail(toEmail, code) {
        var mailOptions = {
            from: config.nodeMailer.from,
            to: toEmail,
            subject: `Educo Gym Verification Code`,
            html: `
            <p>
                <b><i>Your verification code: ${code}</i></b>
            </p>
            <p>
                Enter the code above to reset your password. If you have any questions, feel free to contact us at <a href="mailto:contact@educogym.com">Contact Us</a>
            </p>
            <p>
                Thank you!<br/>
                Team Educo Gym<br/>
                <a href="https://educogym.com/">Educo GYm</a>
            </p>
            `
        };

        const transporter = nodemailer.createTransport({
            host: config.nodeMailer.host,
            auth: {
                user: config.nodeMailer.email,
                pass: config.nodeMailer.emailPass
            }
        })

        return new Promise((resolved, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolved(info.response);
                }
            });
        })
    },
    sendPasswordInEmail(toEmail, password) {
        var mailOptions = {
            from: config.nodeMailer.from,
            to: toEmail,
            subject: `Educo Gym Password`,
            html: `
            <p>
                <img src="https://educogym.s3-eu-west-1.amazonaws.com/email_images/email_image.png" />
            </p>
            <p>
                Welcome to Educogym Eccles Street! <br/>
                These are your login details: --------- <br/>
                <b><i>Your Password for Application : ${password}</i></b><br/>
                Use the app to book all of your workouts from now on and contact reception for assessment bookings.
            </p>
            <p>
                You have made a great decision! We are based on research that shows the mind and body are deeply connected and should be trained together for optimum results.<br/>
                The research was conducted by Dr. Tony Quinn and involved a full body transformation where participants lost 7.5lbs fat and gained 3lbs muscle in just 12 days. <br/>
                It was shown the key to these extraordinary results was learning to use a greater part of the mind that allowed the person to draw out their potential /perfect shape from within. <br/>
                We recommend using the two mp3 files Start a new life today and Relaxation with a purpose from Educohealth  in conjunction with the nutrition and training we will provide to achieve your very best results with us. <br/>
            </p>
            <p>
                Yours in health, <br/>
                Educogym Eccles Street<br/>
            </p>
            `
        };

        const transporter = nodemailer.createTransport({
            host: config.nodeMailer.host,
            auth: {
                user: config.nodeMailer.email,
                pass: config.nodeMailer.emailPass
            }
        })

        return new Promise((resolved, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolved(info.response);
                }
            });
        })
    },
}