const express=require('express')
const router=express.Router()
const {adminLogin,registerAdmin,generateOTP,verifyOTP,changePassword}=require('../Controllers/AdminContollers')
router.route('/').post(adminLogin)
router.post('/register',registerAdmin)
router.post('/verify',generateOTP)
router.post('/verify/otp',verifyOTP)
router.post('/change/password',changePassword)

module.exports=router