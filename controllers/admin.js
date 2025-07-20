const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');

const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');   
const mongoose = require('mongoose');

require('dotenv').config();

module.exports.getDashboard = async (req, res) => {
  const doctorCount = await Doctor.countDocuments();
  const patientCount = await User.countDocuments({ role: 'patient' });
  const appointmentCount = await Appointment.countDocuments();
  res.render('Admin', {
    stats: { doctorCount, patientCount, appointmentCount }
  });
}

module.exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find();
  res.render('adminDoctors', { doctors });
}

module.exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  console.log('Doctor ID param:', id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid Doctor ID');
  }

  const doctor = await Doctor.findById(id);
  if (!doctor) return res.status(404).send('Doctor not found');
  
  res.render('adminDoctorDetail', { doctor });
};

module.exports.getAddDoctorForm = (req, res) => {
  res.render('addDoctor');
};

module.exports.postAddDoctorForm = async (req, res) => {
  try {
    console.log('Starting doctor creation process...');
    
    const { name, specialty, experience, image, about, specializations, username, email, password } = req.body;
    console.log('Doctor email:', email);

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log('User with this email already exists');
      return res.status(400).send('User with this email already exists');
    }

    const newDoctorProfile = new Doctor({
      name,
      specialty,
      experience,
      image,
      about,
      specializations: specializations ? specializations.split(',').map(s => s.trim()) : []
    });
    
    await newDoctorProfile.save();
    console.log('Doctor profile saved with ID:', newDoctorProfile._id);

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Store the hashed password
      role: 'doctor',
      doctorProfile: newDoctorProfile._id
    });

    await newUser.save();
    console.log('User created successfully with ID:', newUser._id);

    console.log('Configuring email transporter...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
    }

    // send email
    console.log('Sending email to:', email);
    const mailOptions = {
      from: `"MediConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Account Credentials for MediConnect',
      html: `
        <h3>Welcome, Dr. ${name}!</h3>
        <p>An account has been created for you on our platform. You can log in with these credentials:</p>
        <ul>
          <li><strong>Username:</strong> ${username}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>For your security, you will be required to change this password after your first login.</p>
        <p><strong>Login URL:</strong> http://localhost:1001/login</p>
        <p>Best regards,<br>Team MediConnect</p>
      `,
    };

    try {
      const emailResult = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', emailResult.messageId);
    } catch (emailError) {
      console.error('Failed to send email, but doctor was created:', emailError.message);
    }

    console.log(`SUCCESS: Doctor ${name} created with ID ${newDoctorProfile._id}`);
    res.redirect('/admin/doctors');

  } catch (error) {
    console.error('ERROR: Failed to create doctor:', error);
    
    if (error.code === 11000) {
      console.error('Duplicate key error - user already exists');
      return res.status(400).send('User with this email or username already exists');
    }
    
    res.status(500).send('Error creating doctor: ' + error.message);
  }
};
module.exports.getDoctorEditForm = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) 
    return res.status(404).send('Doctor not found');
  res.render('editDoctor', { doctor });
}

module.exports.postDoctorEditForm = async (req, res) => {
  const { name, specialty, experience, image, about, specializations, username, email, password } = req.body;
  
  await Doctor.findByIdAndUpdate(req.params.id, {
    name,
    specialty,
    experience,
    image,
    about,
    specializations: specializations ? specializations.split(',').map(s => s.trim()) : [],
    email
  });

  const user = await User.findOne({ doctorProfile: req.params.id });
  if (user) {
    user.username = username;
    user.email = email;
    if (password) {
      await user.setPassword(password);
    }
    await user.save();
  }

  res.redirect(`/admin/doctors/${req.params.id}`);
}

module.exports.postdeleteDoctor = async (req, res) => {
  await User.findOneAndDelete({ doctorProfile: req.params.id });
  await Doctor.findByIdAndDelete(req.params.id);
  res.redirect('/admin/doctors');
}

module.exports.postDeleteReview = async (req, res) => {
  const { doctorId, reviewId } = req.params;
  await Doctor.findByIdAndUpdate(
    doctorId,
    { $pull: { reviews: { _id: reviewId } } }
  );
  res.redirect(`/admin/doctors/${doctorId}`);
}
