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

//Update Password API 
router.post('/updatePassword', CommonMiddleware.authenticateToken, RegController.updatePassword);

//Refresh Token API 
router.post('/refreshToken', CommonMiddleware.pass, RegController.refreshToken);

//Validate Token API 
router.post('/validateToken', CommonMiddleware.authenticateToken, RegController.validateToken);

module.exports = router;