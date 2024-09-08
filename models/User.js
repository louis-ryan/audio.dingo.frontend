const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true,
    },
    credits: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);