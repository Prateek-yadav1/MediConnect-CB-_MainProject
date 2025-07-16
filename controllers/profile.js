const Appointment = require('../models/appointment');
const Report = require('../models/report'); // You need to create this model


module.exports.getProfile = async (req, res) => {
   //previous appointments and reports
    const appointments = await Appointment.find({ patient: req.user._id }).populate('doctor');
const reports = await Report.find({ patient: req.user._id });
    
    res.render('profile', { user: req.user, appointments,reports: req.user.reports || []});
}

module.exports.getPatientAppointments =  async (req, res) => {
   //previous appointments
const appointments = await Appointment.find({ patient: req.user._id }).populate('doctor');
    
    res.render('patientAppointment', { user: req.user, appointments});
}