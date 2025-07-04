// routes/video.js
const express = require('express');
const router = express.Router();

const Appointment = require('../models/appointment');


router.get('/appointment/:id', async (req, res) => {
    // Optionally check if user is doctor or patient of this appointment
    res.render('videoRoom', { appointmentId: req.params.id, user: req.user });
});

// Doctor ends call: disable videoEnabled
router.post('/appointment/:id/end', async (req, res) => {
    await Appointment.findByIdAndUpdate(req.params.id, { videoEnabled: false });
    res.json({ success: true });
});

module.exports = router;