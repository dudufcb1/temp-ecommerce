/** @format */

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { number } = require("joi");
const Review = require("../models/Review");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpg",
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
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["All"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: [true, "Please provide an inventory"],
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual solo permite obtener el total de registros, no es flexible a la hora de hacer queries específicamente de uno y otro registro
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id", // que exportamos a "reviews"
  foreignField: "product", // como se llama _id de aquí, allá en reviews
  justOne: false,
});

//Se importa el model, y se usa this._conditions no funciona el this._id normal
ProductSchema.pre("findOneAndDelete", async function (next) {
  console.log(this._conditions._id);
  await Review.deleteMany({ product: this._conditions._id });
});

module.exports = mongoose.model("Product", ProductSchema);

/* ProductSchema.post("findOneAndDelete", async function (doc) {
  console.log("vine por aqui");
  if (doc) {
    console.log(doc);
    const productId = doc._id;

    try {
      // Elimina todas las reviews asociadas al producto
      await Review.deleteMany({ product: productId });
    } catch (error) {
      console.error(error);
    }
  }
});
 */
