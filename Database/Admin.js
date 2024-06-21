const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    Id: String,
    Password: String,
    Email: String,
    OTP: String,
    OTPVerified: { type: Boolean },
}, {
    timestamps: true
});

adminSchema.methods.matchPassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.Password);
};

adminSchema.pre("save", async function (next) {
    if (!this.isModified) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
});

module.exports = mongoose.model('Admin', adminSchema);


