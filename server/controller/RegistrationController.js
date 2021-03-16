'use strict'

//Helper
var regUser = require('../helper/RegistrationHelper');

//Pass Controller
exports.pass = (req, res) => { return regUser.health(req, res) }

//Add Trainee Controller
exports.addTrainee = (req, res) => { return regUser.addTrainee(req, res) }

//Login Trainee Controller
exports.loginTrainee = (req, res) => { return regUser.loginTrainee(req, res) }

//Forget Password Trainee Controller
exports.forgetPassword = (req, res) => { return regUser.forgetPassword(req, res) }

//Verify Code For Reset Pass Trainee API 
exports.verifyCodeForResetPass = (req, res) => { return regUser.verifyCodeForResetPass(req, res) }

//Update Password Controller
exports.updatePassword = (req, res) => { return regUser.updatePassword(req, res) }

//Change Password on Login Controller
exports.changePasswordOnLogin = (req, res) => { return regUser.changePasswordOnLogin(req, res) }

//Change Password Controller
exports.changePassword = (req, res) => { return regUser.changePassword(req, res) }

//Refresh Token Controller
exports.refreshToken = (req, res) => { return regUser.refreshToken(req, res) }

//Validate Token Controller
exports.validateToken = (req, res) => { return regUser.validateToken(req, res) }