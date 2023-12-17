/** @format */

const mongoose = require("mongoose");
const SingleCartSchema = mongoose.Schema({
  name: { type: String, require: true },
  image: { type: String, require: true },
  price: { type: Number, require: true },
  amount: { type: Number, require: true },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
});

const OrderSchema = mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    cartItems: [SingleCartSchema],
    status: {
      type: String,
      enum: [
        "Pending",
        "Failed",
        "Paid",
        "Processing",
        "Sent",
        "Delivered",
        "Required Data",
        "Out Of Stock",
      ],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
module.exports = mongoose.model("SingleCartSchema", SingleCartSchema);
