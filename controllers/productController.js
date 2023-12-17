/** @format */
const path = require("path");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermisions,
} = require("../utils");
const Product = require("../models/Products");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const createProduct = async (req, res) => {
  //Importante, a req.body le clavamos el usuario que viene desde la cookie en reQ.user.userId
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

getAllProducts = async (req, res) => {
  const products = await Product.find({}).populate("reviews");
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

getSingleProduct = async (req, res) => {
  console.log("Aca ando");
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    //este error salta, si el formato del ID de mongo es correcto, de otra forma, te tira el cast que
    // manejamos desde errorhandlermiddleware
    throw new CustomError.NotFoundError(`No product ${productId} found`);
  }
  res.status(StatusCodes.OK).json({
    product,
  });
};

updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    //este error salta, si el formato del ID de mongo es correcto, de otra forma, te tira el cast que
    // manejamos desde errorhandlermiddleware
    throw new CustomError.NotFoundError(`No product ${productId} found`);
  }
  res.status(StatusCodes.OK).json({
    product,
  });
};
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product ${productId} found`);
  }
  // Utiliza findOneAndDelete en lugar de findOneAndRemove
  await Product.findOneAndDelete({ _id: productId });

  res.status(StatusCodes.OK).json({ msg: "Success! Product removed" });
};

const uploadImage = async (req, res) => {
  let productImage = req.files.image; // imagen
  //agrego este check, para evitar que me suban basura al tmp folder y no se elimina al no devolver una respuesta cloudinary
  if (!productImage.mimetype.startsWith("image")) {
    fs.unlinkSync(req.files.image.tempFilePath);
    throw new CustomError.BadRequestError("Please upload an image file");
  }
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "06pictures",
    }
  ); // se accede al método mv para mover la imagen a la ruta especificada
  fs.unlinkSync(req.files.image.tempFilePath);
  return res.status(StatusCodes.OK).json({
    image: { src: result.secure_url },
    message: `Image uploaded successfully`,
  });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
