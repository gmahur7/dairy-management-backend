const express=require('express');
const router=express.Router();
const {paymentDone,getVenderAllPayments,getVendorPaymentsDateTodate}=require('../Controllers/PaymentControllers')
const {protect}=require('../Middlewares/JWT')

router.route('/:id').post(protect,paymentDone)
router.post('/vender/done',protect,getVenderAllPayments)
router.post('/vender/datetodate',protect,getVendorPaymentsDateTodate)

module.exports=router;