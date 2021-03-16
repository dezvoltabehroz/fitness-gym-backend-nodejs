'use strict'
// Get dependencies
const express = require('express');
const router = express.Router();
const util = require("util");

//Middleware - Registration
var CommonMiddleware = require('../middleware/CommonMiddle');

//Controller - Registration
var RegController = require('../controller/RegistrationController');

//Health API 
router.get('/health', CommonMiddleware.pass, RegController.pass);

//Add Trainee API 
router.post('/addTrainee', CommonMiddleware.pass, RegController.addTrainee);

//Login Trainee API 
router.post('/loginTrainee', CommonMiddleware.pass, RegController.loginTrainee);

//Forget Password Trainee API 
router.post('/forgetPassword', CommonMiddleware.pass, RegController.forgetPassword);

//Verify Code For Reset Pass Trainee API 
router.post('/verifyCodeForResetPass', CommonMiddleware.pass, RegController.verifyCodeForResetPass);

//Update Password API 
router.post('/updatePassword', CommonMiddleware.pass, RegController.updatePassword);

//Change Password API 
router.post('/changePassword', CommonMiddleware.authenticateToken, RegController.changePassword);

//Refresh Token API 
router.post('/refreshToken', CommonMiddleware.pass, RegController.refreshToken);

//Validate Token API 
router.post('/validateToken', CommonMiddleware.authenticateToken, RegController.validateToken);

module.exports = router;