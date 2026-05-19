const Users=require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

module.exports.getSignup = (req,res)=>{
    res.render('signup',{
        msg:req.flash('msg')
    });
}


module.exports.postSignup = async (req, res, next) => {
    const { email, username, password, role } = req.body;
    try {
        let user = await Users.findOne({ email });
        if (!user) {
            try {
                const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
                user = await Users.create({ email, username, password: hashedPassword, role });
                req.session.email = email;
                
                // Send email with credentials
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                try {
                    console.log('===== EMAIL SENDING DEBUG =====');
                    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✓' : 'NOT SET ✗');
                    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set ✓' : 'NOT SET ✗');
                    console.log('Recipient email:', email);
                    
                    // Verify transporter connection
                    await transporter.verify();
                    console.log('✓ Email transporter verified successfully');
                    
                    const mailOptions = {
                        from: `"MediConnect" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: 'Welcome to MediConnect - Your Account Credentials',
                        html: `
                            <h3>Welcome to MediConnect, ${username}!</h3>
                            <p>Your account has been successfully created. Here are your login credentials:</p>
                            <ul>
                                <li><strong>Email:</strong> ${email}</li>
                                <li><strong>Username:</strong> ${username}</li>
                                <li><strong>Password:</strong> ${password}</li>
                                <li><strong>Role:</strong> ${role}</li>
                            </ul>
                            <p><strong>Login URL:</strong> http://localhost:1001/login</p>
                            <p>For your security, please keep your credentials safe and do not share them with anyone.</p>
                            <p>Best regards,<br>Team MediConnect</p>
                        `,
                    };
                    
                    console.log('Attempting to send email...');
                    const result = await transporter.sendMail(mailOptions);
                    console.log('✓ Email sent successfully!');
                    console.log('Message ID:', result.messageId);
                    console.log('===== END DEBUG =====');
                } catch (emailError) {
                    console.error('===== EMAIL ERROR =====');
                    console.error('✗ Failed to send email');
                    console.error('Error Code:', emailError.code);
                    console.error('Error Message:', emailError.message);
                    console.error('Full Error:', emailError);
                    console.error('===== END ERROR =====');
                    // Continue signup even if email fails
                }
                
                req.flash('msg', 'You have successfully signed up. Check your email for credentials.');
                return res.redirect('/login');
            } catch {
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
}