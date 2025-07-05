const Doctor = require('../models/doctor');
const moment = require('moment');
const Appointment = require('../models/appointment');

module.exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find({});
  res.render('home', { doctors }); 
};


exports.doctorDashboard = async (req, res) => {
    const doctor = await Doctor.findById(req.user.doctorProfile);
    const allAppointments = await Appointment.find({ doctor: doctor._id }).populate('patient');
    const now = moment();

    // Filter by status and time
    const upcoming = allAppointments.filter(app =>
        app.status === 'accepted' && moment(app.date + ' ' + app.time).isAfter(now)
    );
    const past = allAppointments.filter(app =>
        app.status === 'accepted' && moment(app.date + ' ' + app.time).isBefore(now)
    );
    const cancelled = allAppointments.filter(app =>
        app.status === 'rejected'
    );
    const pending = allAppointments.filter(app =>
        app.status === 'pending'
    );

    // Determine which tab is active
    const tab = req.query.tab || 'upcoming';
    let appointments;

    if (tab === 'past')
         appointments = past;
    else if (tab === 'cancelled') 
        appointments = cancelled;
    else if (tab === 'pending') 
        appointments = pending;
    else 
    appointments = upcoming;

    res.render('doctorDashboard', {
        doctor,
        appointments,
        tab
    });
};

exports.showBookForm = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) 
    return res.status(404).send('Doctor not found');

  const slots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"
  ];

  const date = req.query.date || new Date().toISOString().slice(0,10);
  //retriving all appointments for the doctor on the selected date
  const appointments = await Appointment.find({ doctor: doctor._id, date });

  // Mark slots as occupied/free
  //Returns an array of objects
  const slotStatus = slots.map(time => ({
    time,
    occupied: appointments.some(app => app.time === time)
  }));

  res.render('bookAppointment', { doctor, slotStatus, date });
};