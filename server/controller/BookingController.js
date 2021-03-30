'use strict'

//Helper
var bookingHelper = require('../helper/BookingHelper');

//Pass Controller
exports.pass = (req, res) => { return bookingHelper.health(req, res) }

//Get All Booking By Date And Time Controller
exports.getBookings = (req, res) => { return bookingHelper.getBookings(req, res) }

//Book Slot Controller
exports.bookSlot = (req, res) => { return bookingHelper.bookSlot(req, res) }

//Un Book Slot Controller
exports.unBookSlot = (req, res) => { return bookingHelper.unBookSlot(req, res) }