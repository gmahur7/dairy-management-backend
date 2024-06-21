const mongoose=require('mongoose')

const perDayMilkEntrySchema=new mongoose.Schema({
    MilkDetails:[{ type: mongoose.Schema.Types.ObjectId, ref: 'MilkEntry' }],
    Date:String,
    TotalAmount:Number,
    TotalQuantity:Number,
    Shift:String
})

const DayMilkEntry=mongoose.model('DayMilkEntry',perDayMilkEntrySchema)

module.exports = DayMilkEntry;