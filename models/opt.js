import mongoose from "mongoose";

const optSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    }
})

const OTP = mongoose.model("OTP", optSchema)

export default OTP