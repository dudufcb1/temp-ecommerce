const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const {
  number
} = require("joi");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlenght: [100, "Name can not be more than 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a product price"],
    default: 0,
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    maxlenght: [1000, "Name can not be more than 1000 characters"],
  },
  image: {
    type: String,
    default: "/uploads/example.jpeg",
  },
  category: {
    type: String,
    required: [true, "Please provide a category"],
    enum: ["office", "kitchen", "bedroom"],
  },
  company: {
    type: String,
    required: [true, "Please provide a company"],
    enum: {
      values: ["ikea", "liddy", "marcos"],
      message: '{VALUE} is not supported'
    },
  },
  colors: {
    type: [String],
    default: ['All'],
    required: true,
  },
  fetured: {
    type: Boolean,
    default: false,
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  inventory: {
    type: Number,
    required: [true, "Please provide a description"],
    default: 15
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema)