'use strict'
// Get dependencies
const express = require('express');
const router = express.Router();
const util = require("util");

//Middleware - Registration
var CommonMiddleware = require('../middleware/CommonMiddle');

//Controller - Registration
var adminController = require('../controller/AdminController');

//Health API 
router.get('/health', CommonMiddleware.pass, adminController.pass);

//User Profile API 
router.post('/userProfile', CommonMiddleware.authenticateToken, adminController.userProfile);

// Analytics API 
router.post('/analytics', CommonMiddleware.authenticateToken, adminController.analytics);

module.exports = router;