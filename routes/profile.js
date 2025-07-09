const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Report = require('../models/report'); // You need to create this model
const multer = require('multer');
const path = require('path');
const User = require('../models/user');


function isLoggedIn(req, res, next) {
    if (req.user) return next();
    res.redirect('/login');
}

router.get('/', isLoggedIn, async (req, res) => {
   //previous appointments and reports
    const appointments = await Appointment.find({ patient: req.user._id }).populate('doctor');
    const reports = await Report.find({ patient: req.user._id });
    
    res.render('profile', { user: req.user, appointments,reports: req.user.reports || []});
});

router.get('/patientAppointment', isLoggedIn, async (req, res) => {
   //previous appointments and reports
    const appointments = await Appointment.find({ patient: req.user._id }).populate('doctor');
    
    res.render('patientAppointment', { user: req.user, appointments});
});


// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/reports/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Upload report route
router.post('/upload-report', upload.single('reportFile'), async (req, res) => {
  const { title, date } = req.body;
  const fileUrl = '/reports/' + req.file.filename;

  // Save report info to user's reports array
  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      reports: { title, date, fileUrl }
    }
  });
  res.redirect('/profile');
});

router.post('/delete-report', async (req, res) => {
    const { fileUrl } = req.body;
    // Remove from user's reports array
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { reports: { fileUrl } }
    });
    // Optionally, delete the file from disk
    const filePath = path.join(__dirname, '../public', fileUrl);
    fs.unlink(filePath, (err) => {
        // Ignore error if file doesn't exist
        res.redirect('/profile');
    });
});
module.exports = router;