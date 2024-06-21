const mongoose = require('mongoose')

const paymentDetailSchema = new mongoose.Schema({
    Vender: { type: mongoose.Schema.Types.ObjectId, ref: 'VenderDetail' },
    Payments:[{ type: mongoose.Schema.Types.ObjectId, ref: 'MilkEntry' }],
    PaymentDate: String,
    TotalAmount:{type : Number , default : 0},
    PaidAmount:{type : Number ,default : 0},
    UnpaidAmount:{type : Number ,default : 0},
    TotalQuantity:{type : Number ,default : 0},
    from:String,
    to:String,
},{
    timestamps: true
})

// function getCurrentDate() {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
//     const day = String(now.getDate()).padStart(2, '0');

//     return `${year}-${month}-${day}`;
// }

// paymentDetailSchema.pre("save", async function (next) {
//     if (!this.isModified) {
//         next();
//     }
//     this.PaymentDate = getCurrentDate();
    
// });

paymentDetailSchema.pre('save', function (next) {
    if (this.isNew) {
      this.PaymentDate = new Date().toISOString().slice(0, 10);
    }
    next();
  });


const PaymentDetail = mongoose.model('PaymentDetail', paymentDetailSchema);
module.exports = PaymentDetail;