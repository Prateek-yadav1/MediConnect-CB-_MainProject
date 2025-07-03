const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    date: String,
    fileUrl: String
});
module.exports = mongoose.model('Report', reportSchema);