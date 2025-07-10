const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Report = require('../models/report'); // You need to create this model
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const profileController = require('../controllers/profile');
const { isLoggedIn } = require('../middlewares/auth');




router.get('/', isLoggedIn, profileController.getProfile);

router.get('/patientAppointment', isLoggedIn,profileController.getPatientAppointments);


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