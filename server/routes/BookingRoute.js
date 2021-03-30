'use strict'
// Get dependencies
const express = require('express');
const router = express.Router();
const util = require("util");

//Middleware - Registration
var CommonMiddleware = require('../middleware/CommonMiddle');

//Controller - Registration
var bookingController = require('../controller/BookingController');

//Health API 
router.get('/health', CommonMiddleware.pass, bookingController.pass);

// Get All Booking By Date And Time API 
router.post('/getBookings', CommonMiddleware.authenticateToken, bookingController.getBookings);

// Book a slot API 
router.post('/bookSlot', CommonMiddleware.authenticateToken, bookingController.bookSlot);

module.exports = router;