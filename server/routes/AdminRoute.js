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

// List All Members API 
router.post('/listAllMembers', CommonMiddleware.authenticateToken, adminController.listAllMembers);

// Member Profile Detail API 
router.post('/memberProfileDetails', CommonMiddleware.authenticateToken, adminController.memberProfileDetails);

// Pause Membership API 
router.post('/pauseMembership', CommonMiddleware.authenticateToken, adminController.pauseMembership);

// Delete User API 
router.post('/deleteUser', CommonMiddleware.authenticateToken, adminController.deleteUser);

// Update User API 
router.post('/updateUser', CommonMiddleware.authenticateToken, adminController.updateUser);

// Add User API 
router.post('/addUser', CommonMiddleware.authenticateToken, adminController.addUser);

// Exercise Plan API 
router.post('/exercisePlan', CommonMiddleware.authenticateToken, adminController.exercisePlan);

// List Booking API 
router.post('/listAllBooking', CommonMiddleware.authenticateToken, adminController.listAllBooking);

module.exports = router;