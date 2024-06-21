require('../Database/config')
const mongoose = require('mongoose');
const Vender = require('../Database/VenderDetail')
const asyncHandler = require('express-async-handler')
const moment = require('moment');

const newVender = asyncHandler(async (req, resp) => {
  try {
    let data = await Vender(req.body)
    data = await data.save()
    if (data._id) resp.send({ msg: 'Successfull' })
    else throw new Error({ msg: "Unsuccessfull" })
  } catch (error) {
    resp.status(400).send(error.message)
  }
}
)
const venderupdate = asyncHandler(async (req, resp) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return resp.status(400).send({ msg: 'Invalid Vendor ID' });
  }
  try {
    let data = await Vender.findByIdAndUpdate(id, { ...req.body }, { new: true })
    if (data) {
      resp.send({ msg: 'Successful' });
    } else {
      throw new Error('Unsuccessful');
    }
  } catch (error) {
    resp.status(400).send({ msg: error.message })
  }
}
)

const venderTable = asyncHandler(async (req, resp) => {
  try {
    let data = await Vender.find().populate('MilkDetail')
    if (data.length > 0) resp.send(data)
    else throw new Error({ msg: "Failed To fetch" })
  } catch (error) {
    resp.status(400).send(error.message)
  }
}
)

const venderName = asyncHandler(async (req, resp) => {
  try {
    let result = await Vender.find()
    if (result.length > 0) {
      resp.send(result)
    }
    else throw new Error("No Vender Found")
  } catch (error) {
    resp.status(400).send({ msg: error.message })
  }
})

const venderById = asyncHandler(async (req, resp) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return resp.status(400).send({ msg: 'Invalid Vendor ID' });
  }
  try {
    let result = await Vender.findOne({ _id: id })
    if (result) {
      resp.send({ Name: result.Name, Rate: result.Rate, FatPass: result.FatPass })
    }
    else throw new Error("No Vender Found")
  } catch (error) {
    resp.status(400).send({ msg: error.message })
  }
})

const venderDetail = asyncHandler(async (req, resp) => {
  try {
    let data = await Vender.findById(req.params.id).populate({
      path: 'MilkDetail',
      match: {
        Payment: { $ne: 'Done' } // Add this line
      },
      options: { sort: { DateDetail: 1 } }
    })
      .exec();
    if (data) {
      resp.status(200).send(data)
    }
    else {
      throw new Error("Vender Not Found")
    }
  } catch (error) {
    resp.status(400).send(error.message)
  }
})

const venderAllEntries = asyncHandler(async (req, resp) => {
  try {
    let data = await Vender.findById(req.params.id).populate({
      path: 'MilkDetail',
      options: { sort: { DateDetail: 1 } }
    })
      .exec();
    if (data) {
      resp.status(200).send(data)
    }
    else {
      throw new Error("Vender Not Found")
    }
  } catch (error) {
    resp.status(400).send(error.message)
  }
})

const lastDaysEntries = asyncHandler(async (req, res) => {
  try {
    const { venderId, days } = req.body;
    const vender = await Vender.findById(venderId);
    if (!vender) {
      return res.status(404).json({ msg: 'Vender not found' });
    }
    const daysAgo = moment().subtract(days, 'days').format('YYYY-MM-DD');
    const entries = await Vender.findById(venderId, 'MilkDetail')
      .populate({
        path: 'MilkDetail',
        match: {
          $and: [
            { DateDetail: { $gte: daysAgo } },
            { Payment: { $ne: 'Done' } } // Add this line
          ]
        },
        options: { sort: { DateDetail: 1 } }
      })
      .exec();
    res.status(200).send(entries.MilkDetail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})

const alllastDaysEntries = asyncHandler(async (req, res) => {
  try {
    const { venderId, days } = req.body;
    const vender = await Vender.findById(venderId);
    if (!vender) {
      return res.status(404).json({ msg: 'Vender not found' });
    }
    const daysAgo = moment().subtract(days, 'days').format('YYYY-MM-DD');
    const entries = await Vender.findById(venderId, 'MilkDetail')
      .populate({
        path: 'MilkDetail',
        match: {
          DateDetail: { $gte: daysAgo } // Add this line
        },
        options: { sort: { DateDetail: 1 } }
      })
      .exec();
    res.status(200).send(entries.MilkDetail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})

const allDateToDateEntries = asyncHandler(async (req, res) => {
  try {
    const { venderId, startDate, endDate } = req.body;

    // Validate the provided startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and end date are required' });
    }

    const vendor = await Vender.findById(venderId);
    if (!vendor) {
      return res.status(404).json({ msg: 'Vendor not found' });
    }

    const entries = await Vender.findById(venderId, 'MilkDetail')
      .populate({
        path: 'MilkDetail',
        match: {
          DateDetail: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        options: { sort: { DateDetail: 1 } },
      })
      .exec();
    res.status(200).send(entries.MilkDetail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

const dateToDateEntries = asyncHandler(async (req, res) => {
  try {
    const { venderId, startDate, endDate } = req.body;

    // Validate the provided startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and end date are required' });
    }

    const vendor = await Vender.findById(venderId);
    if (!vendor) {
      return res.status(404).json({ msg: 'Vendor not found' });
    }

    const entries = await Vender.findById(venderId, 'MilkDetail')
      .populate({
        path: 'MilkDetail',
        match: {
          $and: [
            {
              DateDetail: {
                $gte: startDate,
                $lte: endDate,
              }
            },
            {
              Payment: { $ne: 'Done' }
            }]
        },
        options: { sort: { DateDetail: 1 } },
      })
      .exec();
    res.status(200).send(entries.MilkDetail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = {
  newVender,
  venderupdate,
  venderTable,
  venderName,
  venderById,
  venderDetail,
  lastDaysEntries,
  venderAllEntries,
  alllastDaysEntries,
  allDateToDateEntries,
  dateToDateEntries,
}