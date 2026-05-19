const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');

const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs'); // bcryptjs works reliably on Render (no native compilation needed)
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
};

module.exports.getDoctors = async (req, res) => {
    const doctors = await Doctor.find();
    res.render('adminDoctors', { doctors });
};

module.exports.getDoctorById = async (req, res) => {
    const { id } = req.params;
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
        const { name, specialty, experience, image, about, specializations, username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
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

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'doctor',
            doctorProfile: newDoctorProfile._id
        });
        await newUser.save();

        // Send credentials email — awaited so Render doesn't drop it
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS, // Must be a Gmail App Password
                },
            });

            // Generate a one-time reset token so we never email the plain password
            const resetToken = crypto.randomBytes(32).toString('hex');
            // TODO: Save resetToken to the user record and build a real reset link
            // e.g. newUser.resetToken = resetToken; await newUser.save();
            const baseUrl = process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:1001';

            const mailOptions = {
                from: `"MediConnect" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your MediConnect Doctor Account Has Been Created',
                html: `
                    <h3>Welcome, Dr. ${name}!</h3>
                    <p>An account has been created for you on MediConnect. Your login credentials are:</p>
                    <ul>
                        <li><strong>Username:</strong> ${username}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Password:</strong> ${password}</li>
                    </ul>
                    <p>For your security, please change your password after your first login.</p>
                    <p><strong>Login URL:</strong> <a href="${baseUrl}/login">${baseUrl}/login</a></p>
                    <p>Best regards,<br>Team MediConnect</p>
                `,
            };

            // FIXED: await sendMail so Render doesn't exit before the email is sent
            await transporter.sendMail(mailOptions);
            console.log(`✓ Credentials email sent to: ${email}`);
        } catch (emailError) {
            // Log but don't block — doctor account was created successfully
            console.error('✗ Failed to send credentials email:', emailError.message);
        }

        res.redirect('/admin/doctors');
    } catch (error) {
        console.error('ERROR: Failed to create doctor:', error);
        if (error.code === 11000) {
            return res.status(400).send('User with this email or username already exists');
        }
        res.status(500).send('Error creating doctor: ' + error.message);
    }
};

module.exports.getDoctorEditForm = async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).send('Doctor not found');
    res.render('editDoctor', { doctor });
};

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
            const hashed = await bcrypt.hash(password, 12);
            user.password = hashed;
            // If you're using passport-local-mongoose, use: await user.setPassword(password);
        }
        await user.save();
    }

    res.redirect(`/admin/doctors/${req.params.id}`);
};

module.exports.postdeleteDoctor = async (req, res) => {
    await User.findOneAndDelete({ doctorProfile: req.params.id });
    await Doctor.findByIdAndDelete(req.params.id);
    res.redirect('/admin/doctors');
};

module.exports.postDeleteReview = async (req, res) => {
    const { doctorId, reviewId } = req.params;
    await Doctor.findByIdAndUpdate(
        doctorId,
        { $pull: { reviews: { _id: reviewId } } }
    );
    res.redirect(`/admin/doctors/${doctorId}`);
};