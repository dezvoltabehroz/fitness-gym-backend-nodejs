
// Get our API routes
const reg_api = require('./RegistrationRoute');
const profile_api = require('./ProfileRoute');
const booking_api = require('./BookingRoute');
const admin_api = require('./AdminRoute');

module.exports = {
    reg_api: reg_api,
    profile_api: profile_api,
    booking_api: booking_api,
    admin_api: admin_api,
};