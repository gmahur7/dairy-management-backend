const Admin = require('../Database/Admin')
const otpGenerator = require('otp-generator')
const asyncHandler = require('express-async-handler')
const { generateToken } = require('../Middlewares/JWT')
const sendOTPEmail = require('../Nodemailer')

const adminLogin = asyncHandler(async (req, resp) => {
    const { Id, Password } = req.body
    try {
        if (!Id || !Password) {
            throw new Error("Please Fill All The Fields")
        }
        else {
            const admin = await Admin.findOne({ Id })
            if (admin && (await admin.matchPassword(Password))) {
                resp.status(200).json({
                    Id: admin.id,
                    token: await generateToken(admin._id)
                })
            }
            else {
                throw new Error("Invalid Id or Password")
            }
        }
    } catch (error) {
        resp.status(400).send({ msg: error.message })
    }
})

const registerAdmin = asyncHandler(async (req, resp) => {
    const { Id, Password } = req.body
    try {
        const admin = await Admin.create({ Id, Password })
        if (admin) {
            resp.status(201).json({
                _id: admin._id,
                Id: admin.Id,
                token: await generateToken(admin._id)
            })
        }
        else {
            resp.status(400)
            throw new Error("Failed To Register the user")
        }
    } catch (error) {
        resp.status(500).send({ msg: "Server Error" });
    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { Id, Password } = req.body;
    try {
        if (!Id || !Password) {
            throw new Error('Please provide both id and new password');
        }
        const admin = await Admin.findOne({ Id });
        if (!admin) {
            throw new Error('Admin not found');
        }
        admin.Password = Password;
        await admin.save();
        res.status(200).json({ msg: 'Password Changed' });
    } catch (error) {
        console.log(error)
        res.status(400).json({ msg: error.message });
    }
});

const verifyOTP = asyncHandler(async (req, res) => {
    const { Id, OTP } = req.body;
    try {
        if (!Id || !OTP) {
            throw new Error('Please provide both id and otp');
        }
        const admin = await Admin.findOne({ Id });
        if (!admin) {
            throw new Error('Admin not found');
        }
        if (admin.OTP !== OTP) {
            throw new Error('Invalid OTP');
        }
        await Admin.updateOne(
            { _id: admin._id },
            { $unset: { OTP: "", OTPVerified: "" } }
        );
        res.status(200).json({ msg: 'OTP verified successfully' });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
});

const generateOTP = asyncHandler(async (req, res) => {
    const { Email, Id } = req.body;
    try {
        if (!Email) {
            throw new Error('Please provide the email');
        }
        if (!Id) {
            throw new Error('Please provide the Id');
        }
        const admin = await Admin.findOne({ Email, Id });
        if (!admin) {
            throw new Error('Admin not found');
        }
        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        admin.OTP = OTP;
        await admin.save();
        await sendOTPEmail(Email, OTP);
        setTimeout(async () => {
            await Admin.updateOne(
                { _id: admin._id },
                { $unset: { OTP: "", OTPVerified: "" } }
            );
        }, 300000)
        res.status(200).json({ msg: 'OTP sent to your email successfully' });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
});


module.exports = {
    adminLogin,
    registerAdmin,
    changePassword,
    verifyOTP,
    generateOTP
}