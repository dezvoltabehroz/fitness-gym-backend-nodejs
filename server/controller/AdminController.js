'use strict'

//Helper
var adminHelper = require('../helper/AdminHelper');

//Pass Controller
exports.pass = (req, res) => { return adminHelper.health(req, res) }

//User Profile Controller
exports.userProfile = (req, res) => { return adminHelper.userProfile(req, res) }

//Analytics Controller
exports.analytics = (req, res) => { return adminHelper.analytics(req, res) }