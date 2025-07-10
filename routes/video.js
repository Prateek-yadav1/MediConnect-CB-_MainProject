const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video');
const Appointment = require('../models/appointment');


router.get('/appointment/:id', videoController.getAppointmentVideo);

router.post('/appointment/:id/end', videoController.endVideoAppointment);

router.get('/appointment/:id/status', videoController.getVideoStatus);
module.exports = router;