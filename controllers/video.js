const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video');
const Appointment = require('../models/appointment');

module.exports.getAppointmentVideo = async (req, res) => {
    const appointment = await Appointment.findById(req.params.id).populate('patient').populate('doctor');
    res.render('videoRoom', { 
    appointmentId: req.params.id, 
        user: req.user, 
        patientId: appointment.patient._id,
        patientName: appointment.patient.username,
        doctorName: appointment.doctor.name
    });
}

module.exports.endVideoAppointment = async (req, res) => {
    await Appointment.findByIdAndUpdate(req.params.id, { videoEnabled: false });
    res.json({ success: true });
}

module.exports.getVideoStatus =  async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    res.json({ videoEnabled: appointment.videoEnabled });
}