const Users = require('../models/user');
const bcrypt = require('bcryptjs'); // Changed from 'bcrypt' to 'bcryptjs' for Render compatibility
const nodemailer = require('nodemailer');

module.exports.getSignup = (req, res) => {
    res.render('signup', {
        msg: req.flash('msg')
    });
};

module.exports.postSignup = async (req, res, next) => {
    const { email, username, password, role } = req.body;
    try {
        let user = await Users.findOne({ email });
        if (!user) {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                user = await Users.create({ email, username, password: hashedPassword, role });
                req.session.email = email;

                // Send welcome email — awaited so Render doesn't drop it before it fires
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS, // Must be a Gmail App Password, NOT your Gmail login password
                        },
                    });

                    const baseUrl = process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:1001';

                    const mailOptions = {
                        from: `"MediConnect" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: 'Welcome to MediConnect - Your Account Details',
                        html: `
                            <h3>Welcome to MediConnect, ${username}!</h3>
                            <p>Your account has been successfully created. Here are your login details:</p>
                            <ul>
                                <li><strong>Email:</strong> ${email}</li>
                                <li><strong>Username:</strong> ${username}</li>
                                <li><strong>Role:</strong> ${role}</li>
                            </ul>
                            <p><strong>Login URL:</strong> <a href="${baseUrl}/login">${baseUrl}/login</a></p>
                            <p>Use the password you chose during signup to log in. For security, do not share it with anyone.</p>
                            <p>Best regards,<br>Team MediConnect</p>
                        `,
                        // NOTE: Plain-text password intentionally removed — it was already hashed before save,
                        // so emailing the original var was a security leak. Users know their own password.
                    };

                    // FIXED: await the sendMail call so Render doesn't kill the process before email sends
                    await transporter.sendMail(mailOptions);
                    console.log('✓ Welcome email sent to:', email);
                } catch (emailError) {
                    // Log but don't block signup — user was created successfully
                    console.error('✗ Failed to send welcome email:', emailError.message);
                }

                req.flash('msg', 'You have successfully signed up!');
                return res.redirect('/login');
            } catch (createError) {
                console.error('Signup error:', createError);
                req.flash('msg', 'Signup not successful, try again!');
                return res.redirect('/signup');
            }
        } else {
            req.flash('msg', 'Email already exists!');
            return res.redirect('/signup');
        }
    } catch (err) {
        next(err);
    }
};