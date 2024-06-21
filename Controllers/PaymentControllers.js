const mongoose=require('mongoose')
const PaymentDetail = require("../Database/PaymentDetail");
const MilkEntry = require('../Database/MilkEntry');
const Vender = require('../Database/VenderDetail');
const asyncHandler = require('express-async-handler')
const moment = require('moment');

const paymentDone = asyncHandler(async (req, resp) => {
    let { id } = req.params;
    let { PaymentArray,PaidAmount } = req.body
    if(!mongoose.Types.ObjectId.isValid(id)){
        return resp.status(400).send({ msg: 'Invalid Vendor ID' });
    }
    try {
        let vender = await Vender.findById(id)
        if (vender) {
            try {
                let TotalAmount = 0;
                let milkEntryIds = [];
                // Map through PaymentArray and fetch milkEntry details
                const milkEntries = await Promise.all(
                    PaymentArray.map(async (item) => {
                        let milkDetail = await MilkEntry.findById(item);
                        if (milkDetail) {
                            TotalAmount += Number.parseInt(milkDetail.NetAmount);
                            milkEntryIds.push(milkDetail._id);
                            return milkDetail;
                        } else {
                            throw new Error("Milk Entry Not Found");
                        }
                    })
                );
                let TotalQuantity=milkEntries.reduce((acc,item)=>{
                    return acc+Number.parseFloat(item.Quantity)
                },0)

                milkEntries.sort(function(a, b) {
                    return new Date(a.DateDetail) - new Date(b.DateDetail);
                });
                let from=milkEntries[0].DateDetail
                let  to=new Date();
                if(milkEntries.length>1){
                   to=milkEntries[milkEntries.length-1].DateDetail
                }
                // Update milkEntries with Payment = 'Done' and save them
                await Promise.all(
                    milkEntries.map(async (milkDetail) => {
                        milkDetail.Payment = 'Done';
                        await milkDetail.save();
                    })
                );
                let UnpaidAmount=TotalAmount-PaidAmount;

                let paymentDetails = new PaymentDetail({
                    Vender: id,
                    Payments: milkEntryIds,
                    TotalAmount,
                    TotalQuantity,
                    PaidAmount,
                    UnpaidAmount,
                    from,
                    to
                });

                paymentDetails = await paymentDetails.save();
                if (paymentDetails._id) {
                    await vender.Payments.push(paymentDetails._id)
                    await vender.save()
                    resp.send({ msg: "Recorded Successfully" });
                } else {
                    throw new Error("Payment Not Saved");
                }
            } catch (error) {
                resp.status(400).send({ msg: error.message });
            }
        } else {
            throw new Error("Invalid Vendor ID");
        }
    } catch (error) {
        resp.status(400).send({ msg: error.message })
    }
})

const getVenderAllPayments=asyncHandler(async(req,resp)=>{
    const {VenderId,days}=req.body 
    if(!mongoose.Types.ObjectId.isValid(VenderId)){
        return resp.status(400).send({ msg: 'Invalid Vendor ID' });
    } 
    let vender=await Vender.findById(VenderId)
     if(vender){
        if(!days){
            try{
                let payments=await PaymentDetail.find({Vender:VenderId})
                .populate({
                    path: 'Payments',
                    options: { sort: { DateDetail: 1 } }
                  }).populate('Vender')
                  .exec();
                  if(payments.length>0) resp.send(payments)
                  else throw new Error("Data Not Found")
            }
            catch(error){
                resp.status(500).send({msg:error.message})
            }
        }
        else{
            try{
                const daysAgo = moment().subtract(days, 'days').format('YYYY-MM-DD');
                let payments=await PaymentDetail.find({Vender:VenderId}).populate({
                    path: 'Payments',
                    match:{DateDetail: { $gte: daysAgo }},
                    options: { sort: { DateDetail: 1 } }
                  }).populate('Vender')
                  .exec();
                  if(payments.length>0) resp.send(payments)
                  else throw new Error("Data Not Found")
            }
            catch(error){
                resp.status(500).send({msg:error.message})
            }
        }
    }
    else{
        resp.status(404).send({msg:"Invalid Vender ID"})
    }
})

const getVendorPaymentsDateTodate = async (req, resp) => {
    const { VenderId, startDate, endDate } = req.body;
    if (!mongoose.Types.ObjectId.isValid(VenderId)) {
        return resp.status(400).send({ msg: 'Invalid Vendor ID' });
    }

    let vendor = await Vender.findById(VenderId);

    if (vendor) {
        try {
            const payments = await PaymentDetail.find({
                $and: [
                  { Vender: VenderId },
                  {
                    PaymentDate: {
                      $gte: startDate,
                      $lte: endDate
                    }
                  }
                ]
              })

            // const payments=await PaymentDetail.find({PaymentDate:{$gte:startDate}})
            .populate({
                path: 'Payments',
                options: { sort: { DateDetail: 1 } }
            })
            .populate('Vender')
            .exec();

            if (payments.length > 0) {
                resp.send(payments);
            } else {
                throw new Error("Data Not Found");
            }
        } catch (error) {
            resp.status(500).send({ msg: error.message });
        }
    } else {
        resp.status(404).send({ msg: "Invalid Vendor ID" });
    }
};

module.exports= {
    paymentDone,
    getVenderAllPayments,
    getVendorPaymentsDateTodate
}
