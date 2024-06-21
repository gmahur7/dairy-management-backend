const mongoose = require('mongoose')

const VenderSchema=new mongoose.Schema({
    Name:String,
    Rate:String,
    FatPass:String,
    MilkDetail:[{ type: mongoose.Schema.Types.ObjectId, ref: 'MilkEntry' }],
    Payments:[{ type: mongoose.Schema.Types.ObjectId, ref: 'PaymentDetail' }],
},{
    timestamps:true
})

const Vender=mongoose.model('VenderDetail',VenderSchema)
module.exports=Vender