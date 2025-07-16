const mongoose = require("mongoose");


const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
        trim: true,
    },
    otp_expires: {
        type: Date,
        required: true,
        trim: true,
    },
}
, {
    timestamps: true,
});

module.exports = mongoose.model("otp", otpSchema);