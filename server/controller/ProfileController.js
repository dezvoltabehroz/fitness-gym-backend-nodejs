'use strict'

//Helper
var profileHelper = require('../helper/ProfileHelper');

//Pass Controller
exports.pass = (req, res) => { return profileHelper.health(req, res) }

//About Us Controller
exports.aboutUs = (req, res) => { return profileHelper.aboutUs(req, res) }

//Get Profile Detail Controller
exports.getProfileDetail = (req, res) => { return profileHelper.getProfileDetail(req, res) }