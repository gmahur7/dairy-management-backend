const mongoose = require('mongoose')

const milkEntrySchema = new mongoose.Schema({
    Vender: { type: mongoose.Schema.Types.ObjectId, ref: 'VenderDetail' },
    DateDetail: String,
    Fat: Number,
    Quantity: Number,
    NetAmount:Number,
    Shift:String,
    Rate:Number,
    FatPass:Number,
    Payment:String
},{
    timestamps: true
})

const MilkEntry = mongoose.model('MilkEntry', milkEntrySchema)
module.exports = MilkEntry