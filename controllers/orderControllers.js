/** @format */

const Order = require("../models/Order");
const Product = require("../models/Products");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermisions } = require("../utils");

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No Cart Items");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("Please provide tax & shipping fee");
  }
  let orderItems = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id: ${item.product} found`
      );
    }
    const { name, price, image, _id } = dbProduct;
    //crear item construirlo
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    //Add item to order array
    //orderItems es el valor temporal dentro del scope al cual estamos agregado el valor actual de orderItems (de fuera)
    //mas singleOrderItem
    orderItems = [...orderItems, singleOrderItem];
    subTotal += item.amount * price;
  }
  console.log(orderItems);
  console.log(subTotal);

  res.send("Create order");
};

const getAllOrders = async (req, res) => {
  res.send("getAllOrders");
};

const getSingleOrder = async (req, res) => {
  res.send("getSingleOrder");
};

const getCurrentUserOrders = async (req, res) => {
  res.send("getCurrentUserOrders");
};

const updateOrder = async (req, res) => {
  res.send("updateOrder");
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
