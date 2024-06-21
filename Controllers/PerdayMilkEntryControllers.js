const asyncHandler = require("express-async-handler");
const moment = require('moment')
const DayMilkEntry = require("../Database/PerDayMilkEntry");
const MilkEntry = require("../Database/MilkEntry");

const oneDayDetail = asyncHandler(async (req, resp) => {
    let { date } = req.body
    try {
        let data = await DayMilkEntry.find({ Date: date }).populate('MilkDetails')
        if (!data) throw "No Data Found"
        // else if (data.length==1){
        //     data[0].MilkDetails = await Promise.all(data[0].MilkDetails.map(async (item) => {
        //         return await MilkEntry.findById(item._id).populate('Vender');
        //     }));
        //     resp.send(data[0])
        // } 
        else {
            let obj = {
                TotalAmount: 0,
                TotalQuantity: 0,
                Date: data[0].Date,
                MilkDetails: []
            }
            data.forEach((item) => {
                obj.TotalAmount += item.TotalAmount
                obj.TotalQuantity += item.TotalQuantity
                obj.MilkDetails = [...obj.MilkDetails, ...item.MilkDetails]
            })

            obj.MilkDetails = await Promise.all(obj.MilkDetails.map(async (item) => {
                return await MilkEntry.findById(item._id).populate('Vender');
            }));

            resp.status(200).send(obj)
        }
    } catch (error) {
        resp.status(500).send({ msg: error.message })
    }
})

const lastdaysTotalData = asyncHandler(async (req, resp) => {
    let { days } = req.body
    try {
        const daysAgo = moment().subtract(days, 'days').format('YYYY-MM-DD');
        let data = await DayMilkEntry.find({ Date: { $gte: daysAgo } }).sort([['Date', 1]]);
        resp.status(200).send(data);
    } catch (error) {
        console.error(error);
        resp.status(500).json({ message: 'Server Error' });
    }
})

const fromdatetodate = asyncHandler(async (req, resp) => {
    let { startDate, endDate } = req.body

    if (!startDate || !endDate) {
        return resp.status(400).json({ msg: 'Start date and end date are required' });
    }

    try {
        let data = await DayMilkEntry.find({
            Date: {
                $gte: startDate,
                $lte: endDate,
            }
        },)
        .sort([['Date', 1]]);
        if(data.length>0) resp.status(200).send(data);
        else throw new Error("Data Not Found")
    } catch (error) {
        console.error(error);
        resp.status(500).json({ msg: error.message });
    }
})

module.exports = {
    oneDayDetail,
    lastdaysTotalData,
    fromdatetodate
}