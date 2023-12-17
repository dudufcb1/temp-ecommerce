/** @format */
const Review = require("../models/Review");
const Product = require("../models/Products");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermisions } = require("../utils");

const createReview = async (req, res) => {
  // Lógica para crear una reseña
  const { product: productId } = req.body;
  req.body.user = req.user.userId;

  if (!productId) {
    throw new CustomError.BadRequestError("Please submit all fields required");
  }

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with such id ${productId}`);
  }
  const alreadySubmited = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmited) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product"
    );
  }
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  // Lógica para obtener todas las reseñas
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  // Lógica para obtener una sola reseña
  const { id: reviewId } = req.params;
  if (!reviewId) {
    throw new CustomError.NotFoundError(
      `Not review with id: ${reviewId} found`
    );
  }
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(
      `Not review with id: ${reviewId} found`
    );
  }
  res.status(StatusCodes.OK).json({ msg: review });
};

const updateReview = async (req, res) => {
  // Lógica para actualizar una reseña
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  if (!reviewId) {
    throw new CustomError.NotFoundError(
      `Not review with id: ${reviewId} found`
    );
  }
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(
      `Not review with id: ${reviewId} found`
    );
  }
  checkPermisions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  review.save();
  res.status(StatusCodes.OK).json({ msg: "Review Updated", review: review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  if (!reviewId) {
    throw new CustomError.NotFoundError(
      `Not review with id: ${reviewId} found`
    );
  }
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(
      `Not review with id: ${reviewId} found`
    );
  }
  checkPermisions(req.user, review.user);
  await Review.findOneAndDelete({ _id: reviewId });

  res.status(StatusCodes.OK).json({ msg: "Success deleted" });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
