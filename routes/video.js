const express = require('express');
const router = express.Router();

const Appointment = require('../models/appointment');


router.get('/appointment/:id', async (req, res) => {
    res.render('videoRoom', { appointmentId: req.params.id, user: req.user });
});

router.post('/appointment/:id/end', async (req, res) => {
    await Appointment.findByIdAndUpdate(req.params.id, { videoEnabled: false });
    res.json({ success: true });
});
router.get('/appointment/:id/status', async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    res.json({ videoEnabled: appointment.videoEnabled });
});
module.exports = router;