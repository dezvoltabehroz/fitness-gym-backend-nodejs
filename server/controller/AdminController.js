'use strict'

//Helper
var adminHelper = require('../helper/AdminHelper');

//Pass Controller
exports.pass = (req, res) => { return adminHelper.health(req, res) }

//User Profile Controller
exports.userProfile = (req, res) => { return adminHelper.userProfile(req, res) }

//Analytics Controller
exports.analytics = (req, res) => { return adminHelper.analytics(req, res) }

//List All Members Controller
exports.listAllMembers = (req, res) => { return adminHelper.listAllMembers(req, res) }

//Member Profile Detail Controller
exports.memberProfileDetails = (req, res) => { return adminHelper.memberProfileDetails(req, res) }

//Pause Membership Controller
exports.pauseMembership = (req, res) => { return adminHelper.pauseMembership(req, res) }

//Delete User Controller
exports.deleteUser = (req, res) => { return adminHelper.deleteUser(req, res) }

//Update User Controller
exports.updateUser = (req, res) => { return adminHelper.updateUser(req, res) }

//Add User Controller
exports.addUser = (req, res) => { return adminHelper.addUser(req, res) }

//Exercise Plan Controller
exports.exercisePlan = (req, res) => { return adminHelper.exercisePlan(req, res) }

//List All Booking Controller
exports.listAllBooking = (req, res) => { return adminHelper.listAllBooking(req, res) }

//List All Schedules Controller
exports.listAllSchedules = (req, res) => { return adminHelper.listAllSchedules(req, res) }

//Delete Schedules Controller
exports.deleteSchedules = (req, res) => { return adminHelper.deleteSchedules(req, res) }