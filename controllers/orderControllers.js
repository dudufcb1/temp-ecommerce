/** @format */

const Order = require("../models/Order");
const Product = require("../models/Products");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermisions } = require("../utils");

//FAKE API STRIPE
const fakeStripeApi = async (amount, currency) => {
  const client_secret = "SomeRandomValue";
  return { client_secret, amount };
};

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

  const total = tax + shippingFee + subTotal;
  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: "usd",
  });
  //se crea la orden con estos datos (este objeto)
  const order = await Order.create({
    orderItems,
    total,
    subTotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({ order });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, numOrders: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order ${orderId} found`);
  }
  checkPermisions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const orderExists = await Order.findOne({ _id: orderId });
  if (!orderExists) {
    throw new CustomError.NotFoundError(`No order ${orderId} found`);
  }

  const order = await Order.findOne({ _id: orderId });
  checkPermisions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "Paid";
  await order.save();
  res.status(StatusCodes.OK).json({
    order,
  });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
