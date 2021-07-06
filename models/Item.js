const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sumBooking: {
    type: Number,
    default: 0,
  },
  country: {
    type: String,
    default: 'Indonesia',
  },
  city: {
    type: String,
    required: true,
  },
  isPopular: {
    type: Boolean,
  },
  description: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: 'night',
  },
  imageId: [
    {
      type: ObjectId,
      ref: 'Image',
    },
  ],
  featureId: [
    {
      type: ObjectId,
      ref: 'Feature',
    },
  ],
  activityId: [
    {
      type: ObjectId,
      ref: 'Activity',
    },
  ],
  categoryId: {
    type: ObjectId,
    ref: 'Category',
  },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
