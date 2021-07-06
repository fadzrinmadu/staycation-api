const Item = require('../models/Item'); 
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Member = require('../models/Member');

module.exports = {
  landingPage: async (req, res) => {
    try {
      const mostPicked = await Item
        .find()
        .select('_id title country city price unit imageId')
        .limit(5)
        .populate({
          path: 'imageId', 
          select: '_id imageUrl' 
        });

      const activity = await Activity.find();
      const booking = await Booking.find();
      const item = await Item.find();

      const category = await Category.find()
        .select('_id name')
        .limit(3)
        .populate({ 
          path: 'itemId', 
          select: '_id title country city price imageId',
          perDocumentLimit: 4,
          option: { sort: { sumBooking: -1 } },
          populate: {
            path: 'imageId', 
            select: '_id imageUrl',
            perDocumentLimit: 1,
          },
        });

      // category.forEach((data) => {
      //   data.itemId.forEach(async (item, index) => {
      //     // set field isPopular tiap item ke false
      //     const item = await Item.findOne({ _id: item._id });
      //     item.isPopular = false;
      //     await item.save();

      //     // lalu berdasarkan jumlah sumBooking set field urutan 1 isPopular jadi true
      //     if (data.itemId[0] === data.itemId[index]) {
      //       item.isPopular = true;
      //       await item.save();
      //     }
      //   });
      // });

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: 'images/testimonial1.jpg',
        name: 'Happy Family',
        rate: 4.55,
        content: 'What a great trip with my family and I should try again next time soon ...',
        familyName: 'Angga',
        familyOccupation: 'Product Designer',
      };

      res.status(200).json({
        hero: {
          travelers: booking.length,
          treasures: activity.length,
          cities: item.length,
        },
        mostPicked,
        category,
        testimonial,
      });
    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({ path: 'imageId', select: '_id imageUrl' })
        .populate({ path: 'featureId', select: '_id name qty imageUrl' })
        .populate({ path: 'activityId', select: '_id name type imageUrl' });

      const bank = await Bank.find();

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: 'images/testimonial1.jpg',
        name: 'Happy Family',
        rate: 4.55,
        content: 'What a great trip with my family and I should try again next time soon ...',
        familyName: 'Angga',
        familyOccupation: 'Product Designer',
      };

      res.status(200).json({
        ...item._doc,
        bank,
        testimonial,
      });
    } catch(error) {
      console.log(error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },

  bookingPage: async (req, res) => {
    const {
      itemId,
      duration,
      bookingStartDate,
      bookingEndDate,
      firstName,
      lastName,
      email,
      phoneNumber,
      accountHolder,
      bankFrom,
    } = req.body;

    if (!req.file) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (
      itemId === undefined ||
      duration === undefined ||
      bookingStartDate === undefined ||
      bookingEndDate === undefined ||
      firstName === undefined ||
      lastName === undefined ||
      email === undefined ||
      phoneNumber === undefined ||
      accountHolder === undefined ||
      bankFrom === undefined) {
      res.status(404).json({ message: 'Please fill out the form' });
    }

    const item = await Item.findOne({ _id: itemId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.sumBooking += 1;
    await item.save();

    let total = item.price * duration;
    let tax = total * 0.10;
    const invoice = Math.floor(1000000 + Math.random() * 9000000);

    // Menyimpan data member
    const member = await Member.create({
      firstName,
      lastName,
      email,
      phoneNumber,
    });

    const newBooking = {
      bookingStartDate,
      bookingEndDate,
      invoice,
      itemId: {
        _id: item._id,
        title: item.title,
        price: item.price,
        duration: duration,
      },
      total: total += tax,
      memberId: member._id,
      payments: {
        proofPayment: `images/${req.file.filename}`,
        bankFrom: bankFrom,
        accountHolder: accountHolder,
      },
    };
    const booking = await Booking.create(newBooking);

    res.status(200).json({ message: 'Success booking', booking });
  },
};
