'use strict'

//Helper
var regHelper = require('../helper/RegistrationHelper');

//Pass Controller
exports.pass = (req, res) => { return regHelper.health(req, res) }

//Add Trainee Controller
exports.addTrainee = (req, res) => { return regHelper.addTrainee(req, res) }

//Login Trainee Controller
exports.loginTrainee = (req, res) => { return regHelper.loginTrainee(req, res) }

//Forget Password Trainee Controller
exports.forgetPassword = (req, res) => { return regHelper.forgetPassword(req, res) }

//Verify Code For Reset Pass Trainee API 
exports.verifyCodeForResetPass = (req, res) => { return regHelper.verifyCodeForResetPass(req, res) }

//Update Password Controller
exports.updatePassword = (req, res) => { return regHelper.updatePassword(req, res) }

//Change Password on Login Controller
exports.changePasswordOnLogin = (req, res) => { return regHelper.changePasswordOnLogin(req, res) }

//Change Password Controller
exports.changePassword = (req, res) => { return regHelper.changePassword(req, res) }

//Refresh Token Controller
exports.refreshToken = (req, res) => { return regHelper.refreshToken(req, res) }

//Validate Token Controller
exports.validateToken = (req, res) => { return regHelper.validateToken(req, res) }