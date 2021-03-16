'use strict'
// Get dependencies
const express = require('express');
const router = express.Router();
const util = require("util");

//Middleware - Registration
var CommonMiddleware = require('../middleware/CommonMiddle');

//Controller - Registration
var ProfileController = require('../controller/ProfileController');

//Health API 
router.get('/health', CommonMiddleware.pass, ProfileController.pass);

//About Us API 
router.get('/aboutUs', CommonMiddleware.authenticateToken, ProfileController.aboutUs);

// Get Profile Detail API 
router.post('/getProfileDetail', CommonMiddleware.authenticateToken, ProfileController.getProfileDetail);

// Change Profile Detail API 
router.post('/changeProfileDetail', CommonMiddleware.authenticateToken, ProfileController.changeProfileDetail);

// Get Membership Details API 
router.post('/getMembershipDetail', CommonMiddleware.authenticateToken, ProfileController.getMembershipDetail);

// Get Pause List API 
router.post('/getPauseList', CommonMiddleware.authenticateToken, ProfileController.getPauseList);

// Request Pause Membership API 
router.post('/requestPauseMembership', CommonMiddleware.authenticateToken, ProfileController.requestPauseMembership);

// Cancel Request Pause Membership API 
router.post('/cancelRequestPauseMembership', CommonMiddleware.authenticateToken, ProfileController.cancelRequestPauseMembership);

// List All Booking API 
router.post('/listAllBookings', CommonMiddleware.authenticateToken, ProfileController.listAllBookings);

module.exports = router;