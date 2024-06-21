const express=require('express')
const router=express.Router()
const {oneDayDetail,lastdaysTotalData,fromdatetodate}=require('../Controllers/PerdayMilkEntryControllers')
const {protect} =require('../Middlewares/JWT')
router.route('/').post(protect,oneDayDetail)
router.post('/lastdaysdata',protect,lastdaysTotalData)
router.post('/fromdatetodate',protect,fromdatetodate)

module.exports=router;