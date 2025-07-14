const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const moment = require('moment');
const multer = require('multer');
const upload = multer({ dest: 'public/reports/' });

module.exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find({});
  res.render('home', { doctors });
};

module.exports.doctorDashboard = async (req, res) => {
  const doctor = await Doctor.findById(req.user.doctorProfile);
  const allAppointments = await Appointment.find({ doctor: doctor._id }).populate('patient');
  const now = moment();

  const upcoming = allAppointments.filter(app => app.status === 'accepted' && moment(app.date + ' ' + app.time).isAfter(now));
  const past = allAppointments.filter(app => app.status === 'accepted' && moment(app.date + ' ' + app.time).isBefore(now));
  const cancelled = allAppointments.filter(app => app.status === 'rejected');
  const pending = allAppointments.filter(app => app.status === 'pending');

  const tab = req.query.tab || 'upcoming';
  let appointments = tab === 'past' ? past : tab === 'cancelled' ? cancelled : tab === 'pending' ? pending : upcoming;

  res.render('doctorDashboard', { doctor, appointments, tab });
};

module.exports.showBookForm = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) 
    return res.status(404).send('Doctor not found');

  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const appointments = await Appointment.find({ doctor: doctor._id, date });

 const now = new Date();
const isToday = date === now.toISOString().slice(0, 10);
const currentTime = now.toTimeString().slice(0, 5);

const slotStatus = slots.map(time => {
  const occupied = appointments.some(app => app.time === time);
  const past = isToday && time <= currentTime;
  return {
    time,
    occupied: occupied || past
  };
});
  res.render('bookAppointment', { doctor, slotStatus, date ,today});
};

module.exports.postBookForm = async (req, res) => {
  if (!req.user) 
    return res.redirect('/login');

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) 
    return res.status(404).send('Doctor not found');

const reportPath = req.file ? '/reports/' + req.file.filename : null;

  await Appointment.create({
    doctor: doctor._id,
    patient: req.user._id,
    patientName: req.user.username || req.user.name,
    date: req.body.date,
    time: req.body.time,
    reason: req.body.reason,
     report: reportPath // Save the report path if uploaded
  });
  res.render('appointmentSuccess', { doctor });
};

module.exports.postReview = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) 
    return res.status(404).send('Doctor not found');

  doctor.reviews.push({
    username: req.user.username,
    rating: req.body.rating,
    comment: req.body.comment
  });

  await doctor.save();
  res.redirect(`/doctor/${doctor._id}`);
};

module.exports.getDoctorProfile = async (req, res) => {
  const doctor = await Doctor.findById(req.user.doctorProfile);
  if (!doctor) {
    req.flash('msg', 'Doctor profile not found.');
    return res.redirect('/doctor/dashboard');
  }

  const totalAppointments = await Appointment.countDocuments({ doctor: doctor._id });
  const patientsSeen = await Appointment.distinct('patient', { doctor: doctor._id, status: 'accepted' });
  const upcomingAppointments = await Appointment.countDocuments({
    doctor: doctor._id,
    status: 'accepted',
    date: { $gte: new Date() }
  });

  let reviews = [];
  try {
    const Review = require('../models/review'); // Optional, if using a separate Review model
    reviews = await Review.find({ doctor: doctor._id }).sort({ date: -1 }).limit(5);
  } catch (e) {}

  res.render('doctorProfile', {
    doctor,
    stats: {
      totalAppointments,
      patientsSeen: patientsSeen.length,
      upcomingAppointments
    },
    reviews
  });
};

module.exports.getAddDoctorForm = (req, res) => {
  res.render('addDoctor');
};

module.exports.postAddDoctorForm = async (req, res) => {
  const { name, specialty, experience, image, about, specializations, username, email, password } = req.body;

  const doctor = await Doctor.create({
    name,
    specialty,
    experience,
    image,
    about,
    specializations: specializations ? specializations.split(',').map(s => s.trim()) : []
  });

  await User.create({
    username,
    email,
    password,
    role: 'doctor',
    doctorProfile: doctor._id
  });

  res.redirect('/admin/dashboard');
};

module.exports.getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) 
    return res.status(404).send('Doctor not found');

  if (doctor.reviews && doctor.reviews.length) {
    doctor.reviews.forEach(review => {
      review.formattedDate = review.createdAt
        ? moment(review.createdAt).format('DD MMMM YYYY, h:mm A')
        : '';
    });
  }

  res.render('doctorDetail', { doctor });
};

module.exports.acceptAppointment = async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { status: 'accepted' });
  res.redirect('/doctor/dashboard');
};

module.exports.rejectAppointment = async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  res.redirect('/doctor/dashboard');
};

module.exports.enableVideoAppointment = async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { videoEnabled: true });
  res.redirect('/doctor/dashboard');
};
