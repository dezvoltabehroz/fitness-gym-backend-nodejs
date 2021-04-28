'use strict'
// Get dependencies
const express = require('express');
const router = express.Router();
const util = require("util");

//Image Uploader
// const { uploadProfilePicture } = require("../services")

//Middleware - Registration
var CommonMiddleware = require('../middleware/CommonMiddle');

//Controller - Registration
var adminController = require('../controller/AdminController');

//Health API 
router.get('/health', CommonMiddleware.pass, adminController.pass);

// Login Admin API 
router.post('/loginAdmin', CommonMiddleware.pass, adminController.loginAdmin);

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

// List All Schedules API 
router.post('/listAllSchedules', CommonMiddleware.authenticateToken, adminController.listAllSchedules);

// Delete Schedules API 
router.post('/deleteSchedules', CommonMiddleware.authenticateToken, adminController.deleteSchedules);

// Add Schedules API 
router.post('/addSchedules', CommonMiddleware.authenticateToken, adminController.addSchedules);

// Edit Schedules API 
router.post('/editSchedules', CommonMiddleware.authenticateToken, adminController.editSchedules);

// Block Slots API 
router.post('/blockSlots', CommonMiddleware.authenticateToken, adminController.blockSlots);

// List All Customer API 
router.post('/listAllCustomer', CommonMiddleware.authenticateToken, adminController.listAllCustomer);

// Make Booking for User API 
router.post('/makeBookingForUser', CommonMiddleware.authenticateToken, adminController.makeBookingForUser);

// Un Block Slots API 
router.post('/unBlockSlots', CommonMiddleware.authenticateToken, adminController.unBlockSlots);

//Upload Picture API 
// router.post('/uploadPicture', util.promisify(uploadProfilePicture.single("image")), CommonMiddleware.authenticateToken, adminController.uploadPicture);

// Pending Pause List API 
router.post('/pendingPauseList', CommonMiddleware.authenticateToken, adminController.pendingPauseList);

// Accept Pending Pause Request API 
router.post('/acceptPendingRequest', CommonMiddleware.authenticateToken, adminController.acceptPendingRequest);

// Cancel Pending Pause Request API 
router.post('/cancelPendingRequest', CommonMiddleware.authenticateToken, adminController.cancelPendingRequest);

module.exports = router;