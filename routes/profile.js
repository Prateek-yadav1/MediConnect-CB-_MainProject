const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Report = require('../models/report'); // You need to create this model

function isLoggedIn(req, res, next) {
    if (req.user) return next();
    res.redirect('/login');
}

router.get('/', isLoggedIn, async (req, res) => {
    // Fetch previous appointments for this patient
    const appointments = await Appointment.find({ patient: req.user._id }).populate('doctor');
    // Fetch reports for this patient
    const reports = await Report.find({ patient: req.user._id });
    res.render('profile', { user: req.user, appointments, reports });
});

module.exports = router;